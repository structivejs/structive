import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { IListIndex } from "../../ListIndex/types";
import { IReadonlyStateProxy } from "../../StateClass/types";
import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { IRenderer } from "../../Updater/types";
import { IBindContent, IBinding, IRenderBinding } from "../types";

/**
 * BindingNode 関連の型定義ファイル。
 * 
 * このファイルでは、データバインディングシステムの中核となる BindingNode の
 * インターフェースと関連する型を定義しています。
 * 
 * 主な型定義:
 * - IBindingNodeBase: BindingNode の基本インターフェース（プロパティとメソッド）
 * - IBindingNode: 完全な BindingNode インターフェース（ライフサイクルメソッド含む）
 * - CreateBindingNodeFn: BindingNode 生成ファクトリ関数の型
 * - CreateBindingNodeByNodeFn: ノード固有の BindingNode 生成関数の型
 * 
 * 設計思想:
 * - 各種バインディングタイプ（プロパティ、属性、イベント、for/if 等）の共通インターフェースを定義
 * - 柔軟なバインディング記法やフィルター・デコレータ対応のための型安全な設計
 * - ファクトリパターンによるインスタンス生成の抽象化
 * - ライフサイクル管理（activate/inactivate）とレンダリング（applyChange）の統合
 * 
 * Type definition file for BindingNode related types.
 * 
 * This file defines interfaces and related types for BindingNode, which is
 * the core of the data binding system.
 * 
 * Main type definitions:
 * - IBindingNodeBase: Basic BindingNode interface (properties and methods)
 * - IBindingNode: Complete BindingNode interface (including lifecycle methods)
 * - CreateBindingNodeFn: Type for BindingNode generation factory function
 * - CreateBindingNodeByNodeFn: Type for node-specific BindingNode generation function
 * 
 * Design philosophy:
 * - Define common interface for various binding types (property, attribute, event, for/if, etc.)
 * - Type-safe design for flexible binding notation and filter/decorator support
 * - Abstract instance generation with factory pattern
 * - Integrate lifecycle management (activate/inactivate) and rendering (applyChange)
 */

/**
 * IBindingNodeBase インターフェース
 * 
 * BindingNode の基本的なプロパティとメソッドを定義するインターフェース。
 * すべての BindingNode 実装（BindingNodeProperty、BindingNodeFor 等）が
 * このインターフェースを実装する必要があります。
 * 
 * 構造:
 * - 読み取り専用プロパティ: node、name、subName、decorates、binding、filters 等
 * - 値アクセスプロパティ: value、filteredValue
 * - ライフサイクルメソッド: init、activate、inactivate
 * - 更新メソッド: assignValue、updateElements、applyChange
 * - 通知メソッド: notifyRedraw
 * 
 * 主な役割:
 * - DOM ノードとバインディング情報の1対1対応を表現
 * - 状態変更の検出と DOM への反映
 * - フィルターやデコレータによる値の加工
 * - リスト要素やネストされたバインディングの管理
 * 
 * IBindingNodeBase interface
 * 
 * Interface that defines basic properties and methods of BindingNode.
 * All BindingNode implementations (BindingNodeProperty, BindingNodeFor, etc.)
 * must implement this interface.
 * 
 * Structure:
 * - Read-only properties: node, name, subName, decorates, binding, filters, etc.
 * - Value access properties: value, filteredValue
 * - Lifecycle methods: init, activate, inactivate
 * - Update methods: assignValue, updateElements, applyChange
 * - Notification methods: notifyRedraw
 * 
 * Main roles:
 * - Express 1-to-1 correspondence between DOM node and binding information
 * - Detect state changes and reflect to DOM
 * - Process values with filters and decorators
 * - Manage list elements and nested bindings
 */
export interface IBindingNodeBase {
  /**
   * バインディングが関連付けられている DOM ノード。
   * 
   * バインディングタイプに応じて以下のノードタイプが使用されます:
   * - テキストバインディング: Text ノード
   * - 属性バインディング: Element ノード
   * - イベントバインディング: Element ノード
   * - 構造制御（for/if）: Comment ノード
   * 
   * DOM node associated with binding.
   * 
   * Following node types are used depending on binding type:
   * - Text binding: Text node
   * - Attribute binding: Element node
   * - Event binding: Element node
   * - Structure control (for/if): Comment node
   */
  readonly node: Node;
  
