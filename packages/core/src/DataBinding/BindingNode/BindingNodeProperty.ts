import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * 双方向バインディングが可能な HTML 要素かどうかを判定するヘルパー関数。
 * HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement のいずれかである場合に true を返す。
 *
 * 双方向バインディング可能な要素:
 * - <input> 要素 (HTMLInputElement)
 * - <textarea> 要素 (HTMLTextAreaElement)
 * - <select> 要素 (HTMLSelectElement)
 *
 * Helper function to determine if element supports bidirectional binding.
 * Returns true if element is HTMLInputElement, HTMLTextAreaElement, or HTMLSelectElement.
 *
 * Elements supporting bidirectional binding:
 * - <input> element (HTMLInputElement)
 * - <textarea> element (HTMLTextAreaElement)
 * - <select> element (HTMLSelectElement)
 *
 * @param element - チェック対象の HTML 要素 / HTML element to check
 * @returns 双方向バインディング可能な場合 true / true if supports bidirectional binding
 */
function isTwoWayBindable(element: HTMLElement): boolean {
  return element instanceof HTMLInputElement
    || element instanceof HTMLTextAreaElement
    || element instanceof HTMLSelectElement;
}

/**
 * プロパティ名ごとのデフォルトイベント名を定義するマッピング。
 * 双方向バインディング時に、デコレータが指定されていない場合に使用される。
 *
 * プロパティとイベントの対応:
 * - value, valueAsNumber, valueAsDate → "input" イベント
 * - checked, selected → "change" イベント
 *
 * Mapping defining default event name for each property name.
 * Used in bidirectional binding when decorator is not specified.
 *
 * Property and event correspondence:
 * - value, valueAsNumber, valueAsDate → "input" event
 * - checked, selected → "change" event
 */
const defaultEventByName: Record<string, string> = {
  value: "input",
  valueAsNumber: "input",
  valueAsDate: "input",
  checked: "change",
  selected: "change",
};

/**
 * 要素タイプ(input type 属性値)ごとの双方向バインディング可能なプロパティセットの型定義。
 * キーは要素タイプ、値はプロパティ名の Set。
 *
 * Type definition for bidirectional bindable property sets by element type (input type attribute value).
 * Key is element type, value is Set of property names.
 */
type DefaultPropertyByElementType = {
  [key: string]: Set<string>;
};

/**
 * input 要素のタイプ(type 属性)ごとの双方向バインディング可能なプロパティを定義。
 * radio と checkbox は checked プロパティのみが双方向バインディング可能。
 * 他のタイプ(text, number 等)は定義されていないため、デフォルトで値系プロパティ(value 等)が使用される。
 *
 * Defines bidirectional bindable properties for each input element type (type attribute).
 * Only checked property is bidirectionally bindable for radio and checkbox.
 * Other types (text, number, etc.) are not defined, so value-related properties are used by default.
 */
const twoWayPropertyByElementType: DefaultPropertyByElementType = {
  radio: new Set(["checked"]),
  checkbox: new Set(["checked"]),
};

/**
 * 値系プロパティ(value, valueAsNumber, valueAsDate)のセット。
 * テキスト入力系要素のデフォルト双方向バインディングプロパティとして使用される。
 *
 * Set of value-related properties (value, valueAsNumber, valueAsDate).
 * Used as default bidirectional binding properties for text input elements.
 */
const VALUES_SET = new Set(["value", "valueAsNumber", "valueAsDate"]);

/**
 * 空のプロパティセット。
 * 双方向バインディング不可能な要素に対して使用される。
 *
 * Empty property set.
 * Used for elements that don't support bidirectional binding.
 */
const BLANK_SET = new Set<string>();

/**
 * HTML 要素の双方向バインディング可能なプロパティセットを取得するヘルパー関数。
 * 要素のタイプに応じて適切なプロパティセットを返す。
 *
 * 要素タイプごとの戻り値:
 * - HTMLSelectElement, HTMLTextAreaElement, HTMLOptionElement → VALUES_SET (value 系)
 * - HTMLInputElement:
 *   - type="radio" → new Set(["checked"])
 *   - type="checkbox" → new Set(["checked"])
 *   - その他の type → VALUES_SET (value 系)
 * - その他の要素 → BLANK_SET (空)
 *
 * Helper function to get bidirectional bindable property set for HTML element.
 * Returns appropriate property set according to element type.
 *
 * Return value by element type:
 * - HTMLSelectElement, HTMLTextAreaElement, HTMLOptionElement → VALUES_SET (value-related)
 * - HTMLInputElement:
 *   - type="radio" → new Set(["checked"])
 *   - type="checkbox" → new Set(["checked"])
 *   - other types → VALUES_SET (value-related)
 * - Other elements → BLANK_SET (empty)
 *
 * @param node - チェック対象のノード / Node to check
 * @returns 双方向バインディング可能なプロパティ名のセット / Set of bidirectional bindable property names
 */
