import { describe, it, expect, vi, beforeEach } from "vitest";
import { createComponentStateOutput } from "../../src/ComponentStateOutput/createComponentStateOutput";
import { getStructuredPathInfo } from "../../src/StateProperty/getStructuredPathInfo";
import { getStatePropertyRef } from "../../src/StatePropertyRef/StatepropertyRef";
import type { IComponentStateBinding } from "../../src/ComponentStateBinding/types";

type StructiveError = Error & { code?: string; context?: Record<string, unknown> };

function captureError(fn: () => unknown): StructiveError {
  try {
    fn();
  } catch (err) {
    return err as StructiveError;
  }
  throw new Error("Expected error to be thrown");
}

// テスト用の簡易バインディングモックを構築
function makeBindingMock(opts?: {
  childPattern?: string;
  parentFromChild?: (child: string) => string;
}) {
  const childPattern = opts?.childPattern ?? "child.values.*.foo";
  const childInfo = getStructuredPathInfo(childPattern);
  const childPath = childInfo.pattern; // startsWith 判定に使うキー
  const bindingByChildPath = new Map<string, any>();

  const engine = {
    getPropertyValue: vi.fn(() => "PARENT_VALUE"),
    getListIndexes: vi.fn(() => [{ sid: "LI#X", at: () => null }]),
    pathManager: {
      addPath: vi.fn(),
    },
    setPropertyValue: vi.fn(),
  } as any;

  const defaultListIndex = { sid: "LI#A", at: () => null } as any;
  const fakeBinding: any = {
    engine,
    bindingState: { listIndex: defaultListIndex },
  };
  bindingByChildPath.set(childPath, fakeBinding);

  const binding: IComponentStateBinding & any = {
    startsWithByChildPath: vi.fn((pi: any) => (pi.pattern.startsWith("child.values") ? childPath : null)),
    toParentPathFromChildPath: vi.fn((p: string) => (opts?.parentFromChild ? opts.parentFromChild(p) : p.replace(/^child\./, "parent."))),
    bindingByChildPath,
  };
  const childEngine = {
    pathManager: {
      lists: new Set<string>(),
    },
  } as any;
  return { binding, engine, childEngine, childInfo, childPath, fakeBinding };
}