  /**
   * バインディング名（バインディングのタイプを識別）。
   * 
   * 例:
   * - "text": テキストバインディング
   * - "value": 値バインディング（input/select/textarea）
   * - "for": ループバインディング
   * - "if": 条件分岐バインディング
   * - "on": イベントバインディング
   * - "attr": 属性バインディング
   * - "style": スタイルバインディング
   * - "class": クラスバインディング
   * 
   * Binding name (identifies binding type).
   * 
   * Examples:
   * - "text": Text binding
   * - "value": Value binding (input/select/textarea)
   * - "for": Loop binding
   * - "if": Conditional binding
   * - "on": Event binding
   * - "attr": Attribute binding
   * - "style": Style binding
   * - "class": Class binding
   */
  readonly name: string;
  
  /**
   * サブ名（バインディングの詳細を指定）。
   * 
   * name だけでは不十分な場合に追加情報を提供します。
   * 
   * 例:
   * - style.color → name="style", subName="color"
   * - attr.href → name="attr", subName="href"
   * - on.click → name="on", subName="click"
   * - class.active → name="class", subName="active"
   * 
   * 空文字列の場合、サブ名は不要（例: text、value、for、if）。
   * 
   * Sub-name (specifies binding details).
   * 
   * Provides additional information when name alone is insufficient.
   * 
   * Examples:
   * - style.color → name="style", subName="color"
   * - attr.href → name="attr", subName="href"
   * - on.click → name="on", subName="click"
   * - class.active → name="class", subName="active"
   * 
   * Empty string when sub-name is unnecessary (e.g., text, value, for, if).
   */
  readonly subName: string;
  
  /**
   * デコレータ配列（バインディングの動作を制御）。
   * 
   * デコレータはバインディングの動作をカスタマイズするための修飾子です。
   * 
   * 例:
   * - "once": 初回のみ実行（更新を無視）
   * - "prevent": デフォルト動作を抑制（preventDefault）
   * - "stop": イベント伝播を停止（stopPropagation）
   * - "capture": キャプチャフェーズでイベントを処理
   * - "passive": パッシブイベントリスナー（スクロールパフォーマンス向上）
   * 
   * Decorator array (controls binding behavior).
   * 
   * Decorators are modifiers to customize binding behavior.
   * 
   * Examples:
   * - "once": Execute only once (ignore updates)
   * - "prevent": Suppress default behavior (preventDefault)
   * - "stop": Stop event propagation (stopPropagation)
   * - "capture": Process event in capture phase
   * - "passive": Passive event listener (improve scroll performance)
   */
  readonly decorates: string[];
  
  /**
   * 親バインディングオブジェクトへの参照。
   * 
   * バインディングの状態管理、エンジンへのアクセス、
   * 依存関係の追跡などに使用されます。
   * 
   * 主な用途:
   * - バインディング状態（bindingState）へのアクセス
   * - バインディングエンジン（engine）へのアクセス
   * - リストインデックス管理（bindingsByListIndex）
   * - 親子関係の管理
   * 
   * Reference to parent binding object.
   * 
   * Used for binding state management, engine access,
   * dependency tracking, etc.
   * 
   * Main uses:
   * - Access to binding state (bindingState)
   * - Access to binding engine (engine)
   * - List index management (bindingsByListIndex)
   * - Parent-child relationship management
   */
  readonly binding: IBinding;
  
