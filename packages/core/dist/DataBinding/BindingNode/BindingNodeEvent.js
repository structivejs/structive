import { createFilters } from "../../BindingBuilder/createFilters.js";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeEvent クラスは、イベントバインディング（onClick, onInput など）を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、イベント固有の処理を実装
 * - name からイベント名（subName）を抽出し、addEventListener で登録
 * - バインディング値（関数）をイベントハンドラとして実行
 * - デコレータで preventDefault/stopPropagation を制御
 *
 * 主な役割:
 * 1. name から "on" を除去してイベント名を抽出（例: "onClick" → "click"）
 * 2. 指定イベントに対して、バインディングされた関数をイベントリスナーとして登録
 * 3. デコレータ（preventDefault, stopPropagation）によるイベント制御に対応
 * 4. ループコンテキストやリストインデックスも引数としてイベントハンドラに渡す
 * 5. ハンドラ実行時は stateProxy を生成し、Updater 経由で非同期的に状態を更新
 *
 * 使用例:
 * - <button data-bind="onClick: handleClick"> → クリック時に handleClick を実行
 * - <input data-bind="onInput: handleInput"> → 入力時に handleInput を実行
 * - <form data-bind="onSubmit.preventDefault: handleSubmit"> → submit 時に preventDefault して handleSubmit を実行
 *
 * 設計ポイント:
 * - constructor でイベントリスナーを登録（初期化時のみ）
 * - update/applyChange は空実装（イベントバインディングは状態変更時に何もしない）
 * - handler で createUpdater 経由で状態更新トランザクションを実行
 * - バインディング値が関数でない場合はエラー（BIND-201）
 * - デコレータで preventDefault/stopPropagation を柔軟に制御
 * - ループ内イベントにも対応し、リストインデックスを引数展開
 * - 非同期関数にも対応（Promise を await）
 *
 * ---
 *
 * BindingNodeEvent class implements event binding (onClick, onInput, etc.).
 *
 * Architecture:
 * - Inherits BindingNode, implements event-specific processing
 * - Extracts event name (subName) from name and registers with addEventListener
 * - Executes binding value (function) as event handler
 * - Controls preventDefault/stopPropagation with decorators
 *
 * Main responsibilities:
 * 1. Extract event name by removing "on" from name (e.g., "onClick" → "click")
 * 2. Register bound function as event listener for specified event
 * 3. Support event control with decorators (preventDefault, stopPropagation)
 * 4. Pass loop context and list index as arguments to event handler
 * 5. Generate stateProxy on handler execution, update state asynchronously via Updater
 *
 * Usage examples:
 * - <button data-bind="onClick: handleClick"> → Execute handleClick on click
 * - <input data-bind="onInput: handleInput"> → Execute handleInput on input
 * - <form data-bind="onSubmit.preventDefault: handleSubmit"> → preventDefault and execute handleSubmit on submit
 *
 * Design points:
 * - Register event listener in constructor (initialization only)
 * - update/applyChange are empty implementations (event binding does nothing on state change)
 * - handler executes state update transaction via createUpdater
 * - Error (BIND-201) if binding value is not a function
 * - Flexible control of preventDefault/stopPropagation with decorators
 * - Supports events within loops, expands list index as arguments
 * - Supports async functions (await Promise)
 *
 * @throws BIND-201 is not a function: バインディング値が関数でない場合 / When binding value is not a function
 */
