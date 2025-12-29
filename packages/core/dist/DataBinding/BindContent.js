import { resolveNodeFromPath } from "../BindingBuilder/resolveNodeFromPath.js";
import { getTemplateById } from "../Template/registerTemplate.js";
import { raiseError } from "../utils.js";
import { createBinding } from "./Binding.js";
import { createLoopContext } from "../LoopContext/createLoopContext.js";
import { getDataBindAttributesById } from "../BindingBuilder/registerDataBindAttributes.js";
import { hasLazyLoadComponents, loadLazyLoadComponent } from "../WebComponents/loadFromImportMap.js";
/**
 * Internal helper function to generate DocumentFragment from template ID.
 * Automatically loads lazy-load components if present.
 *
 * @param id - Registered template ID
 * @returns DocumentFragment with copied template content
 * @throws TMP-001 Template not found
 */
function createContent(id) {
    const template = getTemplateById(id) ??
        raiseError({
            code: "TMP-001",
            message: `Template not found: ${id}`,
            context: { where: 'BindContent.createContent', templateId: id },
            docsUrl: "./docs/error-codes.md#tmp",
        });
    const fragment = document.importNode(template.content, true);
    if (hasLazyLoadComponents()) {
        const lazyLoadElements = fragment.querySelectorAll(":not(:defined)");
        for (let i = 0; i < lazyLoadElements.length; i++) {
            const tagName = lazyLoadElements[i].tagName.toLowerCase();
            loadLazyLoadComponent(tagName);
        }
    }
    return fragment;
}
/**
 * Internal function to construct IBinding array from data-bind information within template.
 * Uses factory functions to generate appropriate binding types.
 *
 * @param bindContent - Parent BindContent
 * @param id - Template ID
 * @param engine - Component engine
 * @param content - Fragment copied from template
 * @returns Array of generated IBinding
 * @throws BIND-101 Data-bind not registered
 * @throws BIND-102 Node not found
 * @throws BIND-103 Creator not found
 */
function createBindings(bindContent, id, engine, content) {
    const attributes = getDataBindAttributesById(id) ??
        raiseError({
            code: "BIND-101",
            message: "Data-bind not registered",
            context: { where: 'BindContent.createBindings', templateId: id },
            docsUrl: "./docs/error-codes.md#bind",
        });
    const bindings = [];
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        const node = resolveNodeFromPath(content, attribute.nodePath) ??
            raiseError({
                code: "BIND-102",
                message: `Node not found by nodePath: ${String(attribute.nodePath)}`,
                context: { where: 'BindContent.createBindings', templateId: id, nodePath: attribute.nodePath },
                docsUrl: "./docs/error-codes.md#bind",
            });
        for (let j = 0; j < attribute.bindTexts.length; j++) {
            const bindText = attribute.bindTexts[j];
            const creator = attribute.creatorByText.get(bindText) ??
                raiseError({
                    code: "BIND-103",
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    message: `Creator not found for bindText: ${String(bindText)}`,
                    context: { where: 'BindContent.createBindings', templateId: id, bindText },
                    docsUrl: "./docs/error-codes.md#bind",
                });
            // Generate Binding instance (includes BindingNode and BindingState)
            const binding = createBinding(bindContent, node, engine, creator.createBindingNode, creator.createBindingState);
            // Add to array
            bindings.push(binding);
        }
    }
    // Step 4: Return generated IBinding array
    return bindings;
}
/**
 * BindContent class manages DOM fragments generated from templates and their binding information.
 * Supports hierarchical structure, loops, and lifecycle management.
 *
 * @throws TMP-001 Template not found (in createContent)
 * @throws BIND-101/102/103 data-bind info issues (in createBindings)
 * @throws BIND-104 Child bindContent not found (getLastNode)
 * @throws BIND-201 LoopContext is null (assignListIndex)
 */
