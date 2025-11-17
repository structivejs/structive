import { createBindContent } from "../DataBinding/BindContent.js";
import { attachShadow } from "./attachShadow.js";
import { ConnectedCallbackSymbol, DisconnectedCallbackSymbol, GetByRefSymbol, GetListIndexesByRefSymbol, SetByRefSymbol } from "../StateClass/symbols.js";
import { getStructuredPathInfo } from "../StateProperty/getStructuredPathInfo.js";
import { raiseError } from "../utils.js";
import { createComponentStateBinding } from "../ComponentStateBinding/createComponentStateBinding.js";
import { createComponentStateInput } from "../ComponentStateInput/createComponentStateInput.js";
import { createComponentStateOutput } from "../ComponentStateOutput/createComponentStateOutput.js";
import { AssignStateSymbol } from "../ComponentStateInput/symbols.js";
import { createUpdater } from "../Updater/Updater.js";
import { getStatePropertyRef } from "../StatePropertyRef/StatepropertyRef.js";
import { RESERVED_WORD_SET } from "../constants.js";
import { addPathNode } from "../PathTree/PathNode.js";
/**
 * ComponentEngine は、Structive コンポーネントの状態・依存関係・
 * バインディング・ライフサイクル・レンダリングを統合する中核エンジンです。
 *
 * 主な役割:
 * - 状態インスタンスやプロキシの生成・管理
 * - テンプレート/スタイルシート/フィルター/バインディングの管理
 * - 依存関係グラフ（PathTree）の構築と管理
 * - バインディング情報やリスト情報の保存・取得
 * - ライフサイクル（connected/disconnected）処理
 * - Shadow DOM の適用、またはブロックモードのプレースホルダー運用
 * - 状態プロパティの取得・設定
 * - バインディングの追加・存在判定・リスト管理
 *
 * Throws（代表例）:
 * - BIND-201 bindContent not initialized yet / Block parent node is not set
 * - STATE-202 Failed to parse state from dataset
 *
 * 備考:
 * - 非同期初期化（readyResolvers）を提供
 * - Updater と連携したバッチ更新で効率的なレンダリングを実現
 */