class BindingNodeEvent extends BindingNode {
    #subName;
    /**
     * コンストラクタ。
     * - 親クラス（BindingNode）を初期化
     * - name からイベント名（subName）を抽出
     * - イベントリスナーを登録
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. name から "on" を除去してイベント名を抽出（例: "onClick" → "click"）
     * 3. ノードを HTMLElement にキャスト
     * 4. addEventListener でイベントリスナーを登録（handler メソッドを呼び出し）
     *
     * イベント名抽出:
     * - "onClick" → "click"
     * - "onInput" → "input"
     * - "onSubmit" → "submit"
     * - "onChange" → "change"
     *
     * 設計意図:
     * - constructor で一度だけイベントリスナーを登録（状態変更時には再登録しない）
     * - handler メソッドをバインドせず直接参照（this コンテキストを維持）
     * - 全てのイベントで同じ handler メソッドを使用
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Extracts event name (subName) from name
     * - Registers event listener
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Extract event name by removing "on" from name (e.g., "onClick" → "click")
     * 3. Cast node to HTMLElement
     * 4. Register event listener with addEventListener (calls handler method)
     *
     * Event name extraction:
     * - "onClick" → "click"
     * - "onInput" → "input"
     * - "onSubmit" → "submit"
     * - "onChange" → "change"
     *
     * Design intent:
     * - Register event listener once in constructor (don't re-register on state change)
     * - Direct reference to handler method without binding (maintains this context)
     * - Use same handler method for all events
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // "on" を除去してイベント名を抽出（"onClick" → "click"）
        // Extract event name by removing "on" ("onClick" → "click")
        this.#subName = this.name.slice(2);
        // イベントリスナーを登録
        // Register event listener
        const element = node;
        element.addEventListener(this.subName, (e) => this.handler(e));
    }
    /**
     * イベント名を返す getter。
     * name から "on" を除去したイベント名（"onClick" の "click" 部分）。
     *
     * Getter to return event name.
     * Event name with "on" removed from name ("click" part of "onClick").
     */
    get subName() {
        return this.#subName;
    }
    /**
     * 状態変更時の更新処理（空実装）。
     * イベントバインディングは初期化時にリスナーを登録するのみで、状態変更時には何もしない。
     *
     * 設計意図:
     * - イベントリスナーは一度登録すれば変更不要
     * - 状態変更時にリスナーを再登録する必要がない
     * - パフォーマンス向上のため、空実装にしている
     *
     * Update processing on state change (empty implementation).
     * Event binding only registers listener at initialization, does nothing on state change.
     *
     * Design intent:
     * - Event listener doesn't need to change once registered
     * - No need to re-register listener on state change
     * - Empty implementation for performance improvement
     */
    update() {
        // 何もしない（イベントバインディングは初期化時のみ）
        // Do nothing (event binding is initialization only)
    }
    /**
     * イベント発火時に実行されるハンドラメソッド。
     * デコレータでイベント制御を行い、バインディング値（関数）を実行する。
     *
     * 処理フロー:
     * 1. エンジンとループコンテキストを取得
     * 2. ループコンテキストからリストインデックス配列を抽出
     * 3. デコレータに "preventDefault" が含まれる場合、e.preventDefault() を実行
     * 4. デコレータに "stopPropagation" が含まれる場合、e.stopPropagation() を実行
     * 5. createUpdater で状態更新トランザクションを開始
     * 6. バインディング値（関数）を取得し、関数でなければエラー
     * 7. 関数を実行（引数: イベントオブジェクト、リストインデックス展開）
     * 8. 戻り値が Promise の場合は await
     *
     * 引数展開の例:
     * - ループ外: func.call(state, event)
     * - ループ1層: func.call(state, event, index1)
     * - ループ2層: func.call(state, event, index1, index2)
     *
     * デコレータの動作:
     * - preventDefault: e.preventDefault() を実行（デフォルト動作を防止）
     * - stopPropagation: e.stopPropagation() を実行（イベント伝播を停止）
     *
     * 設計意図:
     * - createUpdater でトランザクション管理し、状態更新を一括処理
     * - Reflect.apply で関数を実行し、this コンテキストを state に設定
     * - ループインデックスを引数展開することで、ループ内要素の識別が可能
     * - 非同期関数にも対応（Promise を await）
     * - デコレータで柔軟なイベント制御を実現
     *
     * Event handler method executed on event firing.
     * Controls event with decorators and executes binding value (function).
     *
     * Processing flow:
     * 1. Get engine and loop context
     * 2. Extract list index array from loop context
     * 3. Execute e.preventDefault() if "preventDefault" is in decorators
     * 4. Execute e.stopPropagation() if "stopPropagation" is in decorators
     * 5. Start state update transaction with createUpdater
     * 6. Get binding value (function), error if not a function
     * 7. Execute function (arguments: event object, list index expansion)
     * 8. Await if return value is Promise
     *
     * Argument expansion examples:
     * - Outside loop: func.call(state, event)
     * - Loop 1 level: func.call(state, event, index1)
     * - Loop 2 levels: func.call(state, event, index1, index2)
     *
     * Decorator behavior:
     * - preventDefault: Execute e.preventDefault() (prevent default behavior)
     * - stopPropagation: Execute e.stopPropagation() (stop event propagation)
     *
     * Design intent:
     * - Manage transaction with createUpdater, batch process state updates
     * - Execute function with Reflect.apply, set this context to state
     * - Enable identification of loop elements by expanding loop index as arguments
     * - Support async functions (await Promise)
     * - Achieve flexible event control with decorators
     *
     * @param e - イベントオブジェクト / Event object
     */
    async handler(e) {
        const engine = this.binding.engine;
        const loopContext = this.binding.parentBindContent.currentLoopContext;
        // ループコンテキストからリストインデックス配列を抽出
        // Extract list index array from loop context
        const indexes = loopContext?.serialize().map((context) => context.listIndex.index) ?? [];
        const options = this.decorates;
        // デコレータに応じてイベント制御
        // Control event according to decorators
        if (options.includes("preventDefault")) {
            e.preventDefault();
        }
        if (options.includes("stopPropagation")) {
            e.stopPropagation();
        }
        // 非同期処理の可能性あり
        // Possible async processing
        const resultPromise = createUpdater(engine, (updater) => {
            return updater.update(loopContext, (state, handler) => {
                // stateProxy を生成し、バインディング値を実行
                // Generate stateProxy and execute binding value
                const func = this.binding.bindingState.getValue(state, handler);
                if (typeof func !== "function") {
                    raiseError({
                        code: 'BIND-201',
                        message: `${this.name} is not a function`,
                        context: { where: 'BindingNodeEvent.handler', name: this.name, receivedType: typeof func },
                        docsUrl: '/docs/error-codes.md#bind',
                        severity: 'error',
                    });
                }
                // 関数を実行（引数: イベント、リストインデックス展開）
                // Execute function (arguments: event, list index expansion)
                return Reflect.apply(func, state, [e, ...indexes]);
            });
        });
        // Promise の場合は await
        // Await if Promise
        if (resultPromise instanceof Promise) {
            await resultPromise;
        }
    }
    /**
     * 状態変更時の適用処理（空実装）。
     * イベントバインディングは初期化時にリスナーを登録するのみで、状態変更時には何もしない。
     *
     * 設計意図:
     * - イベントリスナーは状態変更に依存しない
     * - 状態が変わってもリスナーの再登録は不要
     * - パフォーマンス向上のため、空実装にしている
     *
     * Apply processing on state change (empty implementation).
     * Event binding only registers listener at initialization, does nothing on state change.
     *
     * Design intent:
     * - Event listener doesn't depend on state change
     * - No need to re-register listener when state changes
     * - Empty implementation for performance improvement
     *
     * @param renderer - レンダラー（未使用） / Renderer (unused)
     */
    applyChange(renderer) {
        // イベントバインディングは初期化時のみで、状態変更時に何もしない
        // Event binding is initialization only, does nothing on state change
    }
}
/**
 * イベントバインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "onClick"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列（"preventDefault", "stopPropagation" など）
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeEvent を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeEvent インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate event binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "onClick")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings ("preventDefault", "stopPropagation", etc.)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeEvent
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeEvent instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeEvent = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeEvent(binding, node, name, filterFns, decorates);
};