describe("createComponentStateOutput", () => {
  let binding: IComponentStateBinding & any;
  let engine: any;
  let childInfo: any;
  let fakeBinding: any;
  let childEngine: any;

  beforeEach(() => {
    const m = makeBindingMock();
    binding = m.binding;
    engine = m.engine;
    childInfo = m.childInfo;
    fakeBinding = m.fakeBinding;
    childEngine = m.childEngine;
  });

  it("startsWith: 子側パターンにマッチすると true", () => {
    const out = createComponentStateOutput(binding, childEngine);
    expect(out.startsWith(childInfo)).toBe(true);

    const other = getStructuredPathInfo("other.path");
    expect(out.startsWith(other)).toBe(false);
  });

  it("get: 子ref -> 親ref に変換して engine.getPropertyValue を呼ぶ（listIndex は childRef が優先、なければ bindingState.listIndex）", () => {
    childEngine.pathManager.lists.add(childInfo.pattern);
    const out = createComponentStateOutput(binding, childEngine);
    // child 側の ref（listIndex なし）
    const childRefNoLI = getStatePropertyRef(childInfo, null);
    const v1 = out.get(childRefNoLI);
    expect(v1).toBe("PARENT_VALUE");
    expect(engine.getPropertyValue).toHaveBeenCalledTimes(1);
    const calledParentRef1 = (engine.getPropertyValue as any).mock.calls[0][0];
    expect(calledParentRef1.info.pattern.startsWith("parent.")).toBe(true);
    // listIndex は bindingState.listIndex が使われる
    expect(calledParentRef1.listIndex).toBe(fakeBinding.bindingState.listIndex);

    // child 側の ref（listIndex あり）
    const childRefWithLI = getStatePropertyRef(childInfo, [{ sid: "LI#B", at: () => null }] as any);
    const v2 = out.get(childRefWithLI);
    expect(v2).toBe("PARENT_VALUE");
    const calledParentRef2 = (engine.getPropertyValue as any).mock.calls[1][0];
    expect(calledParentRef2.listIndex).not.toBe(fakeBinding.bindingState.listIndex);
  });

  it("set: 親ref に変換して parentBinding.engine.setPropertyValue を呼ぶ", () => {
    childEngine.pathManager.lists.add(childInfo.pattern);
    const out = createComponentStateOutput(binding, childEngine);
    const childRef = getStatePropertyRef(childInfo, null);
    const ok = out.set(childRef, 123);
    expect(ok).toBe(true);
    expect(engine.setPropertyValue).toHaveBeenCalledTimes(1);
    expect(engine.setPropertyValue.mock.calls[0][1]).toBe(123);
  });

  it("getListIndexes: 親ref に変換して engine.getListIndexes を呼ぶ（listIndex は childRef をそのまま使用）", () => {
    childEngine.pathManager.lists.add(childInfo.pattern);
    const out = createComponentStateOutput(binding, childEngine);
    const childRef = getStatePropertyRef(childInfo, [{ sid: "LI#C", at: () => null }] as any);
    const ret = out.getListIndexes(childRef);
    expect(Array.isArray(ret)).toBe(true);
    expect(engine.getListIndexes).toHaveBeenCalledTimes(1);
    const calledParentRef = (engine.getListIndexes as any).mock.calls[0][0];
    // listIndex は childRef のもの
    expect(calledParentRef.listIndex).toBe(childRef.listIndex);
    // パス登録ロジックが呼ばれることを確認
    expect(engine.pathManager.addPath).toHaveBeenCalledTimes(1);
    expect(engine.pathManager.addPath).toHaveBeenCalledWith(calledParentRef.info.pattern, true);
  });

  it("エラー: startsWithByChildPath が null の場合は raiseError", () => {
    const out = createComponentStateOutput({
      ...binding,
      startsWithByChildPath: vi.fn(() => null),
    }, childEngine);
    const childRef = getStatePropertyRef(childInfo, null);
    
    const getErr = captureError(() => out.get(childRef));
    expect(getErr.message).toMatch(/Child path not found/);
    expect(getErr.code).toBe("CSO-101");
    expect(getErr.context).toEqual(
      expect.objectContaining({ where: "ComponentStateOutput.get", path: childInfo.pattern })
    );

    const setErr = captureError(() => out.set(childRef, 1));
    expect(setErr.message).toMatch(/Child path not found/);
    expect(setErr.code).toBe("CSO-101");
    expect(setErr.context?.where).toBe("ComponentStateOutput.set");

    const listErr = captureError(() => out.getListIndexes(childRef));
    expect(listErr.message).toMatch(/Child path not found/);
    expect(listErr.code).toBe("CSO-101");
    expect(listErr.context?.where).toBe("ComponentStateOutput.getListIndexes");
  });

  it("エラー: bindingByChildPath に存在しない場合は raiseError", () => {
    // startsWithByChildPath は子側にマッチさせるが、bindingByChildPath に対応するエントリが無い状況を作る
    const m = makeBindingMock();
    const b2 = {
      ...m.binding,
      // 子側にはマッチさせる
      startsWithByChildPath: vi.fn(() => m.childInfo.pattern),
      // しかしマップは空
      bindingByChildPath: new Map<string, any>(),
    } as any;
    const out = createComponentStateOutput(b2, childEngine);
    const ref = getStatePropertyRef(childInfo, null);
    
    const getErr = captureError(() => out.get(ref));
    expect(getErr.message).toMatch(/Child binding not registered/);
    expect(getErr.code).toBe("CSO-102");
    expect(getErr.context).toEqual(
      expect.objectContaining({ where: "ComponentStateOutput.get", childPath: m.childInfo.pattern })
    );

    const setErr = captureError(() => out.set(ref, 1));
    expect(setErr.message).toMatch(/Child binding not registered/);
    expect(setErr.code).toBe("CSO-102");
    expect(setErr.context?.where).toBe("ComponentStateOutput.set");

    const listErr = captureError(() => out.getListIndexes(ref));
    expect(listErr.message).toMatch(/Child binding not registered/);
    expect(listErr.code).toBe("CSO-102");
    expect(listErr.context?.where).toBe("ComponentStateOutput.getListIndexes");
  });

  it("getListIndexes: 同じパスで複数回呼ばれても pathManager.addPath は1回のみ", () => {
    childEngine.pathManager.lists.add(childInfo.pattern);
    const out = createComponentStateOutput(binding, childEngine);
    const childRef = getStatePropertyRef(childInfo, [{ sid: "LI#D", at: () => null }] as any);
    
    // 1回目
    out.getListIndexes(childRef);
    expect(engine.pathManager.addPath).toHaveBeenCalledTimes(1);
    
    // 2回目 - 同じパターン
    out.getListIndexes(childRef);
    expect(engine.pathManager.addPath).toHaveBeenCalledTimes(1); // 増えない
    
    // 3回目 - 同じパターン
    out.getListIndexes(childRef);
    expect(engine.pathManager.addPath).toHaveBeenCalledTimes(1); // 増えない
  });
});