const getTwoWayPropertiesHTMLElement = (node: Node): Set<string> =>
  node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLOptionElement
    ? VALUES_SET
    : node instanceof HTMLInputElement
      ? (twoWayPropertyByElementType[node.type] ?? VALUES_SET)
      : BLANK_SET;


/**
 * BindingNodeProperty クラスは、ノードのプロパティ(value, checked, selected など)への
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、プロパティバインディング固有の処理を実装
 * - HTML 要素のプロパティ(value, checked 等)に値を割り当て
 * - 双方向バインディング(input, change イベント等)に対応
 * - デコレータでイベント名をカスタマイズ可能
 *
 * 主な役割:
 * 1. ノードプロパティへの値の割り当て・取得
 * 2. 双方向バインディング対応要素の判定とイベントリスナー登録
 * 3. デコレータによるイベント名のカスタマイズ(onInput, onChange 等)
 * 4. イベント発火時の状態更新(Updater 経由)
 * 5. null/undefined/NaN の空文字列変換
 *
 * 使用例:
 * - <input data-bind="value: userName"> → userName を input.value にバインド(双方向)
 * - <input type="checkbox" data-bind="checked: isActive"> → isActive を input.checked にバインド(双方向)
 * - <select data-bind="value: selectedOption"> → selectedOption を select.value にバインド(双方向)
 * - <input data-bind="value.onchange: text"> → change イベントで双方向バインディング
 * - <div data-bind="textContent: message"> → message を div.textContent にバインド(単方向)
 *
 * 設計ポイント:
 * - デフォルトプロパティ名と一致し、かつ双方向バインディング可能な要素の場合のみイベントリスナーを登録
 * - デコレータでイベント名を指定可能("onInput", "onChange" 等、"on" プレフィックスは自動除去)
 * - デコレータが複数指定された場合はエラー(BIND-201)
 * - readonly または ro デコレータが指定された場合はイベントリスナーを登録しない(単方向バインディング)
 * - イベント発火時は Updater 経由で状態を非同期的に更新
 * - assignValue で null/undefined/NaN は空文字列に変換してセット
 * - value getter/filteredValue getter でフィルタ適用後の値を取得
 *
 * ---
 *
 * BindingNodeProperty class implements binding processing to node properties (value, checked, selected, etc.).
 *
 * Architecture:
 * - Inherits BindingNode, implements property binding specific processing
 * - Assigns values to HTML element properties (value, checked, etc.)
 * - Supports bidirectional binding (input, change events, etc.)
 * - Event name customizable with decorators
 *
 * Main responsibilities:
 * 1. Assign and get values to/from node properties
 * 2. Determine bidirectional binding compatible elements and register event listeners
 * 3. Customize event names with decorators (onInput, onChange, etc.)
 * 4. Update state on event firing (via Updater)
 * 5. Convert null/undefined/NaN to empty string
 *
 * Usage examples:
 * - <input data-bind="value: userName"> → Bind userName to input.value (bidirectional)
 * - <input type="checkbox" data-bind="checked: isActive"> → Bind isActive to input.checked (bidirectional)
 * - <select data-bind="value: selectedOption"> → Bind selectedOption to select.value (bidirectional)
 * - <input data-bind="value.onchange: text"> → Bidirectional binding with change event
 * - <div data-bind="textContent: message"> → Bind message to div.textContent (one-way)
 *
 * Design points:
 * - Register event listener only if property name matches default and element supports bidirectional binding
 * - Event name specifiable with decorator ("onInput", "onChange", etc., "on" prefix automatically removed)
 * - Error (BIND-201) if multiple decorators specified
 * - Don't register event listener if readonly or ro decorator specified (one-way binding)
 * - Update state asynchronously via Updater on event firing
 * - assignValue converts null/undefined/NaN to empty string
 * - Get filtered value with value getter/filteredValue getter
 *
 * @throws BIND-201 Has multiple decorators: デコレータが複数指定された場合 / When multiple decorators are specified
 */
