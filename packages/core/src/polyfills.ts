/**
 * Runtime polyfills for Set.prototype methods declared in src/@types/polyfill.d.ts
 * Ensures methods exist at runtime for tests and library code.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const setProto: any = Set.prototype as any;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (typeof setProto.union !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  setProto.union = function <T>(this: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>(this);
    for (const v of other) {result.add(v);}
    return result;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (typeof setProto.intersection !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  setProto.intersection = function <T>(this: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    // iterate smaller set for performance
    const [small, big] = this.size <= other.size ? [this, other] : [other, this];
    for (const v of small) {if (big.has(v)) {result.add(v);}}
    return result;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (typeof setProto.difference !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  setProto.difference = function <T>(this: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const v of this) {if (!other.has(v)) {result.add(v);}}
    return result;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (typeof setProto.symmetricDifference !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  setProto.symmetricDifference = function <T>(this: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const v of this) {if (!other.has(v)) {result.add(v);}}
    for (const v of other) {if (!this.has(v)) {result.add(v);}}
    return result;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (typeof setProto.isSubsetOf !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  setProto.isSubsetOf = function <T>(this: Set<T>, other: Set<T>): boolean {
    for (const v of this) {if (!other.has(v)) {return false;}}
    return true;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (typeof setProto.isSupersetOf !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  setProto.isSupersetOf = function <T>(this: Set<T>, other: Set<T>): boolean {
    for (const v of other) {if (!this.has(v)) {return false;}}
    return true;
  };
}

export {}; // make this a module to avoid global scope augmentation issues
