import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNodeRadio クラスは、ラジオボタン(input[type="radio"])の
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、ラジオボタン固有の処理を実装
 * - バインディング値と input 要素の value を比較して checked 状態を制御
 * - 双方向バインディング対応(ユーザー選択時に状態を自動更新)
 * - null/undefined は空文字列に変換して比較
 *
 * 主な役割:
 * 1. バインディング値と input.value が一致していれば checked=true にする
 * 2. ラジオボタン選択時に filteredValue を状態に反映(双方向バインディング)
 * 3. null/undefined の場合は空文字列に変換して比較
 * 4. デコレータによるイベント名のカスタマイズ(onInput, onChange 等)
 * 5. フィルタ適用後の値を使用して状態比較・更新を実行
 *
 * 使用例:
 * - <input type="radio" value="apple" data-bind="checked: selectedFruit"> → selectedFruit が "apple" の時チェック
 * - <input type="radio" value="banana" data-bind="checked: selectedFruit"> → selectedFruit が "banana" の時チェック
 * - <input type="radio" value="orange" data-bind="checked.onchange: selectedFruit"> → change イベントで双方向バインディング
 *
 * 設計ポイント:
 * - assignValue で値を文字列化し、input 要素の value と比較して checked を制御
 * - constructor でイベントリスナーを登録し、双方向バインディングを実現
 * - decorates の数は1つまで(複数指定はエラー)
 * - readonly/ro 指定時はイベントリスナーを登録しない(単方向バインディング)
 * - フィルタ適用後の値を使用して状態比較・更新を実行
 * - null/undefined を空文字列に変換することで、安全な比較を実現
 *
 * ---
 *
 * BindingNodeRadio class implements binding processing for radio buttons (input[type="radio"]).
 *
 * Architecture:
 * - Inherits BindingNode, implements radio button specific processing
 * - Controls checked state by comparing binding value with input element value
 * - Supports bidirectional binding (auto-updates state on user selection)
 * - Converts null/undefined to empty string for comparison
 *
 * Main responsibilities:
 * 1. Set checked=true if binding value matches input.value
 * 2. Reflect filteredValue to state on radio button selection (bidirectional binding)
 * 3. Convert null/undefined to empty string for comparison
 * 4. Customize event name with decorator (onInput, onChange, etc.)
 * 5. Execute state comparison and update using filtered value
 *
 * Usage examples:
 * - <input type="radio" value="apple" data-bind="checked: selectedFruit"> → Checked when selectedFruit is "apple"
 * - <input type="radio" value="banana" data-bind="checked: selectedFruit"> → Checked when selectedFruit is "banana"
 * - <input type="radio" value="orange" data-bind="checked.onchange: selectedFruit"> → Bidirectional binding with change event
 *
 * Design points:
 * - assignValue stringifies value, compares with input element value to control checked
 * - Register event listener in constructor to achieve bidirectional binding
 * - decorates limited to 1 (multiple decorators cause error)
 * - No event listener when readonly/ro is specified (one-way binding)
 * - Execute state comparison and update using filtered value
 * - Convert null/undefined to empty string for safe comparison
 *
 * @throws BIND-201 Has multiple decorators: decorates が複数指定された場合 / When multiple decorators are specified
 */
class BindingNodeRadio extends BindingNode {
  /**
   * ラジオボタンの value 属性を返す getter。
   * 双方向バインディング時に現在のラジオボタンの値を取得するために使用される。
   *
   * Getter to return radio button value attribute.
   * Used to get current radio button value in bidirectional binding.
   */
  get value(): any {
    const element = this.node as HTMLInputElement;
    return element.value;
  }
  
  /**
   * フィルタ適用後のラジオボタン value を返す getter。
   * 双方向バインディング時に状態更新する値を取得するために使用される。
   *
   * Getter to return filtered radio button value.
   * Used to get value for state update in bidirectional binding.
   */
  get filteredValue(): any {
    let value = this.value;
    for (let i = 0; i < this.filters.length; i++) {
      value = this.filters[i](value);
    }
    return value;
  }
  
