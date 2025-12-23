/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { get as trapGet } from "../../src/StateClass/traps/get.js";
import { 
  ConnectedCallbackSymbol, 
  DisconnectedCallbackSymbol, 
  GetByRefSymbol, 
  GetListIndexesByRefSymbol, 
  SetByRefSymbol, 
  UpdatedCallbackSymbol 
} from "../../src/StateClass/symbols.js";

const getRouterMock = vi.fn();
vi.mock("../../src/Router/Router.js", () => ({
  getRouter: () => getRouterMock(),
}));

const getResolvedPathInfoMock = vi.fn();
vi.mock("../../src/StateProperty/getResolvedPathInfo.js", () => ({
  getResolvedPathInfo: (prop: string) => getResolvedPathInfoMock(prop),
}));

const getListIndexMock = vi.fn();
vi.mock("../../src/StateClass/methods/getListIndex.js", () => ({
  getListIndex: (...args: any[]) => getListIndexMock(...args),
}));

const getStatePropertyRefMock = vi.fn();
vi.mock("../../src/StatePropertyRef/StatepropertyRef.js", () => ({
  getStatePropertyRef: (info: any, listIndex: any) => getStatePropertyRefMock(info, listIndex),
}));

const resolveMock = vi.fn();
vi.mock("../../src/StateClass/apis/resolve.js", () => ({
  resolve: (...args: any[]) => resolveMock(...args),
}));

const getAllMock = vi.fn();
vi.mock("../../src/StateClass/apis/getAll.js", () => ({
  getAll: (...args: any[]) => getAllMock(...args),
}));

const trackDependencyMock = vi.fn();
vi.mock("../../src/StateClass/apis/trackDependency.js", () => ({
  trackDependency: (...args: any[]) => trackDependencyMock(...args),
}));

const invokeMock = vi.fn();
vi.mock("../../src/StateClass/apis/invoke.js", () => ({
  invoke: (...args: any[]) => invokeMock(...args),
}));

const getByRefMock = vi.fn();
vi.mock("../../src/StateClass/methods/getByRef.js", () => ({
  getByRef: (...args: any[]) => getByRefMock(...args),
}));

const setByRefMock = vi.fn();
vi.mock("../../src/StateClass/methods/setByRef.js", () => ({
  setByRef: (...args: any[]) => setByRefMock(...args),
}));

const getListIndexesByRefMock = vi.fn();
vi.mock("../../src/StateClass/methods/getListIndexesByRef.js", () => ({
  getListIndexesByRef: (...args: any[]) => getListIndexesByRefMock(...args),
}));

const connectedCallbackMock = vi.fn();
vi.mock("../../src/StateClass/apis/connectedCallback.js", () => ({
  connectedCallback: (...args: any[]) => connectedCallbackMock(...args),
}));

const disconnectedCallbackMock = vi.fn();
vi.mock("../../src/StateClass/apis/disconnectedCallback.js", () => ({
  disconnectedCallback: (...args: any[]) => disconnectedCallbackMock(...args),
}));