class BindContent {
    parentBinding;
    loopContext;
    id;
    firstChildNode;
    lastChildNode;
    fragment;
    childNodes;
    bindings = [];
    _engine;
    _isActive = false;
    _currentLoopContext;
    /**
     * Recursively retrieves the last node, including those under trailing bindings.
     * Used for determining DOM insertion position in BindingNodeFor.
     *
     * @param parentNode - Parent node for validation
     * @returns Last node or null if parent-child relationship broken
     * @throws BIND-104 Child bindContent not found
     */
    getLastNode(parentNode) {
        const lastBinding = this.bindings[this.bindings.length - 1];
        const lastChildNode = this.lastChildNode;
        if (typeof lastBinding !== "undefined" && lastBinding.node === lastChildNode) {
            if (lastBinding.bindContents.length > 0) {
                const childBindContent = lastBinding.bindContents.at(-1) ?? raiseError({
                    code: "BIND-104",
                    message: "Child bindContent not found",
                    context: { where: 'BindContent.getLastNode', templateId: this.id },
                    docsUrl: "./docs/error-codes.md#bind",
                });
                const lastNode = childBindContent.getLastNode(parentNode);
                if (lastNode !== null) {
                    return lastNode;
                }
            }
        }
        if (parentNode !== lastChildNode?.parentNode) {
            return null;
        }
        return lastChildNode;
    }
    /**
     * Getter to retrieve current loop context with caching.
     * Traverses parent direction on first access, cached thereafter.
     *
     * @returns Current ILoopContext or null if not in loop
     */
    get currentLoopContext() {
        if (typeof this._currentLoopContext === "undefined") {
            if (this.loopContext !== null) {
                this._currentLoopContext = this.loopContext;
                return this._currentLoopContext;
            }
            let bindContent = this.parentBinding?.parentBindContent ?? null;
            while (bindContent !== null) {
                if (bindContent.loopContext !== null) {
                    break;
                }
                ;
                bindContent = bindContent.parentBinding?.parentBindContent ?? null;
            }
            this._currentLoopContext = bindContent?.loopContext ?? null;
        }
        return this._currentLoopContext;
    }
    /**
     * Constructor initializes BindContent from template ID.
     * Generates LoopContext if loopRef has listIndex.
     * Call activate() after construction to enable bindings.
     *
     * @param parentBinding - Parent IBinding (null if root)
     * @param id - Template ID
     * @param engine - Component engine instance
     * @param loopRef - StatePropertyRef for loop context
    * @throws TMP-001 Template not found or BIND-101 data-bind not set
     * @throws BIND-102 Node not found in template
     * @throws BIND-103 Creator not found for bindText
     */
    constructor(parentBinding, id, engine, loopRef) {
        this.parentBinding = parentBinding;
        this.id = id;
        this.fragment = createContent(id);
        this.childNodes = Array.from(this.fragment.childNodes);
        this.firstChildNode = this.childNodes[0] ?? null;
        this.lastChildNode = this.childNodes[this.childNodes.length - 1] ?? null;
        this._engine = engine;
        this.loopContext = (loopRef.listIndex !== null) ? createLoopContext(loopRef, this) : null;
        const bindings = createBindings(this, id, engine, this.fragment);
        this.bindings = bindings;
    }
    /**
     * Returns whether BindContent is currently active.
     *
     * @returns true if active, false otherwise
     */
    get isActive() {
        return this._isActive;
    }
    /**
     * Mounts childNodes to end of parent node (appendChild).
     * Not idempotent - caller must avoid duplicate mounts.
     *
     * @param parentNode - Parent node for mount destination
     */
    mount(parentNode) {
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.appendChild(this.childNodes[i]);
        }
    }
    /**
     * Mounts childNodes immediately before specified node (insertBefore).
     * If beforeNode is null, appends to end.
     *
     * @param parentNode - Parent node for mount destination
     * @param beforeNode - Reference node for insertion position (null = append to end)
     */
    mountBefore(parentNode, beforeNode) {
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.insertBefore(this.childNodes[i], beforeNode);
        }
    }
    /**
     * Mounts childNodes immediately after specified node.
     *
     * @param parentNode - Parent node for mount destination
     * @param afterNode - Reference node for insertion position (null = prepend to start)
     */
    mountAfter(parentNode, afterNode) {
        const beforeNode = afterNode?.nextSibling ?? null;
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.insertBefore(this.childNodes[i], beforeNode);
        }
    }
    /**
     * Unmounts (detaches) childNodes from DOM.
     * Clears currentLoopContext cache.
     */
    unmount() {
        this._currentLoopContext = undefined;
        const parentNode = this.childNodes[0]?.parentNode ?? null;
        if (parentNode === null) {
            return;
        }
        for (let i = 0; i < this.childNodes.length; i++) {
            parentNode.removeChild(this.childNodes[i]);
        }
    }
    /**
     * Reassigns ListIndex within loop.
     * Used when reordering array elements in BindingNodeFor.
     *
     * @param listIndex - New list index to assign
     * @throws BIND-201 LoopContext is null
     */
    assignListIndex(listIndex) {
        if (this.loopContext === null) {
            raiseError({
                code: "BIND-201",
                message: "LoopContext is null",
                context: { where: 'BindContent.assignListIndex', templateId: this.id },
                docsUrl: "./docs/error-codes.md#bind",
            });
        }
        this.loopContext.assignListIndex(listIndex);
    }
    /**
     * Applies changes to all bindings.
     * Called from Renderer, prevents duplicate updates.
     *
     * @param renderer - Renderer instance managing update cycle
     */
    applyChange(renderer) {
        const parentNode = this.childNodes[0]?.parentNode ?? null;
        if (parentNode === null) {
            return;
        }
        for (let i = 0; i < this.bindings.length; i++) {
            const binding = this.bindings[i];
            if (!binding.bindingNode.renderable) {
                continue;
            }
            if (renderer.updatedBindings.has(binding)) {
                continue;
            }
            binding.applyChange(renderer);
        }
    }
    /**
     * Activates all bindings in this BindContent.
     * Subscribes to state and renders to DOM.
     */
    activate() {
        this._isActive = true;
        for (let i = 0; i < this.bindings.length; i++) {
            this.bindings[i].activate();
        }
    }
    /**
     * Inactivates all bindings and clears loop context.
     * Unsubscribes from state and cleans up resources.
     */
    inactivate() {
        this._isActive = false;
        this.loopContext?.clearListIndex();
        for (let i = 0; i < this.bindings.length; i++) {
            this.bindings[i].inactivate();
        }
    }
}
/**
 * Factory function to generate BindContent instance.
 * Call activate() after creation to enable bindings.
 *
 * @param parentBinding - Parent IBinding (null if root)
 * @param id - Template ID
 * @param engine - Component engine instance
 * @param loopRef - StatePropertyRef for loop context
 * @returns Generated IBindContent instance
 * @throws TMP-001 Template not found or BIND-101 data-bind not set
 * @throws BIND-102 Node not found in template
 * @throws BIND-103 Creator not found for bindText
 */
export function createBindContent(parentBinding, id, engine, loopRef) {
    const bindContent = new BindContent(parentBinding, id, engine, loopRef);
    return bindContent;
}
