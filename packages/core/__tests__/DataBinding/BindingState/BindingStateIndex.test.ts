import { describe, it, expect } from "vitest";
import { createBindingStateIndex } from "../../../src/DataBinding/BindingState/BindingStateIndex";

type StructiveError = Error & { code?: string; context?: Record<string, unknown>; docsUrl?: string };

function captureError(fn: () => unknown): StructiveError {
  try {
    fn();
  } catch (err) {
    return err as StructiveError;
  }
  throw new Error("Expected error to be thrown");
}

function createEngine() {
  return {
    outputFilters: {
      add: (opts: string[]) => (v: any) => Number(v) + Number(opts?.[0] ?? 0),
    },
    bindingsByListIndex: new Map<any, Set<any>>(),
  } as any;
}

function createBinding(engine: any, loop: any) {
  if (loop && typeof loop.serialize === "function") {
    const parentBinding = { bindingsByListIndex: engine.bindingsByListIndex };
    const originalSerialize = loop.serialize.bind(loop);
    loop = {
      ...loop,
      serialize: () => {
        const contexts = originalSerialize();
        return contexts.map((ctx: any) => {
          const bindContent = ctx.bindContent ?? { parentBinding };
          if (bindContent.parentBinding == null) {
            bindContent.parentBinding = parentBinding;
          }
          return { ...ctx, bindContent };
        });
      },
    };
  }
  return {
    engine,
    parentBindContent: { currentLoopContext: loop },
  } as any;
}

