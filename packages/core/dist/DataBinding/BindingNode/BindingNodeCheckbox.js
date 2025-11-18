import { createFilters } from "../../BindingBuilder/createFilters.js";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeCheckbox クラスは、チェックボックス（input[type="checkbox"]）のバインディングを担当する実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、チェックボックス固有の処理を実装
 * - 配列値とチェックボックスの value を比較して checked 状態を制御
 * - 双方向バインディング対応（ユーザー操作時に状態を自動更新）
 *
 * 主な役割:
 * 1. 配列値に input.value が含まれるかで checked 状態を制御
 * 2. チェックボックスのチェック/チェック解除時に配列を自動更新（双方向バインディング）
 * 3. イベント名のカスタマイズ対応（decorates で "onchange" 等を指定可能）
 * 4. readonly モード対応（decorates に "readonly" または "ro" を指定）
 *
 * 使用例:
 * - <input type="checkbox" value="apple" :prop.checked="selectedFruits"> → selectedFruits に "apple" が含まれるときチェック
 * - <input type="checkbox" value="banana" :prop.checked.onchange="selectedFruits"> → change イベントで更新
 * - <input type="checkbox" value="orange" :prop.checked.readonly="selectedFruits"> → 読み取り専用（状態更新なし）
 *
 * 設計ポイント:
 * - assignValue で配列値と input.value を比較し、checked プロパティを設定
 * - constructor でイベントリスナーを登録し、双方向バインディングを実現
 * - decorates の数は1つまで（複数指定はエラー）
 * - readonly/ro 指定時はイベントリスナーを登録しない
 * - フィルタ適用後の値を使用して状態比較・更新を実行
 *
 * ---
 *
 * BindingNodeCheckbox class implements binding for checkboxes (input[type="checkbox"]).
 *
 * Architecture:
 * - Inherits BindingNode, implements checkbox-specific processing
 * - Controls checked state by comparing array value with checkbox value
 * - Supports bidirectional binding (auto-updates state on user interaction)
 *
 * Main responsibilities:
 * 1. Control checked state by checking if input.value is in array value
 * 2. Auto-update array on checkbox check/uncheck (bidirectional binding)
 * 3. Support custom event names (can specify "onchange" etc. in decorates)
 * 4. Support readonly mode (specify "readonly" or "ro" in decorates)
 *
 * Usage examples:
 * - <input type="checkbox" value="apple" :prop.checked="selectedFruits"> → Checked when "apple" is in selectedFruits
 * - <input type="checkbox" value="banana" :prop.checked.onchange="selectedFruits"> → Updates on change event
 * - <input type="checkbox" value="orange" :prop.checked.readonly="selectedFruits"> → Read-only (no state update)
 *
 * Design points:
 * - assignValue compares array value with input.value, sets checked property
 * - constructor registers event listener to achieve bidirectional binding
 * - decorates limited to 1 (multiple decorators cause error)
 * - No event listener when readonly/ro is specified
 * - Uses filtered value for state comparison and update
 *
 * @throws BIND-201 Value is not array: 配列以外が渡された場合 / When non-array value is passed
 * @throws BIND-201 Has multiple decorators: decorates が複数指定された場合 / When multiple decorators are specified
 */
