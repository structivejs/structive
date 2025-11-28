import { getStatePropertyRef } from "../StatePropertyRef/StatepropertyRef";
import { raiseError } from "../utils.js";
/**
 * LoopContext class manages loop binding context with parent-child relationships.
 * Provides efficient caching and traversal of loop hierarchy.
 */
class LoopContext {
    info;
    bindContent;
    _ref;
    _parentLoopContext;
    _cache = {};
    /**
     * Creates a new LoopContext instance.
     * @param ref - State property reference with path and index information
     * @param bindContent - Bind content to associate with this loop context
     */
    constructor(ref, bindContent) {
        this._ref = ref;
        this.info = ref.info;
        this.bindContent = bindContent;
    }
    /**
     * Gets the state property reference.
     * @returns State property reference
     * @throws STATE-202 If ref is null
     */
    get ref() {
        return this._ref ?? raiseError({
            code: 'STATE-202',
            message: 'ref is null',
            context: { where: 'LoopContext.ref', path: this.info.pattern },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    /**
     * Gets the path pattern from the reference.
     * @returns Path pattern string
     */
    get path() {
        return this.ref.info.pattern;
    }
    /**
     * Gets the list index from the reference.
     * @returns List index instance
     * @throws LIST-201 If listIndex is required but not present
     */
    get listIndex() {
        return this.ref.listIndex ?? raiseError({
            code: 'LIST-201',
            message: 'listIndex is required',
            context: { where: 'LoopContext.listIndex', path: this.info.pattern },
            docsUrl: '/docs/error-codes.md#list',
        });
    }
    /**
     * Assigns a new list index to this loop context.
     * @param listIndex - New list index to assign
     */
    assignListIndex(listIndex) {
        this._ref = getStatePropertyRef(this.info, listIndex);
        // Structure doesn't change, so no need to clear _parentLoopContext and _cache
    }
    /**
     * Clears the list index reference.
     */
    clearListIndex() {
        this._ref = null;
    }
    /**
     * Gets the parent loop context with lazy evaluation and caching.
     * @returns Parent loop context or null if none exists
     */
    get parentLoopContext() {
        if (typeof this._parentLoopContext === "undefined") {
            let currentBindContent = this.bindContent;
            while (currentBindContent !== null) {
                if (currentBindContent.loopContext !== null && currentBindContent.loopContext !== this) {
                    this._parentLoopContext = currentBindContent.loopContext;
                    break;
                }
                currentBindContent = currentBindContent.parentBinding?.parentBindContent ?? null;
            }
            if (typeof this._parentLoopContext === "undefined") {
                this._parentLoopContext = null;
            }
        }
        return this._parentLoopContext;
    }
    /**
     * Finds a loop context by path name in the hierarchy.
     * @param name - Path name to search for
     * @returns Loop context with matching path or null if not found
     */
    find(name) {
        let loopContext = this._cache[name];
        if (typeof loopContext === "undefined") {
            if (this.path === name) {
                loopContext = this._cache[name] = this;
            }
            else {
                let currentLoopContext = this.parentLoopContext;
                while (currentLoopContext !== null) {
                    if (currentLoopContext.path === name) {
                        break;
                    }
                    currentLoopContext = currentLoopContext.parentLoopContext;
                }
                loopContext = this._cache[name] = currentLoopContext;
            }
        }
        return loopContext;
    }
    /**
     * Walks through the loop context hierarchy from current to root.
     * @param callback - Function to call for each loop context
     */
    walk(callback) {
        callback(this);
        let currentLoopContext = this.parentLoopContext;
        while (currentLoopContext !== null) {
            callback(currentLoopContext);
            currentLoopContext = currentLoopContext.parentLoopContext;
        }
    }
    /**
     * Serializes the loop context hierarchy to an array from root to current.
     * @returns Array of loop contexts ordered from root to current
     */
    serialize() {
        const results = [];
        this.walk((loopContext) => {
            results.unshift(loopContext);
        });
        return results;
    }
}
/**
 * Factory function to create a new LoopContext instance.
 * Created instance is registered to IBindContent's loopContext and retained permanently.
 * @param ref - State property reference with path and index information
 * @param bindContent - Bind content to associate with this loop context
 * @returns New LoopContext instance
 */
export function createLoopContext(ref, bindContent) {
    return new LoopContext(ref, bindContent);
}