  /**
   * コンストラクタ。
   * - 親クラス(BindingNode)を初期化
   * - ラジオボタンの双方向バインディングを設定(イベントリスナー登録)
   *
   * 処理フロー:
   * 1. super() で親クラスを初期化
   * 2. ノードが HTMLInputElement かつ type="radio" であることを確認
   * 3. decorates の数が1つ以下であることを確認(複数はエラー)
   * 4. decorates からイベント名を抽出(デフォルトは "input")
   * 5. readonly/ro の場合は早期リターン(イベントリスナー登録なし)
   * 6. イベントリスナーを登録し、双方向バインディングを実現
   *
   * イベント名の処理:
   * - decorates[0] が "onchange" の場合 → "change"
   * - decorates[0] が "change" の場合 → "change"
   * - decorates[0] が未指定の場合 → "input"(デフォルト)
   * - "readonly" または "ro" の場合 → イベントリスナー登録なし
   *
   * 双方向バインディングの仕組み:
   * 1. ユーザーがラジオボタンを選択
   * 2. イベントが発火
   * 3. filteredValue(フィルタ適用後の value)を取得
   * 4. createUpdater で状態更新トランザクションを開始
   * 5. binding.updateStateValue で状態を更新
   * 6. 状態変更が他のバインディングに伝播
   *
   * Constructor.
   * - Initializes parent class (BindingNode)
   * - Sets up radio button bidirectional binding (registers event listener)
   *
   * Processing flow:
   * 1. Initialize parent class with super()
   * 2. Verify node is HTMLInputElement and type="radio"
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
   * 1. User selects radio button
   * 2. Event fires
   * 3. Get filteredValue (filtered value)
   * 4. Start state update transaction with createUpdater
   * 5. Update state with binding.updateStateValue
   * 6. State change propagates to other bindings
   */
  constructor(
    binding: IBinding,
    node: Node,
    name: string,
    filters: Filters,
    decorates: string[],
  ) {
    super(binding, node, name, filters, decorates);

    // ステップ1-2: ノードタイプとラジオボタンタイプの確認
    // Step 1-2: Verify node type and radio button type
    const isInputElement = this.node instanceof HTMLInputElement;
    if (!isInputElement) return;
    const inputElement = this.node as HTMLInputElement;
    if (inputElement.type !== "radio") return;
    
    // ステップ3: decorates の数を確認(複数はエラー)
    // Step 3: Verify decorates count (multiple causes error)
    if (decorates.length > 1) {
      raiseError({
        code: "BIND-201",
        message: "Has multiple decorators",
        context: { where: "BindingNodeRadio.constructor", name: this.name, decoratesCount: decorates.length },
        docsUrl: "/docs/error-codes.md#bind",
        severity: "error",
      });
    }
    
    // ステップ4: イベント名を抽出("on" プレフィックスを削除)
    // Step 4: Extract event name (remove "on" prefix)
    const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
    const eventName = event ?? "input";
    
    // ステップ5: readonly/ro の場合は早期リターン
    // Step 5: Early return if readonly/ro
    if (eventName === "readonly" || eventName === "ro") return;
    
    // ステップ6: イベントリスナーを登録(双方向バインディング)
    // Step 6: Register event listener (bidirectional binding)
    const engine = this.binding.engine;
    this.node.addEventListener(eventName, async (e) => {
      const loopContext = this.binding.parentBindContent.currentLoopContext;
      const value = this.filteredValue;
      // 同期処理で状態を更新
      // Update state synchronously
      createUpdater<void>(engine, (updater) => {
        updater.update(loopContext, (state, handler) => {
          binding.updateStateValue(state, handler, value);
        });
      });
    });

  }
  
  /**
   * バインディング値に基づいて checked 状態を設定するメソッド。
   * バインディング値と filteredValue が一致する場合のみ checked=true にする。
   *
   * 処理フロー:
   * 1. 値が null または undefined の場合、空文字列 "" に変換
   * 2. ノードを HTMLInputElement にキャスト
   * 3. バインディング値と filteredValue を厳密等価比較(===)
   * 4. 比較結果を element.checked に設定
   *
   * ラジオボタンの動作:
   * - value="apple", バインディング値="apple" → checked=true
   * - value="apple", バインディング値="banana" → checked=false
   * - value="orange", バインディング値=null → checked=false ("" !== "orange")
   * - value="", バインディング値=null → checked=true ("" === "")
   *
   * null/undefined の扱い:
   * - バインディング値が null → "" に変換
   * - バインディング値が undefined → "" に変換
   * - これにより value="" のラジオボタンと一致可能
   *
   * 設計意図:
   * - 厳密等価比較(===)により、型も含めた完全一致を要求
   * - null/undefined を空文字列に変換し、空の value 属性との比較を可能に
   * - filteredValue を使用することで、フィルタ適用後の値で比較
   * - 複数のラジオボタンのうち、値が一致するものだけが checked=true になる
   *
   * Method to set checked state based on binding value.
   * Only sets checked=true if binding value matches filteredValue.
   *
   * Processing flow:
   * 1. Convert value to empty string "" if null or undefined
   * 2. Cast node to HTMLInputElement
   * 3. Strictly compare (===) binding value with filteredValue
   * 4. Set comparison result to element.checked
   *
   * Radio button behavior:
   * - value="apple", binding value="apple" → checked=true
   * - value="apple", binding value="banana" → checked=false
   * - value="orange", binding value=null → checked=false ("" !== "orange")
   * - value="", binding value=null → checked=true ("" === "")
   *
   * Handling null/undefined:
   * - Binding value is null → Convert to ""
   * - Binding value is undefined → Convert to ""
   * - This enables matching with radio button with value=""
   *
   * Design intent:
   * - Strict equality comparison (===) requires complete match including type
   * - Convert null/undefined to empty string to enable comparison with empty value attribute
   * - Use filteredValue to compare with filtered value
   * - Among multiple radio buttons, only the one with matching value becomes checked=true
   *
   * @param value - バインディング値(ラジオボタンの value と比較) / Binding value (compared with radio button value)
   */
  assignValue(value:any) {
    // ステップ1: null/undefined を空文字列に変換
    // Step 1: Convert null/undefined to empty string
    if (value === null || value === undefined) {
      value = "";
    }
    
    // ステップ2-4: バインディング値と filteredValue を比較して checked を設定
    // Step 2-4: Compare binding value with filteredValue and set checked
    const element = this.node as HTMLInputElement;
    element.checked = value === this.filteredValue;
  }
}

/**
 * ラジオボタン用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "checked")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(イベント名または "readonly"/"ro")
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeRadio を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeRadio インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate radio button binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "checked")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (event name or "readonly"/"ro")
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeRadio
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeRadio instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeRadio: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      // フィルタ関数群を生成
      // Generate filter functions
      const filterFns = createFilters(filters, filterTexts);
      return new BindingNodeRadio(binding, node, name, filterFns, decorates);
    }