describe("BindingStateIndex", () => {
  it("pattern と info のゲッターは未実装で例外", () => {
    const engine = createEngine();
    const binding = createBinding(engine, { serialize: () => [] } as any);
    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);
    const patternErr = captureError(() => (bs as any).pattern);
    expect(patternErr.code).toBe("BIND-301");
    expect(patternErr.message).toMatch(/Binding pattern not implemented/);
    expect(patternErr.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.pattern",
      pattern: "$1",
      indexNumber: 1,
    }));

    const infoErr = captureError(() => (bs as any).info);
    expect(infoErr.code).toBe("BIND-301");
    expect(infoErr.message).toMatch(/Binding info not implemented/);
    expect(infoErr.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.info",
      pattern: "$1",
      indexNumber: 1,
    }));
  });

  it("activate で対象インデックスに登録され、getValue/getFilteredValue/ref が取得できる", () => {
    const ctx1 = { listIndex: { index: 0, sid: "LI0" }, ref: { key: "K0" } };
    const ctx2 = { listIndex: { index: 1, sid: "LI1" }, ref: { key: "K1" } };
    const root = { serialize: () => [ctx1, ctx2] } as any;
    const engine = createEngine();
    const binding = createBinding(engine, root);

    const factory = createBindingStateIndex("$2", [
      { name: "add", options: ["10"] },
    ]);
    const bs = factory(binding, engine.outputFilters);

    // activate 前アクセスはエラー
    const preActivateErr = captureError(() => (bs as any).getValue({} as any));
    expect(preActivateErr.message).toMatch(/listIndex is null/i);
    expect(preActivateErr.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.listIndex",
      pattern: "$2",
      indexNumber: 2,
    }));
    expect(preActivateErr.docsUrl).toBe("./docs/error-codes.md#list");

    bs.activate();

    // Map 登録（listIndex オブジェクトがキー）
    const set = engine.bindingsByListIndex.get(ctx2.listIndex);
    expect(set).toBeInstanceOf(Set);
    expect(set!.has(binding)).toBe(true);

    // 値参照とフィルタ
    expect((bs as any).getValue({} as any, {} as any)).toBe(1);
    expect((bs as any).getFilteredValue({} as any, {} as any)).toBe(11);

    // ref も参照できる
    expect(bs.ref).toBe(ctx2.ref);
  });

  it("init 前に ref を参照するとエラー", () => {
    const engine = createEngine();
    const binding = createBinding(engine, { serialize: () => [] } as any);
    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    const err = captureError(() => bs.ref);
    expect(err.message).toMatch(/ref is null/i);
    expect(err.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.ref",
      pattern: "$1",
      indexNumber: 1,
    }));
    expect(err.docsUrl).toBe("./docs/error-codes.md#state");
  });

  it("binding と filters のゲッターが期待通り返る", () => {
    const engine = createEngine();
    const binding = createBinding(engine, { serialize: () => [] } as any);
    const factory = createBindingStateIndex("$1", [{ name: "add", options: ["1"] }]);
    const bs = factory(binding, engine.outputFilters);
    expect((bs as any)._binding).toBe(binding);
    expect(Array.isArray((bs as any).filters)).toBe(true);
    expect((bs as any).filters.length).toBe(1);
    expect((bs as any).isLoopIndex).toBe(true);
  });

  it("pattern が数値でない場合はコンストラクタでエラー", () => {
    const engine = createEngine();
    const binding = createBinding(engine, { serialize: () => [] });
    const factory = createBindingStateIndex("abc", []);
    const err = captureError(() => factory(binding, engine.outputFilters));
    expect(err.code).toBe("BIND-202");
    expect(err.message).toMatch(/Pattern is not a number/i);
    expect(err.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.constructor",
      pattern: "abc",
    }));
  });

  it("currentLoopContext が null だと activate でエラー", () => {
    const engine = createEngine();
    const binding = createBinding(engine, null);
    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);
    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/LoopContext is null/i);
    expect(err.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.activate",
      pattern: "$1",
      indexNumber: 1,
    }));
  });

  it("シリアライズ結果の範囲外インデックスは activate でエラー", () => {
    const root = { serialize: () => [{ listIndex: { index: 0 }, ref: { key: "K0" } }] } as any;
    const engine = createEngine();
    const binding = createBinding(engine, root);
    const factory = createBindingStateIndex("$2", []);
    const bs = factory(binding, engine.outputFilters);
    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/Current loopContext is null/);
    expect(err.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.activate",
      pattern: "$2",
      serializedIndex: 1,
      serializedLength: 1,
    }));
  });

  it("assignValue は未実装エラー", () => {
    const ctx = { listIndex: { index: 3 }, ref: { key: "K3" } };
    const root = { serialize: () => [ctx] } as any;
    const engine = createEngine();
    const binding = createBinding(engine, root);
    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);
    bs.activate();
    const err = captureError(() => (bs as any).assignValue({} as any, {} as any, 123));
    expect(err.code).toBe("BIND-301");
    expect(err.message).toMatch(/Binding assignValue not implemented/);
    expect(err.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.assignValue",
      pattern: "$1",
    }));
  });

  it("listIndex.index が無い場合は getValue/getFilteredValue がエラー", () => {
    const ctx = { listIndex: { sid: "LI#NO_IDX" }, ref: { key: "K" } };
    const root = { serialize: () => [ctx] } as any;
    const engine = createEngine();
    const binding = createBinding(engine, root);
    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    bs.activate();

    const getValueErr = captureError(() => bs.getValue({} as any, {} as any));
    expect(getValueErr.message).toMatch(/listIndex is null/i);
    expect(getValueErr.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.getValue",
      pattern: "$1",
    }));
    const filteredErr = captureError(() => bs.getFilteredValue({} as any, {} as any));
    expect(filteredErr.message).toMatch(/listIndex is null/i);
    expect(filteredErr.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.getFilteredValue",
      pattern: "$1",
    }));
  });

  it("activate を複数回呼んでも Set は重複しない", () => {
    const ctx = { listIndex: { index: 2 }, ref: { key: "K2" } };
    const root = { serialize: () => [ctx] } as any;
    const engine = createEngine();
    const binding = createBinding(engine, root);
    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    bs.activate();
    bs.activate();

    const set = engine.bindingsByListIndex.get(ctx.listIndex)!;
    expect(set.size).toBe(1);
    expect(set.has(binding)).toBe(true);
  });

  it("親バインディングが無い場合は activate でエラー", () => {
    const engine = createEngine();
    const listIndex = { index: 0 };
    const loopContext = {
      serialize: () => [{
        listIndex,
        ref: { key: "REF" },
        bindContent: { parentBinding: null }
      }]
    };
    const binding = {
      engine,
      parentBindContent: { currentLoopContext: loopContext }
    } as any;

    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/Binding for list is null/);
    expect(err.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.activate",
      pattern: "$1",
    }));
  });

  it("bindContent.parentBinding が undefined の場合も activate でエラー", () => {
    const engine = createEngine();
    const listIndex = { index: 0 };
    
    // undefined を明示的に設定するケース
    const bindContent = { parentBinding: undefined };
    const loopContext = {
      serialize: () => [{
        listIndex,
        ref: { key: "REF" },
        bindContent
      }]
    };
    
    const binding = {
      engine,
      parentBindContent: { currentLoopContext: loopContext }
    } as any;

    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/Binding for list is null/);
    expect(err.context).toEqual(expect.objectContaining({ where: "BindingStateIndex.activate" }));
  });

  it("直接的にparentBinding が null の場合の初期化エラー", () => {
    const engine = createEngine();
    const listIndex = { index: 0 };
    
    // createBindingヘルパーを使わず、直接構築
    const bindContent = { parentBinding: null };  // 明示的にnull
    const loopContext = {
      serialize: () => [{
        listIndex,
        ref: { key: "REF" },
        bindContent
      }]
    };
    
    const binding = {
      engine,
      parentBindContent: { currentLoopContext: loopContext }
    } as any;

    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/Binding for list is null/);
    expect(err.context).toEqual(expect.objectContaining({ where: "BindingStateIndex.activate" }));
  });

  it("bindContentにparentBindingプロパティが存在しない場合の初期化エラー", () => {
    const engine = createEngine();
    const listIndex = { index: 0 };
    
    // parentBindingプロパティ自体を持たないオブジェクト
    const bindContent = Object.create(null);  // プロトタイプチェーンを持たないオブジェクト
    
    const loopContext = {
      serialize: () => [{
        listIndex,
        ref: { key: "REF" },
        bindContent
      }]
    };
    
    const binding = {
      engine,
      parentBindContent: { currentLoopContext: loopContext }
    } as any;

    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/Binding for list is null/);
    expect(err.context).toEqual(expect.objectContaining({ where: "BindingStateIndex.activate" }));
  });

  it("デバッグ: 直接的なテストケース", () => {
    const engine = createEngine();

    // 最もシンプルな状況でテストする
    const factory = createBindingStateIndex("$1", []);
    
    // bindingオブジェクトを完全に制御
    const binding = {
      engine,
      parentBindContent: {
        currentLoopContext: {
          serialize: () => [{
            listIndex: { index: 0 },
            ref: { key: "REF" },
            bindContent: {
              parentBinding: null  // 確実にnull
            }
          }]
        }
      }
    };

    const bs = factory(binding as any, engine.outputFilters);
    
    // 期待: "Binding for list is null" エラーで145-146行が実行される
    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/Binding for list is null/);
    expect(err.context).toEqual(expect.objectContaining({ where: "BindingStateIndex.activate" }));
  });

  it("明示的なnullケースでのエラー処理", () => {
    const engine = createEngine();
    const factory = createBindingStateIndex("$1", []);
    
    // この特定のケースを複数回テストして確実にカバーする
    for (let i = 0; i < 3; i++) {
      const binding = {
        engine,
        parentBindContent: {
          currentLoopContext: {
            serialize: () => [{
              listIndex: { index: 0 },
              ref: { key: "REF" + i },
              bindContent: { parentBinding: null }  // 毎回null
            }]
          }
        }
      };

      const bs = factory(binding as any, engine.outputFilters);
      const err = captureError(() => bs.activate());
      expect(err.message).toMatch(/Binding for list is null/);
      expect(err.context).toEqual(expect.objectContaining({ where: "BindingStateIndex.activate" }));
    }
  });

  it("既存エントリがある場合は Set に追記する", () => {
    const engine = createEngine();
    const listIndex = { index: 5 };
    const parentBinding = { bindingsByListIndex: engine.bindingsByListIndex };
    const existingBinding = { id: "existing" };
    const existingSet = new Set<any>([existingBinding]);
    parentBinding.bindingsByListIndex.set(listIndex, existingSet);

    const loopContext = {
      serialize: () => [{
        listIndex,
        ref: { key: "REF" },
        bindContent: { parentBinding }
      }]
    };

    const binding = {
      engine,
      parentBindContent: { currentLoopContext: loopContext }
    } as any;

    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    bs.activate();

    expect(existingSet.size).toBe(2);
    expect(existingSet.has(binding)).toBe(true);
  });

  it("parentBinding が null の場合は activate でエラー (coverage test)", () => {
    const engine = createEngine();
    
    // Create a mock loop context with null parentBinding to cover lines with raiseError
    const mockLoopContext = {
      serialize: () => [{
        listIndex: { index: 0 },
        ref: { key: "REF" },
        bindContent: { parentBinding: null }
      }]
    };

    const binding = {
      engine,
      parentBindContent: { 
        currentLoopContext: mockLoopContext 
      }
    } as any;

    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    const err = captureError(() => bs.activate());
    expect(err.message).toMatch(/Binding for list is null/);
    expect(err.context).toEqual(expect.objectContaining({ where: "BindingStateIndex.activate" }));
  });

  it("inactivate でループコンテキストがクリアされる", () => {
    const ctx = { listIndex: { index: 0 }, ref: { key: "K0" } };
    const root = { serialize: () => [ctx] } as any;
    const engine = createEngine();
    const binding = createBinding(engine, root);

    const factory = createBindingStateIndex("$1", []);
    const bs = factory(binding, engine.outputFilters);

    // activate後はref等にアクセス可能
    bs.activate();
    expect(bs.ref).toBe(ctx.ref);

    // inactivate後はアクセスできない
    bs.inactivate();
    const err = captureError(() => bs.ref);
    expect(err.message).toMatch(/ref is null/i);
    expect(err.context).toEqual(expect.objectContaining({
      where: "BindingStateIndex.ref",
      pattern: "$1",
    }));
  });
});