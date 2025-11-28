/**
 * StatePropertyRef
 *
 * Purpose:
 * - Generates and caches unique reference objects (IStatePropertyRef) from State's structured path information
 *   (IStructuredPathInfo) and optional list indexes (IListIndex).
 * - Returns the same instance for identical (info, listIndex) combinations, enabling stable comparisons
 *   and use as Map keys.
 *
 * Implementation notes:
 * - The key is composed from info.sid and listIndex.sid (or just info.sid if listIndex is null)
 * - listIndex is held via WeakRef; throws LIST-201 error if GC'd when accessed
 * - Cache uses WeakMap(listIndex) for non-null listIndex, and Map(info) for null listIndex
 */
import { IListIndex } from "../ListIndex/types";
import { IStructuredPathInfo } from "../StateProperty/types";
import { raiseError } from "../utils";
import { IStatePropertyRef } from "./types";

/**
 * Class representing a unique reference to a State property.
 * Combines structured path information with list index context for precise property identification.
 * Uses WeakRef for memory-efficient list index storage and supports parent reference traversal.
 * 
 * @class StatePropertyRef
 * @implements {IStatePropertyRef}
 */
class StatePropertyRef implements IStatePropertyRef {
  /** Structured information about the property path pattern */
  readonly info: IStructuredPathInfo;
  
  /** Private WeakRef to the list index, allowing garbage collection when no longer referenced */
  private _listIndexRef: WeakRef<IListIndex> | null;
  
  /**
   * Gets the list index for this property reference.
   * Throws an error if the list index has been garbage collected.
   * 
   * @returns {IListIndex | null} The list index, or null if this reference has no list context
   * @throws {Error} Throws LIST-201 error if the listIndex was GC'd
   */
  get listIndex(): IListIndex | null {
    if (this._listIndexRef === null) {return null;}
    // Attempt to dereference WeakRef; if GC'd, throw error
    return this._listIndexRef.deref() ?? raiseError({
      code: "LIST-201",
      message: "listIndex is null",
      context: { sid: this.info.sid, key: this.key },
      docsUrl: "./docs/error-codes.md#list",
    });
  }
  
  /** 
   * Unique string key composed from info.sid and listIndex.sid.
   * Used for caching and fast lookups.
   */
  readonly key: string;
  
  /**
   * Constructs a StatePropertyRef instance.
   * Creates a WeakRef for the listIndex to allow garbage collection.
   * Generates a composite key for caching purposes.
   * 
   * @param {IStructuredPathInfo} info - Structured path information
   * @param {IListIndex | null} listIndex - Optional list index context
   */
  constructor(
    info: IStructuredPathInfo,
    listIndex: IListIndex | null,
  ) {
    this.info = info;
    // Store listIndex as WeakRef to allow GC when no longer needed elsewhere
    this._listIndexRef = listIndex !== null ? new WeakRef(listIndex) : null;
    // Compose key from info.sid and optionally listIndex.sid
    this.key = (listIndex === null) ? info.sid : (`${info.sid  }#${  listIndex.sid}`);
  }

  /**
   * Gets the parent property reference (one level up in the path hierarchy).
   * Handles list index adjustment when the parent has fewer wildcards.
   * 
   * @returns {IStatePropertyRef | null} Parent reference, or null if this is a root property
   */
  get parentRef(): IStatePropertyRef | null {
    const parentInfo = this.info.parentInfo;
    if (!parentInfo) {return null;}
    
    // If current path has more wildcards than parent, use parent's list index (drop last level)
    // Otherwise, use the same list index
    const parentListIndex = (this.info.wildcardCount > parentInfo.wildcardCount 
      ? this.listIndex?.at(-2) 
      : this.listIndex) 
        ?? null;
    return getStatePropertyRef(parentInfo, parentListIndex);
  }
}

/**
 * Cache for StatePropertyRef instances with non-null list indexes.
 * Uses WeakMap keyed by IListIndex to allow garbage collection when list indexes are no longer referenced.
 * Each entry maps pattern strings to their corresponding StatePropertyRef instances.
 */
const refByInfoByListIndex: WeakMap<IListIndex, Record<string, IStatePropertyRef>> = new WeakMap();

/**
 * Cache for StatePropertyRef instances with null list indexes.
 * Uses a plain object keyed by pattern string since there's no WeakMap key available.
 */
const refByInfoByNull: Record<string, IStatePropertyRef> = {};

/**
 * Retrieves or creates a StatePropertyRef instance for the given path info and list index.
 * Implements caching to ensure identical (info, listIndex) pairs return the same instance,
 * enabling reference equality checks and stable Map keys.
 * 
 * @param {IStructuredPathInfo} info - Structured path information
 * @param {IListIndex | null} listIndex - Optional list index context
 * @returns {IStatePropertyRef} Cached or newly created StatePropertyRef instance
 * 
 * @example
 * const ref1 = getStatePropertyRef(pathInfo, listIndex);
 * const ref2 = getStatePropertyRef(pathInfo, listIndex);
 * console.log(ref1 === ref2); // true - same instance returned
 */
export function getStatePropertyRef(
  info: IStructuredPathInfo,
  listIndex: IListIndex | null,
): IStatePropertyRef {
  let ref = null;
  
  if (listIndex !== null) {
    // Non-null listIndex: use WeakMap-based cache
    let refByInfo;
    if (typeof (refByInfo = refByInfoByListIndex.get(listIndex)) === "undefined") {
      // First reference for this listIndex: create new ref and initialize cache entry
      ref = new StatePropertyRef(info, listIndex);
      refByInfoByListIndex.set(listIndex, { [info.pattern]: ref });
    } else {
      // Cache entry exists for this listIndex: check for matching pattern
      if (typeof (ref = refByInfo[info.pattern]) === "undefined") {
        // Pattern not found: create and cache new ref
        return refByInfo[info.pattern] = new StatePropertyRef(info, listIndex);
      }
    }
  } else {
    // Null listIndex: use plain object cache
    if (typeof (ref = refByInfoByNull[info.pattern]) === "undefined") {
      // Pattern not found: create and cache new ref
      return refByInfoByNull[info.pattern] = new StatePropertyRef(info, null);
    }
  }
  
  return ref;
}
