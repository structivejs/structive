import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBindingNodeFor } from "../../../src/DataBinding/BindingNode/BindingNodeFor";
import { createBindingStub, createEngineStub, createRendererStub } from "../helpers/bindingNodeHarness";
import * as registerTemplateMod from "../../../src/Template/registerTemplate";
import * as registerAttrMod from "../../../src/BindingBuilder/registerDataBindAttributes";
import * as BindContentMod from "../../../src/DataBinding/BindContent";
import * as GetStructuredPathInfoMod from "../../../src/StateProperty/getStructuredPathInfo";
import { GetByRefSymbol, GetListIndexesByRefSymbol } from "../../../src/StateClass/symbols";

type StructiveError = Error & { code?: string; context?: Record<string, unknown> };

function captureError(fn: () => unknown): StructiveError {
  try {
    fn();
  } catch (err) {
    return err as StructiveError;
  }
  throw new Error("Expected error to be thrown");
}

describe("BindingNodeFor coverage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function setupTemplate() {
    const tpl = document.createElement("template");
    tpl.innerHTML = `<div>for-item</div>`;
    vi.spyOn(registerTemplateMod, "getTemplateById").mockReturnValue(tpl);
    vi.spyOn(registerAttrMod, "getDataBindAttributesById").mockReturnValue([] as any);
  }

  function createIndexes(n: number) {
    return Array.from({ length: n }, (_, i) => ({ index: i }) as any);
  }

  function captureBindContentMap() {
    const originalSet = WeakMap.prototype.set;
    let targetMap: WeakMap<any, any> | undefined;
    const setSpy = vi.spyOn(WeakMap.prototype, "set").mockImplementation(function (this: WeakMap<any, any>, key: any, value: any) {
      if (!targetMap && value && typeof value.mountAfter === "function") {
        targetMap = this;
      }
      return originalSet.call(this, key, value);
    });
    return {
      getMap(): WeakMap<any, any> {
        if (!targetMap) {
          throw new Error("BindContent map not captured");
        }
        return targetMap;
      },
      restore() {
        setSpy.mockRestore();
      },
    };
  }

  it("assignValue は未実装エラー", () => {
    const engine = createEngineStub();
    const comment = document.createComment("@@|310");
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;
    const err = captureError(() => node.assignValue([1,2,3]));
    expect(err.code).toBe("BIND-301");
    expect(err.message).toMatch(/Binding assignValue not implemented/);
  });

  it("newIndexes に応じた BindContent のマウント（最小限）", () => {
    const engine = createEngineStub();
    const comment = document.createComment("@@|200");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);

    setupTemplate();

    const indexes = [{ index: 0 } as any, { index: 1 } as any];
    const listDiff = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: indexes,
      adds: new Set(indexes),
      removes: new Set(),
      changeIndexes: new Set(),
    } as any;

    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: () => listDiff,
      unmountBindContent: vi.fn(),
    });

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;
    node.applyChange(renderer);

    expect(node.bindContents).toHaveLength(2);
    expect(renderer.unmountBindContent).not.toHaveBeenCalled();
    expect(container.childNodes.length).toBeGreaterThan(1);
  });

  it("updatedBindings の管理は Binding 側で行われる", () => {
    const engine = createEngineStub();
    const comment = document.createComment("@@|300");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);
    const renderer = createRendererStub({
      updatedBindings: new Set([binding]),
      calcListDiff: vi.fn(),
      readonlyState: {},
    });
    node.applyChange(renderer);
    expect(renderer.calcListDiff).toHaveBeenCalledTimes(1);
    expect(container.childNodes.length).toBe(1); // コメントのみ
  });

  it("全追加 -> 全削除最適化 -> プール再利用（createBindContent が増えない）", () => {
    setupTemplate();
    const spyCreate = vi.spyOn(BindContentMod, "createBindContent");

    const engine = createEngineStub();
    const comment = document.createComment("@@|301");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // 1) 全追加（2件）: DocumentFragment 経由
    const idxA = createIndexes(2);
    const listDiff1 = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idxA,
      adds: new Set(idxA),
      removes: new Set(),
    } as any;
    const renderer1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => listDiff1) });
    node.applyChange(renderer1);
    expect(container.childNodes.length).toBeGreaterThan(1);
    expect(spyCreate).toHaveBeenCalledTimes(2);

    // 2) 全削除最適化（old の件数 == removes サイズ）
    const listDiff2 = {
      oldListValue: [{}, {}],
      newListValue: [],
      newIndexes: [],
      adds: new Set(),
      removes: new Set(idxA), // 2件とも削除
    } as any;
    const renderer2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => listDiff2) });
    node.applyChange(renderer2);
    // コメントのみ残る
    expect(container.childNodes.length).toBe(1);
    // プールへ移動するだけで新規作成はなし
    expect(spyCreate).toHaveBeenCalledTimes(2);

    // 3) 再度 2 件追加（プール再利用で createBindContent は増えない）
    const idxB = createIndexes(2).map((x) => ({ index: x.index }) as any);
    const listDiff3 = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idxB,
      adds: new Set(idxB),
      removes: new Set(),
    } as any;
    const renderer3 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => listDiff3) });
    node.applyChange(renderer3);
    expect(container.childNodes.length).toBeGreaterThan(1);
    expect(spyCreate).toHaveBeenCalledTimes(2); // 増えない -> プール再利用
  });

  it("部分削除（1件）と 非全追加（1件）", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|302");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // 初期 3件追加
    const idx0 = createIndexes(3);
    const diffAdd3 = {
      oldListValue: [],
      newListValue: [{}, {}, {}],
      newIndexes: idx0,
      adds: new Set(idx0),
      removes: new Set(),
    } as any;
    const r1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd3) });
    node.applyChange(r1);
    const childCountAfter3 = container.childNodes.length;
    expect(childCountAfter3).toBeGreaterThan(1);

    // 中央の1件を削除（部分削除）
    const idxRemain = [idx0[0], idx0[2]];
    const diffRemove1 = {
      oldListValue: [{}, {}, {}],
      newListValue: [{}, {}],
      newIndexes: idxRemain,
      adds: new Set(),
      removes: new Set([idx0[1]]),
    } as any;
    const r2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffRemove1) });
    node.applyChange(r2);
    expect(container.childNodes.length).toBeLessThan(childCountAfter3);

    // 新しい1件を追加（非全追加）
    const idxNew = [...idxRemain, { index: 2 } as any];
    const diffAdd1 = {
      oldListValue: [{}, {}],
      newListValue: [{}, {}, {}],
      newIndexes: idxNew,
      adds: new Set([idxNew[2]]),
      removes: new Set(),
    } as any;
    const r3 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd1) });
    node.applyChange(r3);
    expect(container.childNodes.length).toBe(childCountAfter3); // 3件に戻る想定
  });

  it("parentNode が null だとエラー", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|303");
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(1);
    const diff = {
      oldListValue: [],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff) });
  expect(() => node.applyChange(renderer)).toThrowError(/Parent node not found/i);
  });

  it("removes が undefined でも例外なし（空更新）", () => {
    const engine = createEngineStub();
    const comment = document.createComment("@@|306");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const diff = {
      oldListValue: [],
      newListValue: [],
      newIndexes: [],
      adds: undefined,
      removes: undefined,
    } as any;
    const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff) });
    expect(() => node.applyChange(renderer)).not.toThrow();
    expect(container.childNodes.length).toBe(1);
  });

  it("readonlyState が undefined/null を返しても空扱い", () => {
    const engine = createEngineStub();
    const comment = document.createComment("@@|306");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const diff = {
      oldListValue: [],
      newListValue: undefined,
      newIndexes: [],
      adds: new Set(),
      removes: new Set(),
    } as any;
    const renderer = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: () => ({
          [Symbol.iterator]() {
            return {
              next() {
                return { done: true, value: undefined };
              },
            };
          },
        }),
        [GetListIndexesByRefSymbol]: () => null,
      },
      calcListDiff: vi.fn(() => diff),
    });

    // 現在の実装では undefined の場合は配列チェックでエラーになる
    expect(() => node.applyChange(renderer)).toThrow(/Loop value is not array/);
  });

  it("Loop value が null の場合、receivedType に null を設定する", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|406");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    const renderer = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => null),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });

    const err = captureError(() => node.applyChange(renderer));
    expect(err.message).toBe("Loop value is not array");
    expect(err.context?.receivedType).toBe("null");
  });

  it("removes: 未登録インデックスで BindContent not found", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|307");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(2);
    const capture = captureBindContentMap();
    const addDiff = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => addDiff) });
    node.applyChange(rendererAdd);
    const bindContentMap = capture.getMap();
    capture.restore();

    bindContentMap.delete(idx[1]);

    const removeDiff = {
      oldListValue: [{}, {}],
      newListValue: [{}],
      newIndexes: [idx[0]],
      adds: new Set(),
      removes: new Set([idx[1]]),
    } as any;
    const rendererRemove = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => removeDiff) });
    expect(() => node.applyChange(rendererRemove)).toThrow(/BindContent not found/);
  });

  it("reuse: 未登録だと BindContent not found", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|308");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(2);
    const capture = captureBindContentMap();
    const addDiff = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => addDiff) });
    node.applyChange(rendererAdd);
    const bindContentMap = capture.getMap();
    capture.restore();

    // WeakMapから削除してエラーを発生させる
    bindContentMap.delete(idx[1]);

    // 新しいIndexを追加してhasAdds=trueにし、既存のIndexを再利用しようとする
    const newIdx = createIndexes(1);
    const reuseDiff = {
      oldListValue: [{}, {}],
      newListValue: [{}, {}, {}],
      newIndexes: [idx[0], idx[1], newIdx[0]],
      adds: new Set([newIdx[0]]),
      removes: new Set(),
    } as any;
    const rendererReuse = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => reuseDiff) });
    expect(() => node.applyChange(rendererReuse)).toThrow(/BindContent not found/);
  });

  it("reuse: 並びが正しければ再マウントしない（insertBefore が呼ばれない）", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|309");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // 初回: 全追加で2件
    const idx2 = createIndexes(2);
    const diff1 = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx2,
      adds: new Set(idx2),
      removes: new Set(),
    } as any;
    const r1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff1) });
    node.applyChange(r1);

    // 2回目: 順序そのまま、追加なし（再利用のみ）
    const diff2 = {
      oldListValue: [{}, {}],
      newListValue: [{}, {}],
      newIndexes: idx2,
      adds: new Set(),
      removes: new Set(),
    } as any;
    const r2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff2) });
    const spyInsert = vi.spyOn(container, "insertBefore");
    node.applyChange(r2);
    expect(spyInsert).not.toHaveBeenCalled();
  });

  it("プールインデックスは初期値 -1", () => {
    const engine = createEngineStub();
    const comment = document.createComment("@@|304");
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;
    expect(node._bindContentPoolIndex).toBe(-1);
  });

  it("_loopInfo はキャッシュされ、getStructuredPathInfo は1回のみ", () => {
    const spy = vi.spyOn(GetStructuredPathInfoMod, "getStructuredPathInfo");
    const engine = createEngineStub();
    const comment = document.createComment("@@|305");
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;
    // 2回アクセス
    const a = node._loopInfo;
    const b = node._loopInfo;
    expect(a).toBe(b);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("全削除最適化: 親ノードがこのノードのみを含む場合の最適化", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|310");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // 初期: 2件追加
    const idx2 = createIndexes(2);
    const diff1 = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx2,
      adds: new Set(idx2),
      removes: new Set(),
    } as any;
    const r1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff1) });
    node.applyChange(r1);
    expect(container.childNodes.length).toBeGreaterThan(1);

    // 親ノードにテキストノード（空白）を追加してブランクノード処理をテスト
    const blankTextNode = document.createTextNode("   ");
    container.appendChild(blankTextNode);
    const initialLength = container.childNodes.length;
    
    // 全削除: 親ノードがこのノードのみを含む場合（ブランクノードは無視）
    const diff2 = {
      oldListValue: [{}, {}],
      newListValue: [],
      newIndexes: [],
      adds: new Set(),
      removes: new Set(idx2),
    } as any;
    const r2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff2) });
    node.applyChange(r2);
    // 全削除最適化でinnerHTML = '' が実行されるため、コメントのみ残る（ブランクテキストも削除される）
    expect(container.childNodes.length).toBe(1);
    expect(container.firstChild).toBe(comment);
  });

  it("全追加最適化: DocumentFragment を使用した一括追加", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|311");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    // DOMに接続してisConnectedをtrueにする
    document.body.appendChild(container);
    
    try {
      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 一度削除してプールに要素を溜める
      const idx3 = createIndexes(3);
      const diff1 = {
        oldListValue: [],
        newListValue: [{}, {}, {}],
        newIndexes: idx3,
        adds: new Set(idx3),
        removes: new Set(),
      } as any;
      const r1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff1) });
      node.applyChange(r1);

      const diff2 = {
        oldListValue: [{}, {}, {}],
        newListValue: [],
        newIndexes: [],
        adds: new Set(),
        removes: new Set(idx3),
      } as any;
      const r2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff2) });
      node.applyChange(r2);

      // 全追加最適化: DocumentFragment 経由での一括追加
      const idxNew = createIndexes(2);
      const diff3 = {
        oldListValue: [],
        newListValue: [{}, {}],
        newIndexes: idxNew,
        adds: new Set(idxNew),
        removes: new Set(),
      } as any;
      const r3 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff3) });
      // 新しいコードでは parentNode.append(workFragment) を使用する
      const spyAppend = vi.spyOn(container, "append");
      node.applyChange(r3);
      expect(container.childNodes.length).toBeGreaterThan(1);
      // DocumentFragment による一括追加が行われる
      expect(spyAppend).toHaveBeenCalled();
      expect(spyAppend.mock.calls[0][0]).toBeInstanceOf(DocumentFragment);
    } finally {
      document.body.removeChild(container);
    }
  });

  it("並び替え処理: changeIndexes による DOM 位置調整", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|312");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // 初期: 3件追加
    const idx3 = createIndexes(3);
    const diff1 = {
      oldListValue: [],
      newListValue: [{}, {}, {}],
      newIndexes: idx3,
      adds: new Set(idx3),
      removes: new Set(),
    } as any;
    const r1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff1) });
    node.applyChange(r1);

    // 並び替え: changeIndexes を使用（既存のインデックスを利用）
    const changeIndexes = new Set([idx3[1], idx3[2]]);
    const diff2 = {
      oldListValue: [{}, {}, {}],
      newListValue: [{}, {}, {}],
      newIndexes: idx3,
      adds: new Set(),
      removes: new Set(),
      changeIndexes: changeIndexes,
    } as any;
    const r2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff2) });
    node.applyChange(r2);
    expect(container.childNodes.length).toBeGreaterThan(1);
  });

  it("並び替え処理: changeIndexes で未登録インデックスはエラー", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|313");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(1);
    const capture = captureBindContentMap();
    const addDiff = {
      oldListValue: [],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => addDiff) });
    node.applyChange(rendererAdd);
    const bindContentMap = capture.getMap();
    capture.restore();

    bindContentMap.delete(idx[0]);

    const elementsPath = binding.bindingState.info.pattern + ".*";
    const reorderRef = { info: { pattern: elementsPath }, listIndex: idx[0] } as any;
    const changeIndexes = new Set([idx[0]]);
    const diff = {
      oldListValue: [{}],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(),
      removes: new Set(),
      changeIndexes,
    } as any;
    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diff),
      updatingRefSet: new Set([reorderRef]),
      processedRefs: new Set(),
    });
    expect(() => node.applyChange(renderer)).toThrow(/BindContent not found/);
  });

  it("changeIndexesSet がある場合にリオーダー処理を実行する", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|313");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(3);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}, {}, {}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);
    const beforeOrder = node.bindContents.slice();

    const reorderIndexes = [idx[2], idx[0], idx[1]];
    reorderIndexes.forEach((listIndex, position) => {
      listIndex.index = position;
    });
    const listPath = binding.bindingState.info.pattern + ".*";
    const updatingRefSet = new Set(reorderIndexes.map((listIndex) => ({ info: { pattern: listPath }, listIndex } as any)));
    const diffReorder = {
      oldListValue: [{}, {}, {}],
      newListValue: [{}, {}, {}],
      newIndexes: reorderIndexes,
      adds: new Set(),
      removes: new Set(),
    } as any;
    const rendererReorder = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diffReorder),
      updatingRefSet,
    });
    node.applyChange(rendererReorder);

    expect(node.bindContents[0]).toBe(beforeOrder[2]);
    expect(node.bindContents[1]).toBe(beforeOrder[0]);
  });

  it("updatingRefSet の listIndex が null だとエラー", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|314");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // まず要素を追加してから、更新テストを行う
    const idx = createIndexes(2);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);

    // 同じListIndexで更新（isAllNew=false）の場合、_getElementsResultが呼ばれる
    const diff = {
      oldListValue: [{}, {}],
      newListValue: [{}, {}],
      newIndexes: idx,
      adds: new Set(),
      removes: new Set(),
    } as any;
    const listPath = binding.bindingState.info.pattern + ".*";
    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diff),
      updatingRefSet: new Set([{ info: { pattern: listPath }, listIndex: null } as any]),
      processedRefs: new Set(),
    });
    expect(() => node.applyChange(renderer)).toThrow(/ListIndex is null/);
  });

  it("changeListIndexes に紐付いたバインディングが再評価される", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|315");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(2);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);

    const dependentBinding = { 
      applyChange: vi.fn(),
      bindingNode: { renderable: true }
    } as any;
    binding.bindingsByListIndex.set(idx[0], new Set([dependentBinding]));

    const newIndex = { index: 0 } as any;
    idx[0].index = 1;
    idx[1].index = 2;
    const newIndexes = [newIndex, idx[0], idx[1]];
    const diff = {
      oldListValue: [{}, {}],
      newListValue: [{}, {}, {}],
      newIndexes,
      adds: new Set([newIndex]),
      removes: new Set(),
    } as any;
    const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff) });
    node.applyChange(renderer);

    expect(dependentBinding.applyChange).toHaveBeenCalled();
  });

  it("changeListIndexes のバインディングが updatedBindings に含まれる場合はスキップされる", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|316");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(2);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);

    const dependentBinding = { 
      applyChange: vi.fn(),
      bindingNode: { renderable: true }
    } as any;
    binding.bindingsByListIndex.set(idx[1], new Set([dependentBinding]));

    const newIndex = { index: 2 } as any;
    idx[1].index = 0;
    idx[0].index = 1;
    const newIndexes = [idx[1], idx[0], newIndex];
    const diff = {
      oldListValue: [{}, {}],
      newListValue: [{}, {}, {}],
      newIndexes,
      adds: new Set([newIndex]),
      removes: new Set(),
    } as any;
    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diff),
      updatedBindings: new Set([dependentBinding]),
    });

    node.applyChange(renderer);
    expect(dependentBinding.applyChange).not.toHaveBeenCalled();
  });

  it("changeListIndexes のバインディングが renderable=false の場合はスキップされる", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|330");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(2);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);

    // renderable=false のバインディングを作成
    const nonRenderableBinding = { 
      applyChange: vi.fn(),
      bindingNode: { renderable: false }
    } as any;
    const renderableBinding = { 
      applyChange: vi.fn(),
      bindingNode: { renderable: true }
    } as any;
    binding.bindingsByListIndex.set(idx[0], new Set([nonRenderableBinding, renderableBinding]));

    const newIndex = { index: 0 } as any;
    idx[0].index = 1;
    idx[1].index = 2;
    const newIndexes = [newIndex, idx[0], idx[1]];
    const diff = {
      oldListValue: [{}, {}],
      newListValue: [{}, {}, {}],
      newIndexes,
      adds: new Set([newIndex]),
      removes: new Set(),
    } as any;
    const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff) });
    node.applyChange(renderer);

    // renderable=false のバインディングはスキップされる
    expect(nonRenderableBinding.applyChange).not.toHaveBeenCalled();
    // renderable=true のバインディングは呼ばれる
    expect(renderableBinding.applyChange).toHaveBeenCalled();
  });

  it("processedRefs に含まれる updatingRef はスキップされる", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|317");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(1);
    const diff = {
      oldListValue: [],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const listPath = binding.bindingState.info.pattern + ".*";
    const updatingRef = { info: { pattern: listPath }, listIndex: idx[0] } as any;
    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diff),
      updatingRefSet: new Set([updatingRef]),
      processedRefs: new Set([updatingRef]),
    });

    expect(() => node.applyChange(renderer)).not.toThrow();
  });

  it("別パターンの updatingRef は無視される", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|318");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const diff = {
      oldListValue: [],
      newListValue: [],
      newIndexes: [],
      adds: new Set(),
      removes: new Set(),
    } as any;
    const updatingRef = { info: { pattern: "other.path.*" }, listIndex: null } as any;
    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diff),
      updatingRefs: [updatingRef],
      processedRefs: new Set(),
    });

    expect(() => node.applyChange(renderer)).not.toThrow();
  });

  it("上書き処理: overwrites による要素の再描画", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|314");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // 初期: 2件追加
    const idx2 = createIndexes(2);
    const diff1 = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idx2,
      adds: new Set(idx2),
      removes: new Set(),
    } as any;
    const r1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff1) });
    node.applyChange(r1);

    // 上書き処理: overwrites を使用
    const overwrites = new Set([idx2[0]]);
    const diff2 = {
      oldListValue: [{}, {}],
      newListValue: [{ updated: true }, {}],
      newIndexes: idx2,
      adds: new Set(),
      removes: new Set(),
      overwrites: overwrites,
    } as any;
    const r2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff2) });
    node.applyChange(r2);
    expect(container.childNodes.length).toBeGreaterThan(1);
  });

  it("overwritesSet に含まれる BindContent は再描画される", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|319");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(1);
    const capture = captureBindContentMap();
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);
    const bindContentMap = capture.getMap();
    capture.restore();

    const overwriteIndex = { index: 0 } as any;
    const targetContent = node.bindContents[0];
    bindContentMap.set(overwriteIndex, targetContent);

    const diff = {
      oldListValue: [{}],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(),
      removes: new Set(),
    } as any;
    const listPath = binding.bindingState.info.pattern + ".*";
    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diff),
      updatingRefSet: new Set([{ info: { pattern: listPath }, listIndex: overwriteIndex } as any]),
    });

    const spy = vi.spyOn(targetContent, "applyChange");
    node.applyChange(renderer);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("上書き処理: overwrites で未登録インデックスはエラー", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|315");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const idx = createIndexes(1);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);

    // 上書き処理: 同じListIndexを使用するが、bindContentByListIndexから取得できないようにする
    // 同じListIndexを使う（_oldListIndexSetに含まれる）
    const overwriteIndex = idx[0];
    const diff = {
      oldListValue: [{}],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(),
      removes: new Set(),
    } as any;
    const listPath = binding.bindingState.info.pattern + ".*";
    
    // bindContentByListIndexから手動で削除してエラーを発生させる
    // 直接アクセスしてWeakMapから削除
    const nodeAny = node as any;
    nodeAny._bindContentByListIndex.delete(overwriteIndex);
    
    const renderer = createRendererStub({
      readonlyState: {},
      calcListDiff: vi.fn(() => diff),
      updatingRefSet: new Set([{ info: { pattern: listPath }, listIndex: overwriteIndex } as any]),
      processedRefs: new Set(),
    });
    expect(() => node.applyChange(renderer)).toThrow(/BindContent not found/);
  });

  it("ListDiff が null の場合はエラー", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|316");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => null) });
    expect(() => node.applyChange(renderer)).toThrow(/ListDiff is null/);
  });

  // Note: テスト「全削除時の Last BindContent not found エラー」は削除しました
  // 新しいコードでは .at(-1) ではなく [length - 1] を使用しているため、
  // Array.prototype.at をモックしてもエラーパスに到達できません。
  // また、bindContents が空で willRemoveAll=true になる状況は正常フローでは発生しません。

  it("全削除最適化: ブランクノード処理でfirstNodeがnull以外", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|318");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    
    // 先頭に通常のノードを配置
    const normalNode = document.createElement("span");
    container.appendChild(normalNode);
    container.appendChild(comment);
    
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

    // 初期: 1件追加
    const idx1 = createIndexes(1);
    const diff1 = {
      oldListValue: [],
      newListValue: [{}],
      newIndexes: idx1,
      adds: new Set(idx1),
      removes: new Set(),
    } as any;
    const r1 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff1) });
    node.applyChange(r1);

    // 全削除: 親ノードにその他のノードがあるため最適化されない
    const diff2 = {
      oldListValue: [{}],
      newListValue: [],
      newIndexes: [],
      adds: new Set(),
      removes: new Set(idx1),
    } as any;
    const r2 = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff2) });
    node.applyChange(r2);
    
    // 通常の削除処理が実行される（最適化されない）
    expect(container.childNodes.length).toBeGreaterThan(1);
    expect(container.contains(normalNode)).toBe(true);
  });

  it("全削除最適化でブランクテキストを掃除", () => {
    setupTemplate();
    const engine = createEngineStub();
    const container = document.createElement("div");
    const leadingBlank = document.createTextNode("   ");
    container.appendChild(leadingBlank);
    const comment = document.createComment("@@|320");
    container.appendChild(comment);
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    const idxAdd = createIndexes(2);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}, {}],
      newIndexes: idxAdd,
      adds: new Set(idxAdd),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);

    const trailingBlank = document.createTextNode("   ");
    container.appendChild(trailingBlank);

    const diffRemove = {
      oldListValue: [{}, {}],
      newListValue: [],
      newIndexes: [],
      adds: new Set(),
      removes: new Set(idxAdd),
    } as any;
    const rendererRemove = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffRemove) });
    node.applyChange(rendererRemove);

    expect(container.childNodes).toHaveLength(1);
    expect(container.firstChild).toBe(comment);
  });

  // Note: テスト「reuse 分岐で mountAfter が呼ばれる」は削除しました
  // 新しいコードでは、同じListIndexを再利用する場合、DOM順序の修正は
  // _reorderを通じてのみ行われ、elementsResult.changesが空でないときのみ実行されます。
  // 外部からDOMを直接操作した場合の修正はサポートされなくなりました。

  // Note: テスト「changeIndexes で index 0 のフォールバックを通る」は削除しました
  // 新しいコードでは、_reorderはelementsResult.changesが空でないときのみ実行されます。
  // calcListDiffの結果のchangeIndexesは使用されなくなりました。

  it("oldListValue が undefined の場合でもエラーにならない", () => {
    setupTemplate();
    const engine = createEngineStub();
    const container = document.createElement("div");
    const comment = document.createComment("@@|323");
    container.appendChild(comment);
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    const diff = {
      oldListValue: undefined,
      newListValue: [],
      newIndexes: [],
      adds: new Set(),
      removes: new Set(),
    } as any;
    const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff) });
    expect(() => node.applyChange(renderer)).not.toThrow();
  });

  it("newListValue が undefined でも追加処理できる", () => {
    setupTemplate();
    const engine = createEngineStub();
    const container = document.createElement("div");
    const comment = document.createComment("@@|324");
    container.appendChild(comment);
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    const indexes = createIndexes(1);
    const diff = {
      oldListValue: [],
      newListValue: undefined,
      newIndexes: indexes,
      adds: new Set(indexes),
      removes: new Set(),
    } as any;
    const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff) });
    expect(() => node.applyChange(renderer)).not.toThrow();
  });

  it("parentNode.childNodes が空配列として扱われても lastNode を null にできる", () => {
    setupTemplate();
    const engine = createEngineStub();
    const container = document.createElement("div");
    const comment = document.createComment("@@|325");
    container.appendChild(comment);
    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    const idx = createIndexes(1);
    const diffAdd = {
      oldListValue: [],
      newListValue: [{}],
      newIndexes: idx,
      adds: new Set(idx),
      removes: new Set(),
    } as any;
    const rendererAdd = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffAdd) });
    node.applyChange(rendererAdd);

    const originalArrayFrom = Array.from;
    const arrayFromSpy = vi.spyOn(Array, "from").mockImplementation((iterable: any, mapFn?: any, thisArg?: any) => {
      if (iterable === container.childNodes) {
        return [];
      }
      return originalArrayFrom.call(Array, iterable as any, mapFn, thisArg);
    });

    const diffRemove = {
      oldListValue: [{}],
      newListValue: [],
      newIndexes: [],
      adds: new Set(),
      removes: new Set(idx),
    } as any;
    const rendererRemove = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diffRemove) });
    expect(() => node.applyChange(rendererRemove)).not.toThrow();
    arrayFromSpy.mockRestore();
  });

  it("isAllNew かつ isConnected の場合 DocumentFragment を使用する", () => {
    setupTemplate();
    const engine = createEngineStub();
    const container = document.createElement("div");
    const comment = document.createComment("@@|330");
    container.appendChild(comment);
    // DOMに接続してisConnectedをtrueにする
    document.body.appendChild(container);
    
    try {
      const binding = createBindingStub(engine, comment);
      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

      const idx = createIndexes(2);
      const diff = {
        oldListValue: [],
        newListValue: [{}, {}],
        newIndexes: idx,
        adds: new Set(idx),
        removes: new Set(),
      } as any;
      // 新しいコードでは parentNode.append(workFragment) を使用する
      const spy = vi.spyOn(container, "append");
      const renderer = createRendererStub({ readonlyState: {}, calcListDiff: vi.fn(() => diff) });
      node.applyChange(renderer);
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toBeInstanceOf(DocumentFragment);
      spy.mockRestore();
    } finally {
      document.body.removeChild(container);
    }
  });

  it("inactivate は全ての BindContent を unmount & inactivate し、プールに追加する", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|306");
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const binding = createBindingStub(engine, comment);
    const node = createBindingNodeFor("items", [], [])(binding, comment, {} as any);

    const idx = createIndexes(3);
    const renderer = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => ["a", "b", "c"]),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx),
      },
    });

    node.applyChange(renderer);
    expect(node.bindContents.length).toBe(3);

    const bindContents = [...node.bindContents];
    const unmountSpy = vi.spyOn(bindContents[0], "unmount");
    const inactivateSpy = vi.spyOn(bindContents[0], "inactivate");

    node.inactivate();

    expect(unmountSpy).toHaveBeenCalled();
    expect(inactivateSpy).toHaveBeenCalled();
    expect(node.bindContents.length).toBe(0);
    // プールインデックスは 2（3件追加後、インデックス0,1,2）
    expect((node as any)._bindContentPoolIndex).toBe(2);

    document.body.removeChild(container);
  });

  it("GetListIndexesByRefSymbol が null を返す場合のフォールバック", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|401");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    const renderer = createRendererStub({
      updatedBindings: new Set([binding]),
      calcListDiff: vi.fn(),
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => null), // null を返す
      },
    });

    // エラーなく処理される
    expect(() => node.applyChange(renderer)).not.toThrow();
    
    document.body.removeChild(container);
  });

  it("配列の length が null/undefined の場合のフォールバック", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|402");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    // length が null を返す配列を Proxy で作成
    const oldArrayProxy = new Proxy([1, 2, 3], {
      get(target, prop) {
        if (prop === 'length') return null;
        return target[prop as any];
      }
    });
    node._oldList = oldArrayProxy;
    node._oldListIndexSet = new Set();

    // length が undefined を返す配列を Proxy で作成
    const newArrayProxy = new Proxy([4, 5], {
      get(target, prop) {
        if (prop === 'length') return undefined;
        return target[prop as any];
      }
    });

    const renderer = createRendererStub({
      updatedBindings: new Set([binding]),
      calcListDiff: vi.fn(),
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => newArrayProxy),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });

    // エラーなく処理される（length は 0 として扱われる）
    expect(() => node.applyChange(renderer)).not.toThrow();
    
    document.body.removeChild(container);
  });

  it("_poolBindContents で full pool expansion ブランチ（push）を通す", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|500");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    // 直接プール状態を設定して full pool expansion ブランチをテスト
    // poolIndex !== -1 かつ poolSize === poolIndex + 1（満杯）
    const mockBindContent1 = { inactivate: vi.fn() };
    const mockBindContent2 = { inactivate: vi.fn() };
    node._bindContentPool = [mockBindContent1, mockBindContent2];
    node._bindContentPool.length = 2;
    node._bindContentPoolIndex = 1; // 満杯: 2 === 1 + 1

    // 2件追加（< 1000 なので push ブランチ）
    const mockNewContents = [{ inactivate: vi.fn() }, { inactivate: vi.fn() }];
    node._poolBindContents(mockNewContents);

    expect(node._bindContentPool.length).toBe(4); // 2 + 2 = 4
    expect(node._bindContentPoolIndex).toBe(3); // 1 + 2 = 3
    expect(node._bindContentPool.length).toBe(4);

    document.body.removeChild(container);
  });

  it("_poolBindContents で full pool expansion ブランチ（concat: > 1000件）を通す", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|501");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    // 直接プール状態を設定
    const mockBindContent1 = { inactivate: vi.fn() };
    node._bindContentPool = [mockBindContent1];
    node._bindContentPool.length = 1;
    node._bindContentPoolIndex = 0; // 満杯: 1 === 0 + 1

    // 1001件追加（> 1000 なので concat ブランチ）
    const mockNewContents = Array.from({ length: 1001 }, () => ({ inactivate: vi.fn() }));
    node._poolBindContents(mockNewContents);

    expect(node._bindContentPool.length).toBe(1002); // 1 + 1001 = 1002
    expect(node._bindContentPoolIndex).toBe(1001); // 0 + 1001 = 1001
    expect(node._bindContentPool.length).toBe(1002);

    document.body.removeChild(container);
  });

  it("_poolBindContents: availableSpace が十分な場合のブランチ", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|501");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    // 10件追加
    const idx10 = createIndexes(10);
    const renderer1 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 10 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx10),
      },
    });
    node.applyChange(renderer1);
    expect(node.bindContents.length).toBe(10);

    // 全削除 → 10件がプールに入る（初期化ブランチ）
    const renderer2 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer2);
    expect(node._bindContentPoolIndex).toBe(9); // プールに10件（0-9）
    expect(node._bindContentPool.length).toBe(10);

    // プールから7件使用 → プールに3件残る（インデックス0-2）
    const idx7 = createIndexes(7);
    const renderer3 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 7 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx7),
      },
    });
    node.applyChange(renderer3);
    expect(node._bindContentPoolIndex).toBe(2); // プールに3件残り（0-2）
    expect(node._bindContentPool.length).toBe(10); // サイズは変わらない

    // 5件残す → 2件がプールに追加（availableSpace=7, neededSpace=2 → neededSpace <= availableSpace）
    const idx5 = createIndexes(5);
    const renderer4 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 5 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx5),
      },
    });
    node.applyChange(renderer4);
    expect(node._bindContentPoolIndex).toBe(4); // 2件追加で（0-4）
    expect(node._bindContentPool.length).toBe(10); // サイズは変わらない

    document.body.removeChild(container);
  });

  it("_poolBindContents: 部分削除で availableSpace が十分な場合のブランチ", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|503");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    // 同じListIndexインスタンスを使い回す（部分削除を発生させるため）
    const allIndexes = createIndexes(10);

    // 10件追加
    const renderer1 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 10 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes),
      },
    });
    node.applyChange(renderer1);
    expect(node.bindContents.length).toBe(10);

    // 7件に部分削除 → 3件がプールに入る（初期化ブランチ）
    const renderer2 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 7 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 7)),
      },
    });
    node.applyChange(renderer2);
    expect(node._bindContentPoolIndex).toBe(2); // 3件（0-2）
    expect(node._bindContentPool.length).toBe(3);
    expect(node.bindContents.length).toBe(7);

    // 10件に戻す（元の10件）→ プールから3件使用、プール空に
    const renderer3 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 10 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes),
      },
    });
    node.applyChange(renderer3);
    expect(node._bindContentPoolIndex).toBe(-1); // プール空
    expect(node._bindContentPool.length).toBe(3);
    expect(node.bindContents.length).toBe(10);

    // 4件に部分削除 → 6件がプールに入る（初期化ブランチ）
    const renderer4 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 4 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 4)),
      },
    });
    node.applyChange(renderer4);
    expect(node._bindContentPoolIndex).toBe(5); // 6件（0-5）
    expect(node._bindContentPool.length).toBe(6);
    expect(node.bindContents.length).toBe(4);

    // 8件に増やす（プールから4件使用）→ プールに2件残る
    const renderer5 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 8 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 8)),
      },
    });
    node.applyChange(renderer5);
    expect(node._bindContentPoolIndex).toBe(1); // 2件（0-1）
    expect(node._bindContentPool.length).toBe(6);
    expect(node.bindContents.length).toBe(8);

    // 6件に部分削除 → 2件がプールに追加（availableSpace=4, neededSpace=2 → 足りる）
    // ここで _poolBindContents の neededSpace <= availableSpace ブランチが通る！
    const renderer6 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 6 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 6)),
      },
    });
    node.applyChange(renderer6);
    expect(node._bindContentPoolIndex).toBe(3); // 2件追加で（0-3）
    expect(node._bindContentPool.length).toBe(6); // サイズは変わらない
    expect(node.bindContents.length).toBe(6);

    document.body.removeChild(container);
  });

  it("_poolBindContents: 部分削除で availableSpace が不足の場合のブランチ", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|504");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    // 同じListIndexインスタンスを使い回す
    const allIndexes = createIndexes(10);

    // 5件追加
    const renderer1 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 5 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 5)),
      },
    });
    node.applyChange(renderer1);
    expect(node.bindContents.length).toBe(5);

    // 全削除 → 5件がプールに入る（初期化ブランチ）
    const renderer2 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer2);
    expect(node._bindContentPoolIndex).toBe(4);
    expect(node._bindContentPool.length).toBe(5);

    // プールから4件使用 → プールに1件残る（インデックス0）
    const renderer3 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 4 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 4)),
      },
    });
    node.applyChange(renderer3);
    expect(node._bindContentPoolIndex).toBe(0);
    expect(node._bindContentPool.length).toBe(5);
    expect(node.bindContents.length).toBe(4);

    // 0件に部分削除（全削除）→ 4件がプールに追加（availableSpace=4, neededSpace=4 → ちょうど足りる）
    const renderer4 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer4);
    expect(node._bindContentPoolIndex).toBe(4);
    expect(node._bindContentPool.length).toBe(5);

    // プールから4件使用 → プールに1件残る
    const renderer5 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 4 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 4)),
      },
    });
    node.applyChange(renderer5);
    expect(node._bindContentPoolIndex).toBe(0);
    expect(node.bindContents.length).toBe(4);

    // さらに1件を部分削除（3件に） → 1件がプールに追加（availableSpace=4, neededSpace=1 → 十分足りる）
    const renderer6 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 3 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 3)),
      },
    });
    node.applyChange(renderer6);
    expect(node._bindContentPoolIndex).toBe(1);
    expect(node._bindContentPool.length).toBe(5);
    expect(node.bindContents.length).toBe(3);

    // さらに2件を部分削除（1件に） → 2件がプールに追加（availableSpace=3, neededSpace=2 → 足りる）
    const renderer7 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => [{}]),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 1)),
      },
    });
    node.applyChange(renderer7);
    expect(node._bindContentPoolIndex).toBe(3);
    expect(node._bindContentPool.length).toBe(5);
    expect(node.bindContents.length).toBe(1);

    // 新しい10件を追加 → プールから1件使用、新規9件生成
    const renderer8 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 10 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes),
      },
    });
    node.applyChange(renderer8);
    expect(node.bindContents.length).toBe(10);

    // 5件に部分削除 → 5件がプールに追加（プール空だったので初期化ブランチ）
    const renderer9 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 5 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 5)),
      },
    });
    node.applyChange(renderer9);
    expect(node._bindContentPoolIndex).toBe(4);
    expect(node._bindContentPool.length).toBe(5);

    // プールから4件使用 → 1件残る
    const renderer10 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 9 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 9)),
      },
    });
    node.applyChange(renderer10);
    expect(node._bindContentPoolIndex).toBe(0);
    expect(node.bindContents.length).toBe(9);

    // 3件に部分削除 → 6件がプールに追加（availableSpace=4, neededSpace=6 → 足りない → expand ブランチ!）
    const renderer11 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 3 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => allIndexes.slice(0, 3)),
      },
    });
    node.applyChange(renderer11);
    expect(node._bindContentPoolIndex).toBe(6);
    expect(node._bindContentPool.length).toBe(7); // 1 + 6 = 7 に拡張された
    expect(node.bindContents.length).toBe(3);

    document.body.removeChild(container);
  });

  it("_poolBindContents: availableSpace が不足でプール拡張するブランチ", () => {
    setupTemplate();
    const engine = createEngineStub();
    const comment = document.createComment("@@|502");
    const binding = createBindingStub(engine, comment);
    const container = document.createElement("div");
    container.appendChild(comment);
    document.body.appendChild(container);

    const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

    // 5件追加
    const idx5 = createIndexes(5);
    const renderer1 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 5 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx5),
      },
    });
    node.applyChange(renderer1);
    expect(node.bindContents.length).toBe(5);

    // 全削除 → 5件がプールに入る（初期化ブランチ）
    const renderer2 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer2);
    expect(node._bindContentPoolIndex).toBe(4); // プールに5件（0-4）
    expect(node._bindContentPool.length).toBe(5);

    // プールから4件使用 → プールに1件残る（インデックス0）
    const idx4 = createIndexes(4);
    const renderer3 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 4 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx4),
      },
    });
    node.applyChange(renderer3);
    expect(node._bindContentPoolIndex).toBe(0); // プールに1件残り（0）
    expect(node._bindContentPool.length).toBe(5);

    // 1件残す → 3件がプールに追加（availableSpace=4, neededSpace=3 → ちょうど足りる境界）
    const idx1 = createIndexes(1);
    const renderer4 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => [{}]),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx1),
      },
    });
    node.applyChange(renderer4);
    expect(node._bindContentPoolIndex).toBe(3); // 3件追加で（0-3）
    expect(node._bindContentPool.length).toBe(5); // サイズは変わらない

    // プールから3件使用 → プールに1件残る（インデックス0）
    const idx4b = createIndexes(4);
    const renderer5 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 4 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx4b),
      },
    });
    node.applyChange(renderer5);
    expect(node._bindContentPoolIndex).toBe(0); // プールに1件残り（0）
    expect(node._bindContentPool.length).toBe(5);

    // 全削除 → 4件がプールに追加（availableSpace=4, neededSpace=4 → ちょうど足りる）
    const renderer6 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer6);
    expect(node._bindContentPoolIndex).toBe(4); // 4件追加で（0-4）
    expect(node._bindContentPool.length).toBe(5);

    // プールから4件使用 → プールに1件残る（インデックス0）
    const renderer7 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 4 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx4b),
      },
    });
    node.applyChange(renderer7);
    expect(node._bindContentPoolIndex).toBe(0);

    // 全削除 → 4件追加（availableSpace=4, neededSpace=4 → 足りる）
    const renderer8 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer8);
    expect(node._bindContentPoolIndex).toBe(4);

    // プールから3件使用 → プールに2件残る（インデックス0-1）
    const idx3 = createIndexes(3);
    const renderer9 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 3 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx3),
      },
    });
    node.applyChange(renderer9);
    expect(node._bindContentPoolIndex).toBe(1);

    // 全削除 → 3件追加（availableSpace=3, neededSpace=3 → 足りる）
    const renderer10 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer10);
    expect(node._bindContentPoolIndex).toBe(4);

    // プールから2件使用 → プールに3件残る（インデックス0-2）
    const idx2 = createIndexes(2);
    const renderer11 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 2 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx2),
      },
    });
    node.applyChange(renderer11);
    expect(node._bindContentPoolIndex).toBe(2);

    // 全削除 → 2件追加（availableSpace=2, neededSpace=2 → 足りる）
    const renderer12 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer12);
    expect(node._bindContentPoolIndex).toBe(4);

    // プールから2件使用 → プールに3件残る
    const renderer13 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 2 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx2),
      },
    });
    node.applyChange(renderer13);
    expect(node._bindContentPoolIndex).toBe(2);

    // 4件追加で expand（availableSpace=2, neededSpace=4 → 足りない → expand ブランチ!）
    const idx6 = createIndexes(6);
    const renderer14 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => Array.from({ length: 6 }, () => ({}))),
        [GetListIndexesByRefSymbol]: vi.fn(() => idx6),
      },
    });
    node.applyChange(renderer14);

    // プールから4件使う。bindContentsは2→6へ増加
    // 実際には新規生成される
    expect(node.bindContents.length).toBe(6);

    // 全削除 → 6件追加（初期化？）
    const renderer15 = createRendererStub({
      readonlyState: {
        [GetByRefSymbol]: vi.fn(() => []),
        [GetListIndexesByRefSymbol]: vi.fn(() => []),
      },
    });
    node.applyChange(renderer15);
    // プールの状態確認
    expect(node._bindContentPoolIndex).toBeGreaterThanOrEqual(0);

    document.body.removeChild(container);
  });

  describe("_optimizedReplace パターンテスト", () => {
    // 0->N: 空リストからN個の要素へ
    it("0->N: 空リストから3件追加（isAllNew=true）", () => {
      setupTemplate();
      const spyCreate = vi.spyOn(BindContentMod, "createBindContent");

      const engine = createEngineStub();
      const comment = document.createComment("@@|401");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 0->3: 空から3件追加
      const idx3 = createIndexes(3);
      const renderer = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx3),
        },
      });

      node.applyChange(renderer);

      expect(node.bindContents).toHaveLength(3);
      expect(spyCreate).toHaveBeenCalledTimes(3);
      expect(container.childNodes.length).toBeGreaterThan(1);
    });

    // N->0: N個の要素から空リストへ
    it("N->0: 3件から空リストへ削除（willRemoveAll=true）", () => {
      setupTemplate();
      const engine = createEngineStub();
      const comment = document.createComment("@@|402");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 3件追加
      const idx3 = createIndexes(3);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx3),
        },
      });
      node.applyChange(renderer1);
      expect(node.bindContents).toHaveLength(3);

      // 3->0: 全削除
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => []),
          [GetListIndexesByRefSymbol]: vi.fn(() => []),
        },
      });
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(0);
      expect(container.childNodes.length).toBe(1); // コメントのみ
      expect(container.firstChild).toBe(comment);
    });

    // N->M (N>M): 要素数が減少、全て新しいListIndex
    it("N->M (N>M): 5件から2件へ減少（全て新しいListIndex）", () => {
      setupTemplate();
      const spyCreate = vi.spyOn(BindContentMod, "createBindContent");

      const engine = createEngineStub();
      const comment = document.createComment("@@|403");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 5件追加
      const idx5 = createIndexes(5);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => Array.from({ length: 5 }, () => ({}))),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx5),
        },
      });
      node.applyChange(renderer1);
      expect(node.bindContents).toHaveLength(5);
      expect(spyCreate).toHaveBeenCalledTimes(5);

      // 5->2: 全て新しいListIndexに置換（isAllNew=true）
      const newIdx2 = createIndexes(2); // 新しいListIndex
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx2),
        },
      });
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(2);
      // _optimizedReplace では既存のBindContentを再利用するため、新規作成は増えない
      expect(spyCreate).toHaveBeenCalledTimes(5);
    });

    // M->N (M<N): 要素数が増加、全て新しいListIndex
    it("M->N (M<N): 2件から5件へ増加（全て新しいListIndex）", () => {
      setupTemplate();
      const spyCreate = vi.spyOn(BindContentMod, "createBindContent");

      const engine = createEngineStub();
      const comment = document.createComment("@@|404");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 2件追加
      const idx2 = createIndexes(2);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx2),
        },
      });
      node.applyChange(renderer1);
      expect(node.bindContents).toHaveLength(2);
      expect(spyCreate).toHaveBeenCalledTimes(2);

      // 2->5: 全て新しいListIndexに置換（isAllNew=true）
      const newIdx5 = createIndexes(5); // 新しいListIndex
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => Array.from({ length: 5 }, () => ({}))),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx5),
        },
      });
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(5);
      // 既存2件は再利用、新規3件が追加
      expect(spyCreate).toHaveBeenCalledTimes(5);
    });

    // N=N': 同数だが全て新しいListIndex
    it("N=N': 3件から3件へ置換（全て新しいListIndex）", () => {
      setupTemplate();
      const spyCreate = vi.spyOn(BindContentMod, "createBindContent");

      const engine = createEngineStub();
      const comment = document.createComment("@@|405");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 3件追加
      const idx3 = createIndexes(3);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx3),
        },
      });
      node.applyChange(renderer1);
      const originalBindContents = [...node.bindContents];
      expect(node.bindContents).toHaveLength(3);
      expect(spyCreate).toHaveBeenCalledTimes(3);

      // 3->3: 全て新しいListIndexに置換（isAllNew=true）
      const newIdx3 = createIndexes(3); // 新しいListIndex
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx3),
        },
      });
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(3);
      // BindContentは同じインスタンスが再利用される
      expect(node.bindContents[0]).toBe(originalBindContents[0]);
      expect(node.bindContents[1]).toBe(originalBindContents[1]);
      expect(node.bindContents[2]).toBe(originalBindContents[2]);
      // createBindContent は増えない
      expect(spyCreate).toHaveBeenCalledTimes(3);
    });

    // 0->0: 空から空（エッジケース）
    it("0->0: 空から空への更新（変更なし）", () => {
      setupTemplate();
      const engine = createEngineStub();
      const comment = document.createComment("@@|407");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 0->0: 空のまま
      const renderer = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => []),
          [GetListIndexesByRefSymbol]: vi.fn(() => []),
        },
      });
      node.applyChange(renderer);

      expect(node.bindContents).toHaveLength(0);
      expect(container.childNodes.length).toBe(1); // コメントのみ
    });

    // プール再利用の検証: N->0->M
    it("プール再利用: 3件追加 -> 全削除 -> 2件追加（プールから再利用）", () => {
      setupTemplate();
      const spyCreate = vi.spyOn(BindContentMod, "createBindContent");

      const engine = createEngineStub();
      const comment = document.createComment("@@|408");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters) as any;

      // 1) 3件追加
      const idx3 = createIndexes(3);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx3),
        },
      });
      node.applyChange(renderer1);
      expect(node.bindContents).toHaveLength(3);
      expect(spyCreate).toHaveBeenCalledTimes(3);

      // 2) 全削除（プールに3件）
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => []),
          [GetListIndexesByRefSymbol]: vi.fn(() => []),
        },
      });
      node.applyChange(renderer2);
      expect(node.bindContents).toHaveLength(0);
      expect(node._bindContentPoolIndex).toBe(2); // 0,1,2 の3件

      // 3) 2件追加（プールから再利用）
      const newIdx2 = createIndexes(2);
      const renderer3 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx2),
        },
      });
      node.applyChange(renderer3);
      expect(node.bindContents).toHaveLength(2);
      // createBindContentは増えない（プールから再利用）
      expect(spyCreate).toHaveBeenCalledTimes(3);
      expect(node._bindContentPoolIndex).toBe(0); // 1件残り
    });

    // DocumentFragment最適化の検証: isConnected時
    it("DocumentFragment最適化: isConnected時に一括挿入", () => {
      // 複数要素のテンプレートを使用（childNodes.length > 1 の条件を満たすため）
      const tpl = document.createElement("template");
      tpl.innerHTML = `<div>for-item</div><span>extra</span>`;
      vi.spyOn(registerTemplateMod, "getTemplateById").mockReturnValue(tpl);
      vi.spyOn(registerAttrMod, "getDataBindAttributesById").mockReturnValue([] as any);
      
      const engine = createEngineStub();
      const comment = document.createComment("@@|409");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);
      document.body.appendChild(container); // isConnected = true

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 2件追加
      const idx2 = createIndexes(2);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx2),
        },
      });
      node.applyChange(renderer1);

      // 2->5: 全て新しいListIndexに置換（isAllNew=true, isConnected=true）
      const newIdx5 = createIndexes(5);
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => Array.from({ length: 5 }, () => ({}))),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx5),
        },
      });
      const spyInsert = vi.spyOn(container, "insertBefore");
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(5);
      // DocumentFragmentによる一括挿入が行われる
      expect(spyInsert).toHaveBeenCalled();

      document.body.removeChild(container);
    });

    // _optimizedReplace で BindContent not found エラー
    it("_optimizedReplace: 未登録インデックスで BindContent not found", () => {
      setupTemplate();
      const engine = createEngineStub();
      const comment = document.createComment("@@|410");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 3件追加
      const idx3 = createIndexes(3);
      const capture = captureBindContentMap();
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx3),
        },
      });
      node.applyChange(renderer1);
      const bindContentMap = capture.getMap();
      capture.restore();

      // WeakMapから1つ削除して不整合状態を作る
      bindContentMap.delete(idx3[2]);

      // 3->1: 減少で _optimizedReplace が呼ばれるが、削除対象のBindContentが見つからない
      const newIdx1 = createIndexes(1);
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx1),
        },
      });

      expect(() => node.applyChange(renderer2)).toThrow(/BindContent not found/);
    });

    // getLastNode が null を返す場合のフォールバック（_applyChange）
    it("_applyChange: getLastNode が null を返す場合 firstNode へフォールバック", () => {
      setupTemplate();
      const engine = createEngineStub();
      const comment = document.createComment("@@|411");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 2件追加
      const idx2 = createIndexes(2);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx2),
        },
      });
      node.applyChange(renderer1);
      expect(node.bindContents).toHaveLength(2);

      // bindContents の getLastNode を null を返すようにモック
      const originalGetLastNode = node.bindContents[0].getLastNode;
      node.bindContents[0].getLastNode = vi.fn(() => null);

      // 2->3: 1件追加（_applyChange パス）
      // idx2[0], idx2[1] は保持、新しい idx を追加
      const idx3 = [...idx2, { index: 2 } as any];
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx3),
        },
      });
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(3);
      // getLastNode が null を返しても正常に動作
      node.bindContents[0].getLastNode = originalGetLastNode;
    });

    // getLastNode が null を返す場合のフォールバック（_optimizedReplace - lastNode）
    it("_optimizedReplace: getLastNode が null を返す場合 firstNode へフォールバック", () => {
      setupTemplate();
      const engine = createEngineStub();
      const comment = document.createComment("@@|412");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 2件追加
      const idx2 = createIndexes(2);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx2),
        },
      });
      node.applyChange(renderer1);
      expect(node.bindContents).toHaveLength(2);

      // bindContents[1] の getLastNode を null を返すようにモック
      node.bindContents[1].getLastNode = vi.fn(() => null);

      // 2->4: 全て新しいListIndex（isAllNew=true）で増加
      const newIdx4 = createIndexes(4);
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx4),
        },
      });
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(4);
    });

    // getLastNode が null を返す場合のフォールバック（_optimizedReplace - fragmentLastNode）
    it("_optimizedReplace: fragmentLastNode フォールバック（isConnected時）", () => {
      setupTemplate();
      const engine = createEngineStub();
      const comment = document.createComment("@@|413");
      const binding = createBindingStub(engine, comment);
      const container = document.createElement("div");
      container.appendChild(comment);
      document.body.appendChild(container); // isConnected = true

      const node = createBindingNodeFor("for", [], [])(binding, comment, engine.inputFilters);

      // 初期: 2件追加
      const idx2 = createIndexes(2);
      const renderer1 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => idx2),
        },
      });
      node.applyChange(renderer1);
      expect(node.bindContents).toHaveLength(2);

      // 2->5: 全て新しいListIndex（isAllNew=true）で増加、isConnected=true
      // 新しく作成される BindContent の getLastNode を null を返すようにモック
      const originalCreateBindContent = BindContentMod.createBindContent;
      let createdCount = 0;
      vi.spyOn(BindContentMod, "createBindContent").mockImplementation((...args: any[]) => {
        const bc = originalCreateBindContent(...args);
        // 新規作成されるものは getLastNode を null にする
        createdCount++;
        if (createdCount <= 3) {
          bc.getLastNode = vi.fn(() => null);
        }
        return bc;
      });

      const newIdx5 = createIndexes(5);
      const renderer2 = createRendererStub({
        readonlyState: {
          [GetByRefSymbol]: vi.fn(() => [{}, {}, {}, {}, {}]),
          [GetListIndexesByRefSymbol]: vi.fn(() => newIdx5),
        },
      });
      node.applyChange(renderer2);

      expect(node.bindContents).toHaveLength(5);

      document.body.removeChild(container);
    });
  });
});