class BindingNodeCheckbox extends BindingNode {
    /**
     * チェックボックスの value 属性を返す getter。
     * 双方向バインディング時に現在のチェックボックスの値を取得するために使用。
     *
     * Getter to return checkbox value attribute.
     * Used to get current checkbox value in bidirectional binding.
     */
    get value() {
        const element = this.node;
        return element.value;
    }
    /**
     * フィルタ適用後のチェックボックス value を返す getter。
     * 双方向バインディング時に状態更新する値を取得するために使用。
     *
     * Getter to return filtered checkbox value.
     * Used to get value for state update in bidirectional binding.
     */
    get filteredValue() {
        let value = this.value;
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    /**
     * コンストラクタ。
     * - 親クラス（BindingNode）を初期化
     * - チェックボックスの双方向バインディングを設定（イベントリスナー登録）
     *
     * 処理フロー:
     * 1. super() で親クラスを初期化
     * 2. ノードが HTMLInputElement かつ type="checkbox" であることを確認
     * 3. decorates の数が1つ以下であることを確認（複数はエラー）
     * 4. decorates からイベント名を抽出（デフォルトは "input"）
     * 5. readonly/ro の場合は早期リターン（イベントリスナー登録なし）
     * 6. イベントリスナーを登録し、双方向バインディングを実現
     *
     * イベント名の処理:
     * - decorates[0] が "onchange" の場合 → "change"
     * - decorates[0] が "change" の場合 → "change"
     * - decorates[0] が未指定の場合 → "input"（デフォルト）
     * - "readonly" または "ro" の場合 → イベントリスナー登録なし
     *
     * 双方向バインディングの仕組み:
     * 1. ユーザーがチェックボックスをクリック
     * 2. イベントが発火
     * 3. filteredValue（フィルタ適用後の value）を取得
     * 4. createUpdater で状態更新トランザクションを開始
     * 5. binding.updateStateValue で配列に value を追加/削除
     * 6. 状態変更が他のバインディングに伝播
     *
     * Constructor.
     * - Initializes parent class (BindingNode)
     * - Sets up checkbox bidirectional binding (registers event listener)
     *
     * Processing flow:
     * 1. Initialize parent class with super()
     * 2. Verify node is HTMLInputElement and type="checkbox"
     * 3. Verify decorates count is 1 or less (multiple causes error)
     * 4. Extract event name from decorates (default is "input")
     * 5. Early return if readonly/ro (no event listener registration)
     * 6. Register event listener to achieve bidirectional binding
     *
     * Event name processing:
     * - If decorates[0] is "onchange" → "change"
     * - If decorates[0] is "change" → "change"
     * - If decorates[0] is unspecified → "input" (default)
     * - If "readonly" or "ro" → No event listener registration
     *
     * Bidirectional binding mechanism:
     * 1. User clicks checkbox
     * 2. Event fires
     * 3. Get filteredValue (filtered value)
     * 4. Start state update transaction with createUpdater
     * 5. Add/remove value to/from array with binding.updateStateValue
     * 6. State change propagates to other bindings
     */
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        // ステップ1-2: ノードタイプとチェックボックスタイプの確認
        // Step 1-2: Verify node type and checkbox type
        const isInputElement = this.node instanceof HTMLInputElement;
        if (!isInputElement)
            return;
        const inputElement = this.node;
        if (inputElement.type !== "checkbox")
            return;
        // ステップ3: decorates の数を確認（複数はエラー）
        // Step 3: Verify decorates count (multiple causes error)
        if (decorates.length > 1) {
            raiseError({
                code: "BIND-201",
                message: "Has multiple decorators",
                context: { where: "BindingNodeCheckbox.constructor", name: this.name, decoratesCount: decorates.length },
                docsUrl: "/docs/error-codes.md#bind",
                severity: "error",
            });
        }
        // ステップ4: イベント名を抽出（"on" プレフィックスを削除）
        // Step 4: Extract event name (remove "on" prefix)
        const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
        const eventName = event ?? "input";
        // ステップ5: readonly/ro の場合は早期リターン
        // Step 5: Early return if readonly/ro
        if (eventName === "readonly" || eventName === "ro")
            return;
        // ステップ6: イベントリスナーを登録（双方向バインディング）
        // Step 6: Register event listener (bidirectional binding)
        const engine = this.binding.engine;
        this.node.addEventListener(eventName, async (e) => {
            const loopContext = this.binding.parentBindContent.currentLoopContext;
            const value = this.filteredValue;
            // 同期処理で状態を更新
            // Update state synchronously
            createUpdater(engine, (updater) => {
                updater.update(loopContext, (state, handler) => {
                    binding.updateStateValue(state, handler, value);
                });
            });
        });
    }
    /**
     * 配列値に基づいて checked 状態を設定するメソッド。
     *
     * 処理フロー:
     * 1. 値が配列であることを確認（配列でない場合はエラー）
     * 2. filteredValue（フィルタ適用後の input.value）を取得
     * 3. 配列に filteredValue が含まれるかを判定
     * 4. 判定結果を element.checked に設定
     *
     * チェックボックスの動作:
     * - value=['apple', 'banana'], filteredValue='apple' → checked=true
     * - value=['apple', 'banana'], filteredValue='orange' → checked=false
     * - value=[], filteredValue='apple' → checked=false
     *
     * エラー条件:
     * - value が配列でない場合（文字列、数値、オブジェクト等）
     *
     * Method to set checked state based on array value.
     *
     * Processing flow:
     * 1. Verify value is array (error if not array)
     * 2. Get filteredValue (filtered input.value)
     * 3. Determine if array includes filteredValue
     * 4. Set determination result to element.checked
     *
     * Checkbox behavior:
     * - value=['apple', 'banana'], filteredValue='apple' → checked=true
     * - value=['apple', 'banana'], filteredValue='orange' → checked=false
     * - value=[], filteredValue='apple' → checked=false
     *
     * Error conditions:
     * - When value is not array (string, number, object, etc.)
     *
     * @param value - 配列値（チェックボックスの value が含まれるか判定） / Array value (determines if checkbox value is included)
     */
    assignValue(value) {
        // ステップ1: 配列であることを確認
        // Step 1: Verify it's an array
        if (!Array.isArray(value)) {
            raiseError({
                code: 'BIND-201',
                message: 'Value is not array',
                context: { where: 'BindingNodeCheckbox.update', receivedType: typeof value },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        // ステップ2-4: filteredValue を取得し、配列に含まれるかで checked を設定
        // Step 2-4: Get filteredValue, set checked based on array inclusion
        const filteredValue = this.filteredValue;
        const element = this.node;
        element.checked = value.includes(filteredValue);
    }
}
/**
 * チェックボックス用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名（例: "prop.checked"）
 * - filterTexts: フィルタテキスト配列（パース結果）
 * - decorates: デコレータ文字列配列（イベント名または "readonly"/"ro"）
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeCheckbox を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeCheckbox インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate checkbox binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "prop.checked")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (event name or "readonly"/"ro")
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeCheckbox
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeCheckbox instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeCheckbox = (name, filterTexts, decorates) => (binding, node, filters) => {
    // フィルタ関数群を生成
    // Generate filter functions
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeCheckbox(binding, node, name, filterFns, decorates);
};