  /**
   * フィルター関数の配列。
   * 
   * バインディングの値を加工・変換するためのフィルター関数のリストです。
   * フィルターは順番に適用され、前のフィルターの出力が次のフィルターの入力となります。
   * 
   * 例:
   * - uppercase: 文字列を大文字に変換
   * - lowercase: 文字列を小文字に変換
   * - date: 日付フォーマット変換
   * - currency: 通貨フォーマット変換
   * - slice: 配列の一部を切り出し
   * 
   * 使用例: {{name | uppercase | slice:0:10}}
   * → name の値を大文字に変換し、最初の10文字を取得
   * 
   * Array of filter functions.
   * 
   * List of filter functions to process and transform binding values.
   * Filters are applied in order, with previous filter output becoming next filter input.
   * 
   * Examples:
   * - uppercase: Convert string to uppercase
   * - lowercase: Convert string to lowercase
   * - date: Date format conversion
   * - currency: Currency format conversion
   * - slice: Extract part of array
   * 
   * Usage example: {{name | uppercase | slice:0:10}}
   * → Convert name value to uppercase and get first 10 characters
   */
  readonly filters: Filters;
  
  /**
   * ノードが select 要素かどうかのフラグ。
   * 
   * select 要素は特殊な処理が必要な場合があるため、
   * このフラグで識別します。
   * 
   * 用途:
   * - value バインディングでの特殊処理
   * - option 要素の選択状態管理
   * - multiple 属性の考慮
   * 
   * Flag indicating whether node is select element.
   * 
   * Identified with this flag as select elements may require
   * special processing.
   * 
   * Uses:
   * - Special processing in value binding
   * - Option element selection state management
   * - Consider multiple attribute
   */
  readonly isSelectElement: boolean;
  
  /**
   * 子 BindContent の配列。
   * 
   * 構造制御バインディング（for/if）が生成する BindContent のリストです。
   * 通常のバインディング（text、value 等）では空配列です。
   * 
   * 用途:
   * - for バインディング: リストの各要素に対応する BindContent を管理
   * - if バインディング: 条件が true の場合の BindContent を管理
   * - ネストされたバインディングの階層管理
   * 
   * Array of child BindContent.
   * 
   * List of BindContent generated by structure control bindings (for/if).
   * Empty array for normal bindings (text, value, etc.).
   * 
   * Uses:
   * - for binding: Manage BindContent corresponding to each list element
   * - if binding: Manage BindContent when condition is true
   * - Hierarchy management of nested bindings
   */
  readonly bindContents: IBindContent[];
  
  /**
   * 現在の値（フィルター適用前）。
   * 
   * バインディングが参照する状態プロパティの現在の値です。
   * この値にフィルターを適用した結果が filteredValue となります。
   * 
   * Current value (before filter application).
   * 
   * Current value of state property referenced by binding.
   * Result of applying filters to this value becomes filteredValue.
   */
  readonly value: any;
  
  /**
   * フィルター適用後の値。
   * 
   * value にすべてのフィルターを順番に適用した結果の値です。
   * この値が実際に DOM に反映されます。
   * 
   * Value after filter application.
   * 
   * Result value after applying all filters to value in order.
   * This value is actually reflected to DOM.
   */
  readonly filteredValue: any;
  
  /**
   * バインディングノードを初期化するメソッド。
   * 
   * バインディングノードの生成直後に呼び出され、
   * 初期状態のセットアップや DOM への初期反映を行います。
   * 
   * 主な処理:
   * - 初期値の取得と DOM への反映
   * - イベントリスナーの登録（イベントバインディングの場合）
   * - 子 BindContent の初期化（構造制御バインディングの場合）
   * 
   * Method to initialize binding node.
   * 
   * Called immediately after binding node generation,
   * performs initial state setup and initial reflection to DOM.
   * 
   * Main processing:
   * - Get initial value and reflect to DOM
   * - Register event listeners (for event binding)
   * - Initialize child BindContent (for structure control binding)
   */
  init(): void;
  
  /**
   * 値を直接割り当てるメソッド。
   * 
   * 新しい値をバインディングノードに割り当て、DOM を更新します。
   * フィルターが適用された後、DOM に反映されます。
   * 
   * 注意:
   * - 構造制御バインディング（for）では未実装の場合があります
   * - 複雑な更新が必要な場合は applyChange を使用してください
   * 
   * Method to directly assign value.
   * 
   * Assigns new value to binding node and updates DOM.
   * Reflected to DOM after filters are applied.
   * 
   * Note:
   * - May not be implemented for structure control binding (for)
   * - Use applyChange for complex updates
   * 
   * @param value - 割り当てる値 / Value to assign
   */
  assignValue(value: any): void;
  
