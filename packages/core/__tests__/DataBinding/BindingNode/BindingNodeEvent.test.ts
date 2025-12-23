import { describe, it, expect, vi, afterEach } from "vitest";
import { createBindingNodeEvent } from "../../../src/DataBinding/BindingNode/BindingNodeEvent";
import { createBindingStub, createEngineStub, createRendererStub } from "../helpers/bindingNodeHarness";
import * as UpdaterMod from "../../../src/Updater/Updater";
import * as UtilsMod from "../../../src/utils";

declare const process: any;

describe("BindingNodeEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("onClick ハンドラが呼ばれる（preventDefault/stopPropagation）", async () => {
    const engine = createEngineStub();
    const button = document.createElement("button");
    const binding = createBindingStub(engine, button);
    const handler = vi.fn();
    binding.bindingState.getValue = vi.fn(() => handler);

    vi.spyOn(UpdaterMod, "createUpdater").mockImplementation(async (_engine: any, cb: any) => {
      const updater = {
        update: vi.fn(async (_loop: any, fn: any) => {
          await fn({} as any, {} as any);
        }),
      };
      await cb(updater);
    });

    const node = createBindingNodeEvent("onClick", [], ["preventDefault", "stopPropagation"])(binding, button, engine.inputFilters);
    const ev = new Event("click", { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(ev, "preventDefault");
    const stopSpy = vi.spyOn(ev, "stopPropagation");
    await (node as any).handler(ev);
    expect(handler).toHaveBeenCalled();
    expect(preventSpy).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it("ループコンテキストの index を引数として渡す", async () => {
    const engine = createEngineStub();
    const button = document.createElement("button");
    const binding = createBindingStub(engine, button);
    const handler = vi.fn();
    binding.bindingState.getValue = vi.fn(() => handler);
    const loopContext = {
      serialize: vi.fn(() => [
        { listIndex: { index: 2 } },
        { listIndex: { index: 5 } },
      ]),
    };
    binding.parentBindContent.currentLoopContext = loopContext as any;

    const updateSpy = vi.fn(async (_loop: any, fn: any) => {
      await fn({} as any, {} as any);
    });
    vi.spyOn(UpdaterMod, "createUpdater").mockImplementation(async (_engine: any, cb: any) => {
      const updater = { update: updateSpy };
      await cb(updater);
    });

    const node = createBindingNodeEvent("onClick", [], [])(binding, button, engine.inputFilters);
    const ev = new Event("click", { bubbles: true, cancelable: true });
    await (node as any).handler(ev);
    expect(loopContext.serialize).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith(loopContext, expect.any(Function));
    expect(handler).toHaveBeenCalledWith(ev, 2, 5);
  });

  it("バインディング値が関数でない場合はエラー", async () => {
    const engine = createEngineStub();
    const button = document.createElement("button");
    const binding = createBindingStub(engine, button);
    binding.bindingState.getValue = vi.fn(() => 123);
    
    const raiseErrorSpy = vi.spyOn(UtilsMod, "raiseError").mockImplementation((payload: any) => {
      const err = new Error(payload.message || payload.code);
      (err as any).code = payload.code;
      throw err;
    });
    
    // createUpdater をモックして同期的に実行
    vi.spyOn(UpdaterMod, "createUpdater").mockImplementation((_engine: any, cb: any) => {
      const updater = {
        update: vi.fn((_loop: any, fn: any) => {
          return fn({} as any, {} as any);
        }),
      };
      return cb(updater);
    });

    const node = createBindingNodeEvent("onClick", [], [])(binding, button, engine.inputFilters);
    const ev = new Event("click", { bubbles: true, cancelable: true });
    
    // 同期的にエラーが発生する
    expect(() => (node as any).handler(ev)).toThrow();
    
    expect(raiseErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'BIND-201',
        message: 'Binding value is not a function',
        docsUrl: './docs/error-codes.md#bind',
        context: expect.objectContaining({
          where: 'BindingNodeEvent.handler',
          bindName: 'onClick',
          eventName: 'Click',
          receivedType: 'number',
        }),
      })
    );
  });

  it("update/applyChange は no-op", () => {
    const engine = createEngineStub();
    const button = document.createElement("button");
    const binding = createBindingStub(engine, button);
    binding.bindingState.getValue = vi.fn(() => vi.fn());
    const node = createBindingNodeEvent("onClick", [], [])(binding, button, engine.inputFilters);
    expect(() => (node as any).update()).not.toThrow();
    expect(() => (node as any).applyChange(createRendererStub())).not.toThrow();
  });

  it("非同期ハンドラでエラーが発生した場合、BIND-202 エラーを投げる", async () => {
    const engine = createEngineStub();
    const button = document.createElement("button");
    const binding = createBindingStub(engine, button);
    const testError = new Error("Handler error");
    const handler = vi.fn(async () => {
      throw testError;
    });
    binding.bindingState.getValue = vi.fn(() => handler);
    
    // Suppress unhandled rejection in this test
    const unhandledRejectionHandler = vi.fn();
    process.on('unhandledRejection', unhandledRejectionHandler);
    
    const raiseErrorSpy = vi.spyOn(UtilsMod, "raiseError").mockImplementation((payload: any) => {
      const err = new Error(payload.message || payload.code);
      (err as any).code = payload.code;
      throw err;
    });
    
    vi.spyOn(UpdaterMod, "createUpdater").mockImplementation(async (_engine: any, cb: any) => {
      const updater = {
        update: vi.fn(async (_loop: any, fn: any) => {
          return await fn({} as any, {} as any);
        }),
      };
      return await cb(updater);
    });

    const node = createBindingNodeEvent("onClick", [], [])(binding, button, engine.inputFilters);
    const ev = new Event("click", { bubbles: true, cancelable: true });
    
    // handler を呼び出す（void を返す）
    (node as any).handler(ev);
    
    // エラーが catch されるまで待つ
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(raiseErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'BIND-202',
        message: 'Event handler rejected',
        docsUrl: './docs/error-codes.md#bind',
        context: expect.objectContaining({
          where: 'BindingNodeEvent.handler',
          bindName: 'onClick',
          eventName: 'Click',
        }),
        cause: testError,
      })
    );
    
    // Clean up
    process.off('unhandledRejection', unhandledRejectionHandler);
  });

  it("非同期ハンドラで非Errorオブジェクトがスローされた場合も処理する", async () => {
    const engine = createEngineStub();
    const button = document.createElement("button");
    const binding = createBindingStub(engine, button);
    const testError = "String error";
    const handler = vi.fn(async () => {
      throw testError;
    });
    binding.bindingState.getValue = vi.fn(() => handler);
    
    // Suppress unhandled rejection in this test
    const unhandledRejectionHandler = vi.fn();
    process.on('unhandledRejection', unhandledRejectionHandler);
    
    const raiseErrorSpy = vi.spyOn(UtilsMod, "raiseError").mockImplementation((payload: any) => {
      const err = new Error(payload.message || payload.code);
      (err as any).code = payload.code;
      throw err;
    });
    
    vi.spyOn(UpdaterMod, "createUpdater").mockImplementation(async (_engine: any, cb: any) => {
      const updater = {
        update: vi.fn(async (_loop: any, fn: any) => {
          return await fn({} as any, {} as any);
        }),
      };
      return await cb(updater);
    });

    const node = createBindingNodeEvent("onClick", [], [])(binding, button, engine.inputFilters);
    const ev = new Event("click", { bubbles: true, cancelable: true });
    
    // handler を呼び出す
    (node as any).handler(ev);
    
    // エラーが catch されるまで待つ
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(raiseErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'BIND-202',
        message: 'Event handler rejected',
        docsUrl: './docs/error-codes.md#bind',
        context: expect.objectContaining({
          where: 'BindingNodeEvent.handler',
          bindName: 'onClick',
          eventName: 'Click',
        }),
        cause: expect.objectContaining({ message: 'String error' }),
      })
    );
    
    // Clean up
    process.off('unhandledRejection', unhandledRejectionHandler);
  });
});