class BindingNodeProperty extends BindingNode {
  /**
   * ノードのプロパティ値を取得する getter。
   * 双方向バインディング時に現在のプロパティ値を取得するために使用される。
   *
   * 例:
   * - input.value の場合、現在の input 要素の value プロパティを返す
   * - input.checked の場合、現在の input 要素の checked プロパティを返す
   *
   * Getter to get node property value.
   * Used to get current property value in bidirectional binding.
   *
   * Examples:
   * - For input.value, returns current value property of input element
   * - For input.checked, returns current checked property of input element
   */
  get value(): any {
    // @ts-ignore
    return this.node[this.name];
  }
  
  /**
   * フィルタ適用後のノードプロパティ値を取得する getter。
   * 双方向バインディング時に状態更新する値を取得するために使用される。
   *
   * 処理:
   * - value getter でプロパティ値を取得
   * - 登録されている全フィルタを順次適用
   * - フィルタ適用後の値を返す
   *
   * Getter to get filtered node property value.
   * Used to get value for state update in bidirectional binding.
   *
   * Processing:
   * - Get property value with value getter
   * - Apply all registered filters sequentially
   * - Return filtered value
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
   * - 双方向バインディング可能な要素の場合、イベントリスナーを登録
   *
   * 処理フロー:
   * 1. super() で親クラスを初期化
   * 2. ノードが HTMLElement でない場合は早期リターン(イベントリスナー登録なし)
   * 3. isTwoWayBindable() で双方向バインディング可能な要素かチェック(不可の場合は早期リターン)
   * 4. getTwoWayPropertiesHTMLElement() で要素の双方向バインディング可能プロパティセットを取得
   * 5. this.name がデフォルトプロパティに含まれない場合は早期リターン
   * 6. decorates が複数(2つ以上)指定されている場合はエラー(BIND-201)
   * 7. decorates からイベント名を抽出("on" プレフィックスを除去)
   * 8. イベント名が指定されていない場合、defaultEventByName からデフォルトイベント名を取得
   * 9. イベント名が "readonly" または "ro" の場合は早期リターン(単方向バインディング)
   * 10. addEventListener でイベントリスナーを登録し、双方向バインディングを実現
   *
   * イベント名の決定ロジック:
   * - デコレータあり:
   *   - "onInput" → "input"
   *   - "onChange" → "change"
   *   - "input" → "input"
   * - デコレータなし:
   *   - value プロパティ → "input"(defaultEventByName から)
   *   - checked プロパティ → "change"(defaultEventByName から)
   *   - 定義なし → "readonly"(イベントリスナー登録なし)
   *
   * 双方向バインディングの仕組み:
   * 1. ユーザーが要素を操作(入力、選択等)
   * 2. イベントが発火
   * 3. filteredValue でフィルタ適用後の現在値を取得
   * 4. createUpdater で状態更新トランザクションを開始
   * 5. binding.updateStateValue で状態を更新
   * 6. 状態変更が他のバインディングに伝播
   *
   * Constructor.
   * - Initializes parent class (BindingNode)
   * - Registers event listener if element supports bidirectional binding
   *
   * Processing flow:
   * 1. Initialize parent class with super()
   * 2. Early return if node is not HTMLElement (no event listener registration)
   * 3. Check if element supports bidirectional binding with isTwoWayBindable() (early return if not)
   * 4. Get bidirectional bindable property set for element with getTwoWayPropertiesHTMLElement()
   * 5. Early return if this.name is not in default properties
   * 6. Error (BIND-201) if multiple (2 or more) decorators specified
   * 7. Extract event name from decorates (remove "on" prefix)
   * 8. If event name not specified, get default event name from defaultEventByName
   * 9. Early return if event name is "readonly" or "ro" (one-way binding)
   * 10. Register event listener with addEventListener to achieve bidirectional binding
   *
   * Event name determination logic:
   * - With decorator:
   *   - "onInput" → "input"
   *   - "onChange" → "change"
   *   - "input" → "input"
   * - Without decorator:
   *   - value property → "input" (from defaultEventByName)
   *   - checked property → "change" (from defaultEventByName)
   *   - undefined → "readonly" (no event listener registration)
   *
   * Bidirectional binding mechanism:
   * 1. User manipulates element (input, selection, etc.)
   * 2. Event fires
   * 3. Get current value after filter with filteredValue
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

    // ステップ2: HTMLElement でない場合は早期リターン
    // Step 2: Early return if not HTMLElement
    const isElement = this.node instanceof HTMLElement;
    if (!isElement) return;
    
    // ステップ3: 双方向バインディング可能な要素かチェック
    // Step 3: Check if element supports bidirectional binding
    if (!isTwoWayBindable(this.node)) return;
    
    // ステップ4-5: デフォルトプロパティに含まれるかチェック
    // Step 4-5: Check if included in default properties
    const defaultNames = getTwoWayPropertiesHTMLElement(this.node);
    if (!defaultNames.has(this.name)) return;
    
    // ステップ6: デコレータが複数指定されている場合はエラー
    // Step 6: Error if multiple decorators specified
    if (decorates.length > 1) {
      raiseError({
        code: "BIND-201",
        message: "Has multiple decorators",
        context: { where: "BindingNodeProperty.constructor", name: this.name, decoratesCount: decorates.length },
        docsUrl: "/docs/error-codes.md#bind",
        severity: "error",
      });
    }
    
    // ステップ7-8: イベント名を決定
    // Step 7-8: Determine event name
    const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
    const eventName = event ?? defaultEventByName[this.name] ?? "readonly";
    
    // ステップ9: readonly の場合は早期リターン
    // Step 9: Early return if readonly
    if (eventName === "readonly" || eventName === "ro") return;

    // ステップ10: イベントリスナーを登録(双方向バインディング)
    // Step 10: Register event listener (bidirectional binding)
    const engine = this.binding.engine;
    this.node.addEventListener(eventName, async () => {
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
   * 初期化処理(空実装)。
   * サブクラスで必要に応じてオーバーライドして初期化処理を実装可能。
   *
   * 設計意図:
   * - 基底クラスでは特別な初期化処理が不要なため空実装
   * - サブクラスで追加の初期化ロジックが必要な場合にオーバーライド
   *
   * Initialization processing (empty implementation).
   * Subclasses can override to implement initialization processing as needed.
   *
   * Design intent:
   * - Empty implementation as no special initialization needed in base class
   * - Override in subclass if additional initialization logic needed
   */
  init() {
    // サブクラスで初期化処理を実装可能
    // Subclasses can implement initialization processing
  }