  /**
   * リスト要素を更新するメソッド。
   * 
   * 複数のリスト要素（ListIndex で識別）に対して、
   * 対応する値を一括で更新します。
   * 
   * 主な用途:
   * - for バインディングでのリスト要素の部分更新
   * - 複数要素の効率的な一括更新
   * - 差分更新の最適化
   * 
   * Method to update list elements.
   * 
   * Updates corresponding values in batch for multiple list elements
   * (identified by ListIndex).
   * 
   * Main uses:
   * - Partial update of list elements in for binding
   * - Efficient batch update of multiple elements
   * - Optimization of diff updates
   * 
   * @param listIndexes - 更新対象のリストインデックス配列 / Array of list indexes to update
   * @param values - 対応する値の配列 / Array of corresponding values
   */
  updateElements(listIndexes: IListIndex[], values: any[]): void;
  
  /**
   * 再描画を通知するメソッド。
   * 
   * 親子関係を考慮してバインディングの更新を通知します。
   * 依存関係のある StatePropertyRef が変更された際に呼び出され、
   * 必要なバインディングの再描画をトリガーします。
   * 
   * 主な処理:
   * - 依存関係の確認
   * - 子 BindContent への通知伝播
   * - 再描画のスケジューリング
   * 
   * Method to notify redraw.
   * 
   * Notifies binding update considering parent-child relationships.
   * Called when dependent StatePropertyRef is changed,
   * triggers redraw of necessary bindings.
   * 
   * Main processing:
   * - Dependency confirmation
   * - Propagate notification to child BindContent
   * - Schedule redraw
   * 
   * @param refs - 変更された StatePropertyRef の配列 / Array of changed StatePropertyRef
   */
  notifyRedraw(refs: IStatePropertyRef[]): void;
}

/**
 * IBindingNode インターフェース
 * 
 * 完全な BindingNode のインターフェース。
 * IBindingNodeBase に加えて、レンダリングとライフサイクル管理のメソッドを含みます。
 * 
 * 追加メソッド:
 * - applyChange: 状態変更を検出して DOM を更新
 * - activate: バインディングをアクティブ化（更新検出を開始）
 * - inactivate: バインディングを非アクティブ化（更新検出を停止）
 * 
 * これらのメソッドは IRenderBinding から取得され、
 * バインディングシステムの中核となるレンダリングとライフサイクル管理を担当します。
 * 
 * IBindingNode interface
 * 
 * Complete BindingNode interface.
 * Includes rendering and lifecycle management methods in addition to IBindingNodeBase.
 * 
 * Additional methods:
 * - applyChange: Detect state changes and update DOM
 * - activate: Activate binding (start update detection)
 * - inactivate: Inactivate binding (stop update detection)
 * 
 * These methods are obtained from IRenderBinding and handle
 * rendering and lifecycle management that are core to binding system.
 */
export type IBindingNode = IBindingNodeBase & Pick<IRenderBinding, "applyChange" | "activate" | "inactivate">;

/**
 * CreateBindingNodeByNodeFn 型
 * 
 * ノード固有の BindingNode を生成する関数の型定義。
 * 
 * この関数は、カリー化された CreateBindingNodeFn の第2段階として実行され、
 * 具体的な DOM ノードとコンテキスト情報を受け取って BindingNode インスタンスを生成します。
 * 
 * パラメータ:
 * - binding: バインディングオブジェクト（状態管理やエンジンへの参照）
 * - node: 関連付ける DOM ノード
 * - filters: 利用可能なフィルター定義のマップ
 * 
 * 戻り値:
 * - IBindingNode: 生成された BindingNode インスタンス
 * 
 * 用途:
 * - バインディングビルダーから呼び出され、各 DOM ノードに対応する BindingNode を生成
 * - バインディングの動的な生成とコンテキストの注入
 * 
 * CreateBindingNodeByNodeFn type
 * 
 * Type definition for function that generates node-specific BindingNode.
 * 
 * This function is executed as stage 2 of curried CreateBindingNodeFn,
 * receives concrete DOM node and context information to generate BindingNode instance.
 * 
 * Parameters:
 * - binding: Binding object (state management and engine reference)
 * - node: DOM node to associate
 * - filters: Map of available filter definitions
 * 
 * Return value:
 * - IBindingNode: Generated BindingNode instance
 * 
 * Uses:
 * - Called from binding builder to generate BindingNode corresponding to each DOM node
 * - Dynamic generation and context injection of binding
 */