const updatedCallbackMock = vi.fn();
vi.mock("../../src/StateClass/apis/updatedCallback.js", () => ({
  updatedCallback: (...args: any[]) => updatedCallbackMock(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("StateClass trap get", () => {
  const target = {};
  const receiver = {} as any;
  const handler = {
    engine: { owner: "owner" },
    updater: { updateComplete: "updateComplete" },
    symbols: new Set([
      ConnectedCallbackSymbol,
      DisconnectedCallbackSymbol,
      GetByRefSymbol,
      GetListIndexesByRefSymbol,
      SetByRefSymbol,
      UpdatedCallbackSymbol
    ])
  } as any;

  describe("Index name properties ($1-$9)", () => {
    it("should return list index value when found", () => {
      handler.lastRefStack = {
        listIndex: { indexes: { 0: "val1" } }
      };
      const result = trapGet(target, "$1", receiver, handler);
      expect(result).toBe("val1");
    });

    it("should throw error when list index is not found", () => {
      handler.lastRefStack = { listIndex: { indexes: {} } };
      expect(() => trapGet(target, "$1", receiver, handler)).toThrow("ListIndex not found: $1");
    });

    it("should throw error when lastRefStack is missing", () => {
      handler.lastRefStack = undefined;
      expect(() => trapGet(target, "$1", receiver, handler)).toThrow("ListIndex not found: $1");
    });
  });

  describe("Special properties ($)", () => {
    it("should handle $resolve", () => {
      resolveMock.mockReturnValue("resolved");
      expect(trapGet(target, "$resolve", receiver, handler)).toBe("resolved");
      expect(resolveMock).toHaveBeenCalledWith(target, "$resolve", receiver, handler);
    });

    it("should handle $getAll", () => {
      getAllMock.mockReturnValue("all");
      expect(trapGet(target, "$getAll", receiver, handler)).toBe("all");
      expect(getAllMock).toHaveBeenCalledWith(target, "$getAll", receiver, handler);
    });

    it("should handle $trackDependency", () => {
      trackDependencyMock.mockReturnValue("tracked");
      expect(trapGet(target, "$trackDependency", receiver, handler)).toBe("tracked");
      expect(trackDependencyMock).toHaveBeenCalledWith(target, "$trackDependency", receiver, handler);
    });

    it("should handle $navigate", () => {
      const navigate = vi.fn();
      getRouterMock.mockReturnValue({ navigate });
      const navFn = trapGet(target, "$navigate", receiver, handler) as Function;
      navFn("/path");
      expect(navigate).toHaveBeenCalledWith("/path");
    });

    it("should handle $navigate when router is missing", () => {
      getRouterMock.mockReturnValue(null);
      const navFn = trapGet(target, "$navigate", receiver, handler) as Function;
      expect(() => navFn("/path")).not.toThrow();
    });

    it("should handle $component", () => {
      expect(trapGet(target, "$component", receiver, handler)).toBe("owner");
    });

    it("should handle $invoke", () => {
      invokeMock.mockReturnValue("invoked");
      expect(trapGet(target, "$invoke", receiver, handler)).toBe("invoked");
      expect(invokeMock).toHaveBeenCalledWith(target, "$invoke", receiver, handler);
    });

    it("should handle $wrap", () => {
      const innerFn = vi.fn();
      invokeMock.mockReturnValue(innerFn);
      const wrapFn = trapGet(target, "$wrap", receiver, handler) as Function;
      const callback = () => {};
      const wrapped = wrapFn(callback);
      wrapped();
      expect(innerFn).toHaveBeenCalledWith(callback);
    });

    it("should handle $updateComplete", () => {
      expect(trapGet(target, "$updateComplete", receiver, handler)).toBe("updateComplete");
    });
  });

  describe("Regular string properties", () => {
    it("should resolve path and return value via getByRef", () => {
      const resolved = { info: "info" };
      const listIndex = "listIndex";
      const ref = "ref";
      getResolvedPathInfoMock.mockReturnValue(resolved);
      getListIndexMock.mockReturnValue(listIndex);
      getStatePropertyRefMock.mockReturnValue(ref);
      getByRefMock.mockReturnValue("value");

      expect(trapGet(target, "prop", receiver, handler)).toBe("value");
      expect(getResolvedPathInfoMock).toHaveBeenCalledWith("prop");
      expect(getListIndexMock).toHaveBeenCalledWith(resolved, receiver, handler);
      expect(getStatePropertyRefMock).toHaveBeenCalledWith("info", listIndex);
      expect(getByRefMock).toHaveBeenCalledWith(target, ref, receiver, handler);
    });
  });

  describe("Symbol properties", () => {
    it("should handle GetByRefSymbol", () => {
      const fn = trapGet(target, GetByRefSymbol, receiver, handler) as Function;
      getByRefMock.mockReturnValue("val");
      expect(fn("ref")).toBe("val");
      expect(getByRefMock).toHaveBeenCalledWith(target, "ref", receiver, handler);
    });

    it("should handle SetByRefSymbol", () => {
      const fn = trapGet(target, SetByRefSymbol, receiver, handler) as Function;
      setByRefMock.mockReturnValue(true);
      expect(fn("ref", "val")).toBe(true);
      expect(setByRefMock).toHaveBeenCalledWith(target, "ref", "val", receiver, handler);
    });

    it("should handle GetListIndexesByRefSymbol", () => {
      const fn = trapGet(target, GetListIndexesByRefSymbol, receiver, handler) as Function;
      getListIndexesByRefMock.mockReturnValue([1]);
      expect(fn("ref")).toEqual([1]);
      expect(getListIndexesByRefMock).toHaveBeenCalledWith(target, "ref", receiver, handler);
    });

    it("should handle ConnectedCallbackSymbol", () => {
      const fn = trapGet(target, ConnectedCallbackSymbol, receiver, handler) as Function;
      connectedCallbackMock.mockReturnValue("connected");
      expect(fn()).toBe("connected");
      expect(connectedCallbackMock).toHaveBeenCalledWith(target, ConnectedCallbackSymbol, receiver, handler);
    });

    it("should handle DisconnectedCallbackSymbol", () => {
      const fn = trapGet(target, DisconnectedCallbackSymbol, receiver, handler) as Function;
      disconnectedCallbackMock.mockReturnValue("disconnected");
      expect(fn()).toBe("disconnected");
      expect(disconnectedCallbackMock).toHaveBeenCalledWith(target, DisconnectedCallbackSymbol, receiver, handler);
    });

    it("should handle UpdatedCallbackSymbol", () => {
      const fn = trapGet(target, UpdatedCallbackSymbol, receiver, handler) as Function;
      updatedCallbackMock.mockReturnValue("updated");
      expect(fn(["ref"])).toBe("updated");
      expect(updatedCallbackMock).toHaveBeenCalledWith(target, ["ref"], receiver, handler);
    });

    it("should fallback to Reflect.get for unknown symbols", () => {
      const sym = Symbol("unknown");
      const targetWithSym = { [sym]: "val" };
      expect(trapGet(targetWithSym, sym, receiver, handler)).toBe("val");
    });
  });
});
