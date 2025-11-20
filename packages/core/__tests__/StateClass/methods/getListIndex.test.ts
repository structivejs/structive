/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { getListIndex } from "../../../src/StateClass/methods/getListIndex";
import { GetListIndexesByRefSymbol } from "../../../src/StateClass/symbols";

vi.mock("../../../src/StatePropertyRef/StatepropertyRef", () => ({
  getStatePropertyRef: (info: any, _li: any) => ({ info, _li }),
}));

const getContextListIndexMock = vi.fn();
vi.mock("../../../src/StateClass/methods/getContextListIndex", () => ({
  getContextListIndex: (...args: any[]) => getContextListIndexMock(...args),
}));

function makeReceiver(listIndexesByPattern: Record<string, any[] | null | undefined>) {
  const fn = vi.fn((ref: any) => listIndexesByPattern[ref.info.pattern] ?? null);
  return {
    [GetListIndexesByRefSymbol]: fn,
    __spy: fn,
  } as any;
}

const baseInfo = {
  pattern: "a.*.b.*.c",
  wildcardCount: 2,
  wildcardParentInfos: [{ pattern: "a" }, { pattern: "a.*.b" }],
};

describe("StateClass/methods getListIndex", () => {
  it("wildcardType=none は null", () => {
    const receiver = makeReceiver({});
    const resolved = { wildcardType: "none", info: { pattern: "x" } } as any;
    const r = getListIndex(resolved, receiver, {} as any);
    expect(r).toBeNull();
  });

  it("wildcardType=context は getContextListIndex の結果を返す", () => {
    getContextListIndexMock.mockReturnValueOnce({ ctx: 1 } as any);

    const receiver = makeReceiver({});
    const resolved = { wildcardType: "context", info: { pattern: "x", lastWildcardPath: { pattern: "x" } } } as any;
    const r = getListIndex(resolved, receiver, {} as any);
    expect(r).toEqual({ ctx: 1 });
  });

  it("wildcardType=all は親参照を辿って listIndex を返す", () => {
    const receiver = makeReceiver({
      "a": [{ li: 0 }, { li: 1 }],
      "a.*.b": [{ li: 10 }, { li: 11 }],
    });
    const resolved = {
      wildcardType: "all",
      info: baseInfo,
      wildcardIndexes: [1, 0],
    } as any;

    const r = getListIndex(resolved, receiver, {} as any);
    expect(r).toEqual({ li: 10 });
  });

  it("wildcardType=partial はエラー", () => {
    const receiver = makeReceiver({});
    const resolved = { wildcardType: "partial", info: { pattern: "p" } } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrowError(/Partial wildcard type is not supported/);
  });

  it("context: lastWildcardPath が null だとエラー", () => {
    const receiver = makeReceiver({});
    const resolved = { wildcardType: "context", info: { pattern: "x", lastWildcardPath: null } } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/lastWildcardPath is null/i);
  });

  it("context: getContextListIndex が null を返すとエラー", () => {
    getContextListIndexMock.mockReturnValueOnce(null);
    const receiver = makeReceiver({});
    const resolved = { wildcardType: "context", info: { pattern: "x", lastWildcardPath: { pattern: "x" } } } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/ListIndex not found/i);
  });

  it("all: wildcardParentInfos[i] が無いとエラー", () => {
    const receiver = makeReceiver({});
    const resolved = {
      wildcardType: "all",
      info: { pattern: "a.*", wildcardCount: 1, wildcardParentInfos: [{ pattern: "a" }] },
      wildcardIndexes: [0],
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/ListIndex not found: a/);
  });

  it("all: GetListIndexesByRefSymbol が null/undefined だとエラー", () => {
    const receiver = makeReceiver({});
    const resolved = {
      wildcardType: "all",
      info: { pattern: "a.*", wildcardCount: 1, wildcardParentInfos: [{ pattern: "p" }] },
      wildcardIndexes: [0],
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/ListIndex not found: p/);
  });

  it("all: wildcardIndex が無いとエラー", () => {
    const receiver = makeReceiver({ p: [{ li: 0 }] });
    const resolved = {
      wildcardType: "all",
      info: { pattern: "a.*", wildcardCount: 1, wildcardParentInfos: [{ pattern: "p" }] },
      wildcardIndexes: [],
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/wildcardIndex is null/i);
  });

  it("all: listIndexes[wildcardIndex] が無いとエラー", () => {
    const receiver = makeReceiver({ p: [] });
    const resolved = {
      wildcardType: "all",
      info: { pattern: "a.*", wildcardCount: 1, wildcardParentInfos: [{ pattern: "p" }] },
      wildcardIndexes: [0],
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/ListIndex not found: p/);
  });

  it("all: 2階層目でGetListIndexesByRefSymbol が null だとエラー", () => {
    const receiver = makeReceiver({
      "a": [{ li: 0 }, { li: 1 }],
      // "a.*.b" がない
    });
    const resolved = {
      wildcardType: "all",
      info: {
        pattern: "a.*.b.*.c",
        wildcardCount: 2,
        wildcardParentInfos: [{ pattern: "a" }, { pattern: "a.*.b" }],
      },
      wildcardIndexes: [1, 0],
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/ListIndex not found: a\.\*\.b/);
  });

  it("all: 2階層目でwildcardIndexが無いとエラー", () => {
    const receiver = makeReceiver({
      "a": [{ li: 0 }, { li: 1 }],
      "a.*.b": [{ li: 10 }],
    });
    const resolved = {
      wildcardType: "all",
      info: {
        pattern: "a.*.b.*.c",
        wildcardCount: 2,
        wildcardParentInfos: [{ pattern: "a" }, { pattern: "a.*.b" }],
      },
      wildcardIndexes: [1], // 2つ必要だが1つしかない
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/wildcardIndex is null/i);
  });

  it("all: 2階層目でlistIndexes[wildcardIndex]が無いとエラー", () => {
    const receiver = makeReceiver({
      "a": [{ li: 0 }, { li: 1 }],
      "a.*.b": [], // 空配列
    });
    const resolved = {
      wildcardType: "all",
      info: {
        pattern: "a.*.b.*.c",
        wildcardCount: 2,
        wildcardParentInfos: [{ pattern: "a" }, { pattern: "a.*.b" }],
      },
      wildcardIndexes: [1, 0],
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/ListIndex not found: a\.\*\.b/);
  });

  it("all: wildcardParentInfos[i] が undefined だとエラー", () => {
    const receiver = makeReceiver({
      "a": [{ li: 0 }],
    });
    const resolved = {
      wildcardType: "all",
      info: {
        pattern: "a.*.b.*.c",
        wildcardCount: 2,
        wildcardParentInfos: [{ pattern: "a" }], // 2つ必要だが1つしかない
      },
      wildcardIndexes: [0, 0],
    } as any;
    expect(() => getListIndex(resolved, receiver, {} as any)).toThrow(/wildcardParentPattern is null/i);
  });
});