class ComponentEngine {
    type = 'autonomous';
    config;
    template;
    styleSheet;
    stateClass;
    state;
    inputFilters;
    outputFilters;
    #bindContent = null;
    get bindContent() {
        if (this.#bindContent === null) {
            raiseError({
                code: 'BIND-201',
                message: 'bindContent not initialized yet',
                context: { where: 'ComponentEngine.bindContent.get', componentId: this.owner.constructor.id },
                docsUrl: './docs/error-codes.md#bind',
            });
        }
        return this.#bindContent;
    }
    baseClass = HTMLElement;
    owner;
    bindingsByComponent = new WeakMap();
    structiveChildComponents = new Set();
    pathManager;
    #readyResolvers = Promise.withResolvers();
    #stateBinding = createComponentStateBinding();
    stateInput;
    stateOutput;
    #blockPlaceholder = null; // ブロックプレースホルダー
    #blockParentNode = null; // ブロックプレースホルダーの親ノード
    #ignoreDissconnectedCallback = false; // disconnectedCallbackを無視するフラグ
    #currentVersion = 0;
    get currentVersion() {
        return this.#currentVersion;
    }
    versionUp() {
        return ++this.#currentVersion;
    }
    versionRevisionByPath = new Map();
    constructor(config, owner) {
        this.config = config;
        if (this.config.extends) {
            this.type = 'builtin';
        }
        const componentClass = owner.constructor;
        this.template = componentClass.template;
        this.styleSheet = componentClass.styleSheet;
        this.stateClass = componentClass.stateClass;
        this.state = new this.stateClass();
        this.inputFilters = componentClass.inputFilters;
        this.outputFilters = componentClass.outputFilters;
        this.owner = owner;
        this.stateInput = createComponentStateInput(this, this.#stateBinding);
        this.stateOutput = createComponentStateOutput(this.#stateBinding, this);
        this.pathManager = componentClass.pathManager;
    }
    setup() {
        // 実体化された state オブジェクトのプロパティをすべて PathManager に登録する
        // ToDo:prototypeを遡ったほうが良い
        for (const path in this.state) {
            if (RESERVED_WORD_SET.has(path) || this.pathManager.alls.has(path)) {
                continue;
            }
            this.pathManager.alls.add(path);
            addPathNode(this.pathManager.rootNode, path);
        }
        const componentClass = this.owner.constructor;
        const rootRef = getStatePropertyRef(getStructuredPathInfo(''), null);
        this.#bindContent = createBindContent(null, componentClass.id, this, rootRef); // this.stateArrayPropertyNamePatternsが変更になる可能性がある
    }
    get readyResolvers() {
        return this.#readyResolvers;
    }
    async connectedCallback() {
        const parentComponent = this.owner.parentStructiveComponent;
        if (parentComponent) {
            // 親コンポーネントの状態をバインドする
            parentComponent.registerChildComponent(this.owner);
            // 親コンポーネントの状態を子コンポーネントにバインドする
            this.#stateBinding.bind(parentComponent, this.owner);
        }
        if (this.config.enableWebComponents) {
            attachShadow(this.owner, this.config, this.styleSheet);
        }
        else {
            this.#blockParentNode = this.owner.parentNode;
            this.#blockPlaceholder = document.createComment("Structive block placeholder");
            try {
                this.#ignoreDissconnectedCallback = true; // disconnectedCallbackを無視するフラグを立てる
                this.owner.replaceWith(this.#blockPlaceholder); // disconnectCallbackが呼ばれてしまう
            }
            finally {
                this.#ignoreDissconnectedCallback = false;
            }
        }
        if (this.config.enableWebComponents) {
            // Shadow DOMにバインドコンテンツをマウントする
            this.bindContent.mount(this.owner.shadowRoot ?? this.owner);
        }
        else {
            // ブロックプレースホルダーの親ノードにバインドコンテンツをマウントする
            const parentNode = this.#blockParentNode ?? raiseError({
                code: 'BIND-201',
                message: 'Block parent node is not set',
                context: { where: 'ComponentEngine.connectedCallback', mode: 'block' },
                docsUrl: './docs/error-codes.md#bind',
            });
            this.bindContent.mountAfter(parentNode, this.#blockPlaceholder);
        }
        /**
         * setup()で状態の初期化と初期レンダリングを行わない理由
         * - setup()はコンポーネントのインスタンス化時に呼ばれるが、connectedCallback()はDOMに接続されたときに呼ばれる
         * - disconnectでinactivateされた後に再度connectされた場合、状態の初期化とレンダリングを再度行う必要がある
         */
        // コンポーネントの状態を初期化する
        if (this.owner.dataset.state) {
            // data-state属性から状態を取得する
            try {
                const json = JSON.parse(this.owner.dataset.state);
                this.stateInput[AssignStateSymbol](json);
            }
            catch (e) {
                raiseError({
                    code: 'STATE-202',
                    message: 'Failed to parse state from dataset',
                    context: { where: 'ComponentEngine.connectedCallback', datasetState: this.owner.dataset.state },
                    docsUrl: './docs/error-codes.md#state',
                    cause: e,
                });
            }
        }
        // 状態の初期レンダリングを行う
        createUpdater(this, (updater) => {
            updater.initialRender((renderer) => {
                this.bindContent.activate();
                renderer.createReadonlyState((readonlyState, readonlyHandler) => {
                    this.bindContent.applyChange(renderer);
                });
            });
        });
        // connectedCallbackが実装されていれば呼び出す
        if (this.pathManager.hasConnectedCallback) {
            const resultPromise = createUpdater(this, async (updater) => {
                return updater.update(null, async (stateProxy, handler) => {
                    stateProxy[ConnectedCallbackSymbol]();
                });
            });
            if (resultPromise instanceof Promise) {
                await resultPromise;
            }
        }
        this.#readyResolvers.resolve();
    }
    async disconnectedCallback() {
        if (this.#ignoreDissconnectedCallback)
            return; // disconnectedCallbackを無視するフラグが立っている場合は何もしない
        try {
            // 同期処理
            if (this.pathManager.hasDisconnectedCallback) {
                createUpdater(this, (updater) => {
                    updater.update(null, (stateProxy, handler) => {
                        stateProxy[DisconnectedCallbackSymbol]();
                    });
                });
            }
        }
        finally {
            // 親コンポーネントから登録を解除する
            this.owner.parentStructiveComponent?.unregisterChildComponent(this.owner);
            if (!this.config.enableWebComponents) {
                this.#blockPlaceholder?.remove();
                this.#blockPlaceholder = null;
                this.#blockParentNode = null;
            }
            // 状態の不活化とunmountを行う
            // inactivateの中でbindContent.unmountも呼ばれる
            createUpdater(this, (updater) => {
                updater.initialRender((renderer) => {
                    this.bindContent.inactivate();
                });
            });
        }
    }
    getListIndexes(ref) {
        if (this.stateOutput.startsWith(ref.info)) {
            return this.stateOutput.getListIndexes(ref);
        }
        let value = null;
        // 同期処理
        createUpdater(this, (updater) => {
            value = updater.createReadonlyState((stateProxy, handler) => {
                return stateProxy[GetListIndexesByRefSymbol](ref);
            });
        });
        return value;
    }
    getPropertyValue(ref) {
        // プロパティの値を取得する
        let value;
        // 同期処理
        createUpdater(this, (updater) => {
            value = updater.createReadonlyState((stateProxy, handler) => {
                return stateProxy[GetByRefSymbol](ref);
            });
        });
        return value;
    }
    setPropertyValue(ref, value) {
        // プロパティの値を設定する
        // 同期処理
        createUpdater(this, (updater) => {
            updater.update(null, (stateProxy, handler) => {
                stateProxy[SetByRefSymbol](ref, value);
            });
        });
    }
    // Structive子コンポーネントを登録する
    registerChildComponent(component) {
        this.structiveChildComponents.add(component);
    }
    unregisterChildComponent(component) {
        this.structiveChildComponents.delete(component);
    }
    #propertyRefInfoByRef = new WeakMap();
    getCacheEntry(ref) {
        return this.#propertyRefInfoByRef.get(ref)?.cacheEntry ?? null;
    }
    setCacheEntry(ref, entry) {
        let info = this.#propertyRefInfoByRef.get(ref);
        if (typeof info === "undefined") {
            this.#propertyRefInfoByRef.set(ref, { bindings: [], cacheEntry: entry });
        }
        else {
            info.cacheEntry = entry;
        }
    }
    getBindings(ref) {
        return this.#propertyRefInfoByRef.get(ref)?.bindings ?? [];
    }
    saveBinding(ref, binding) {
        const info = this.#propertyRefInfoByRef.get(ref);
        if (typeof info === "undefined") {
            this.#propertyRefInfoByRef.set(ref, { bindings: [binding], cacheEntry: null });
        }
        else {
            info.bindings.push(binding);
        }
    }
    removeBinding(ref, binding) {
        const info = this.#propertyRefInfoByRef.get(ref);
        if (typeof info !== "undefined") {
            const index = info.bindings.indexOf(binding);
            if (index >= 0) {
                info.bindings.splice(index, 1);
            }
        }
    }
}
export function createComponentEngine(config, component) {
    return new ComponentEngine(config, component);
}