export type CreateBindingNodeByNodeFn = 
  (binding:IBinding, node: Node, filters: FilterWithOptions) => IBindingNode;

/**
 * CreateBindingNodeFn 型
 * 
 * BindingNode 生成ファクトリ関数の型定義。
 * 
 * この関数は、バインディング定義（name、フィルター、デコレータ）を解析し、
 * カリー化された CreateBindingNodeByNodeFn を返します。
 * 
 * 2段階のカリー化により、以下の利点があります:
 * 1. 第1段階: 静的な定義（name、filterTexts、decorates）を解析
 * 2. 第2段階: 動的なコンテキスト（binding、node、filters）を注入
 * 
 * パラメータ:
 * - name: バインディング名（"text"、"for"、"if" 等）
 * - filterTexts: フィルター定義のテキスト配列（例: ["| uppercase", "| slice:0:10"]）
 * - decorates: デコレータ配列（例: ["once", "prevent"]）
 * 
 * 戻り値:
 * - CreateBindingNodeByNodeFn: カリー化された関数（第2段階の引数を受け取る）
 * 
 * 設計パターン:
 * - Factory パターン: インスタンス生成ロジックをカプセル化
 * - Currying: 引数を段階的に適用し、部分適用を可能に
 * - Dependency Injection: filters を外部から注入し、テスタビリティ向上
 * 
 * 使用例:
 * ```typescript
 * // ファクトリ関数の定義
 * const createBindingNodeFor: CreateBindingNodeFn = 
 *   (name, filterTexts, decorates) => 
 *     (binding, node, filters) => 
 *       new BindingNodeFor(binding, node, name, createFilters(filters, filterTexts), decorates);
 * 
 * // 第1段階: バインディング定義の解析
 * const factory = createBindingNodeFor("for", ["| slice:0:10"], ["once"]);
 * 
 * // 第2段階: インスタンス生成
 * const bindingNode = factory(binding, commentNode, availableFilters);
 * ```
 * 
 * CreateBindingNodeFn type
 * 
 * Type definition for BindingNode generation factory function.
 * 
 * This function parses binding definition (name, filters, decorators) and
 * returns curried CreateBindingNodeByNodeFn.
 * 
 * Two-stage currying provides following advantages:
 * 1. Stage 1: Parse static definition (name, filterTexts, decorates)
 * 2. Stage 2: Inject dynamic context (binding, node, filters)
 * 
 * Parameters:
 * - name: Binding name ("text", "for", "if", etc.)
 * - filterTexts: Array of filter definition text (e.g., ["| uppercase", "| slice:0:10"])
 * - decorates: Decorator array (e.g., ["once", "prevent"])
 * 
 * Return value:
 * - CreateBindingNodeByNodeFn: Curried function (receives stage 2 arguments)
 * 
 * Design patterns:
 * - Factory pattern: Encapsulate instance generation logic
 * - Currying: Apply arguments in stages, enable partial application
 * - Dependency Injection: Inject filters from outside, improve testability
 * 
 * Usage example:
 * ```typescript
 * // Define factory function
 * const createBindingNodeFor: CreateBindingNodeFn = 
 *   (name, filterTexts, decorates) => 
 *     (binding, node, filters) => 
 *       new BindingNodeFor(binding, node, name, createFilters(filters, filterTexts), decorates);
 * 
 * // Stage 1: Parse binding definition
 * const factory = createBindingNodeFor("for", ["| slice:0:10"], ["once"]);
 * 
 * // Stage 2: Generate instance
 * const bindingNode = factory(binding, commentNode, availableFilters);
 * ```
 */
export type CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => CreateBindingNodeByNodeFn;