  /**
   * ノードのプロパティに値を割り当てるメソッド。
   * null/undefined/NaN は空文字列に変換してから割り当てる。
   *
   * 処理:
   * 1. 値が null, undefined, NaN のいずれかの場合、空文字列 "" に変換
   * 2. this.node[this.name] に値を割り当て
   *
   * 変換例:
   * - null → ""
   * - undefined → ""
   * - NaN → ""
   * - 0 → 0 (変換なし)
   * - false → false (変換なし)
   * - "text" → "text" (変換なし)
   *
   * 設計意図:
   * - null/undefined/NaN を空文字列に変換することで、プロパティに安全に割り当て
   * - HTML 要素のプロパティに null や NaN を設定すると "null" "NaN" という文字列になるため、空文字列に変換
   * - 空文字列に変換することで、ユーザーに対して適切な表示を実現
   *
   * Method to assign value to node property.
   * Converts null/undefined/NaN to empty string before assignment.
   *
   * Processing:
   * 1. Convert value to empty string "" if null, undefined, or NaN
   * 2. Assign value to this.node[this.name]
   *
   * Conversion examples:
   * - null → ""
   * - undefined → ""
   * - NaN → ""
   * - 0 → 0 (no conversion)
   * - false → false (no conversion)
   * - "text" → "text" (no conversion)
   *
   * Design intent:
   * - Safely assign to property by converting null/undefined/NaN to empty string
   * - Setting null or NaN to HTML element property results in "null" "NaN" string, so convert to empty string
   * - Achieve appropriate display to user by converting to empty string
   *
   * @param value - 割り当てる値 / Value to assign
   */
  assignValue(value: any) {
    // null/undefined/NaN を空文字列に変換
    // Convert null/undefined/NaN to empty string
    if (value === null || value === undefined || Number.isNaN(value)) {
      value = "";
    }
    // プロパティに値を割り当て
    // Assign value to property
    // @ts-ignore
    this.node[this.name] = value;
  }
}

/**
 * プロパティバインディングノード生成用ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "value", "checked")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列("onInput", "onChange", "readonly" 等)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeProperty を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeProperty インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate property binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "value", "checked")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings ("onInput", "onChange", "readonly", etc.)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeProperty
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeProperty instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeProperty: CreateBindingNodeFn =
  (name: string, filterTexts: IFilterText[], decorates: string[]) =>
    (binding: IBinding, node: Node, filters: FilterWithOptions) => {
      // フィルタ関数群を生成
      // Generate filter functions
      const filterFns = createFilters(filters, filterTexts);
      return new BindingNodeProperty(binding, node, name, filterFns, decorates);
    };
