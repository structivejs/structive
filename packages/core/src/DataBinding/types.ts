// 依存関係のインポート / Dependency imports
import { ILoopContext } from "../LoopContext/types";           // ループコンテキスト管理 / Loop context management
import { IComponentEngine } from "../ComponentEngine/types";     // コンポーネントエンジン / Component engine
import { IBindingNode } from "./BindingNode/types";             // DOM操作層 / DOM operation layer
import { IBindingState } from "./BindingState/types";           // 状態管理層 / State management layer
import { IReadonlyStateProxy, IWritableStateHandler, IWritableStateProxy } from "../StateClass/types"; // 状態プロキシ / State proxy
import { IStatePropertyRef } from "../StatePropertyRef/types";   // 状態プロパティ参照 / State property reference
import { IListIndex } from "../ListIndex/types";                 // リストインデックス / List index
import { IRenderer } from "../Updater/types";                    // レンダラー / Renderer
/**
 * DataBinding/types.ts
 *
 * DataBinding モジュールの主要な型定義ファイル。
 * リアクティブなデータバインディングシステムのコア型を提供します。
 *
 * ## 主要インターフェース
 *
 * ### IBindContent
 * テンプレートから生成されたDOM断片とバインディング情報を管理するインターフェース。
 * 
 * 責務:
 * - DOM断片のライフサイクル管理（mount/unmount）
 * - 複数のバインディング（IBinding[]）の統合管理
 * - ループコンテキストの管理（ループ構造のサポート）
 * - 親子関係の追跡（parentBinding）
 * 
 * 主要機能:
 * - mount/mountBefore/mountAfter: DOM挿入位置の柔軟な制御
 * - unmount: DOMからの取り外しとfragmentへの格納
 * - assignListIndex: ループ内インデックスの再割り当て
 * - getLastNode: 再帰的に最終ノードを取得（構造制御用）
 * - isMounted: マウント状態の判定
 * - currentLoopContext: 親方向へ遡ってループコンテキストを解決
 * 
 * 使用場面:
 * - ComponentEngine: ルートBindContentの管理
 * - BindingNodeFor: ループアイテムごとのBindContent生成
 * - BindingNodeIf: 条件分岐ごとのBindContent生成
 *
 * ### IBinding
 * 1つのバインディング（DOMノードと状態の対応関係）を管理するインターフェース。
 * 
 * 責務:
 * - BindingNode（DOM操作層）とBindingState（状態管理層）の統合
 * - 状態変更のDOM反映（applyChange）
 * - 双方向バインディングのサポート（updateStateValue）
 * - 子BindContentの管理（bindContents）
 * 
 * 主要機能:
 * - applyChange: 状態変更をDOMに適用（Rendererから呼び出される）
 * - updateStateValue: DOM変更を状態に反映（双方向バインディング）
 * - notifyRedraw: 特定の状態参照に対する再描画通知
 * - activate/inactivate: バインディングのライフサイクル管理
 * - bindContents: 構造制御バインディングが管理する子BindContent配列
 * 
 * 使用場面:
 * - 属性バインディング（BindingNodeAttribute）
 * - プロパティバインディング（BindingNodeProperty*）
 * - イベントバインディング（BindingNodeEvent*）
 * - 構造制御バインディング（BindingNodeFor, BindingNodeIf等）
 *
 * ### IRenderBinding
 * レンダリング機能を提供する共通インターフェース（IBindContentとIBindingの基底）。
 * 
 * 責務:
 * - 変更適用のエントリポイント（applyChange）
 * - アクティベーション状態の管理（activate/inactivate）
 * 
 * 設計意図:
 * - IBindContentとIBindingで共通の振る舞いを統一
 * - Rendererから統一的に扱えるようにする
 *
 * ### StateBindSummary
 * 状態プロパティごとにループコンテキストとBindContentを紐付けるマップ型。
 * 
 * 構造: Map<PropertyPath, WeakMap<ILoopContext, IBindContent>>
 * 
 * 用途:
 * - 動的依存関係の追跡
 * - ワイルドカードパスの解決結果キャッシュ
 * - ループコンテキスト単位でのBindContent管理
 * 
 * WeakMap使用の理由:
 * - LoopContextが破棄されたら自動的にクリーンアップ
 * - メモリリークの防止
 *
 * ## 設計原則
 *
 * 1. 関心の分離:
 *    - IBindContent: DOM断片とバインディング群の管理
 *    - IBinding: 個別バインディングの管理
 *    - BindingNode: DOM操作の実行
 *    - BindingState: 状態参照の解決と値の取得・設定
 *
 * 2. 柔軟性:
 *    - ファクトリパターンで様々なバインディング型をサポート
 *    - インターフェース駆動で拡張性を確保
 *
 * 3. パフォーマンス:
 *    - WeakMapでメモリリーク防止
 *    - 二重更新防止（updatedBindings）
 *    - 遅延評価（currentLoopContext）
 *
 * 4. 型安全性:
 *    - TypeScriptの型システムを最大限活用
 *    - 実行時エラーを最小化
 *
 * ## Main Interfaces
 *
 * ### IBindContent
 * Interface managing DOM fragments generated from templates and binding information.
 * 
 * Responsibilities:
 * - DOM fragment lifecycle management (mount/unmount)
 * - Integrated management of multiple bindings (IBinding[])
 * - Loop context management (loop structure support)
 * - Parent-child relationship tracking (parentBinding)
 * 
 * Key features:
 * - mount/mountBefore/mountAfter: Flexible control of DOM insertion position
 * - unmount: Detachment from DOM and storage in fragment
 * - assignListIndex: Reassignment of loop indices
 * - getLastNode: Recursively retrieve last node (for structural control)
 * - isMounted: Mount state determination
 * - currentLoopContext: Resolve loop context by traversing parent direction
 * 
 * Usage scenarios:
 * - ComponentEngine: Root BindContent management
 * - BindingNodeFor: BindContent generation per loop item
 * - BindingNodeIf: BindContent generation per conditional branch
 *
 * ### IBinding
 * Interface managing one binding (correspondence between DOM node and state).
 * 
 * Responsibilities:
 * - Integration of BindingNode (DOM operation layer) and BindingState (state management layer)
 * - DOM reflection of state changes (applyChange)
 * - Bidirectional binding support (updateStateValue)
 * - Child BindContent management (bindContents)
 * 
 * Key features:
 * - applyChange: Apply state changes to DOM (called from Renderer)
 * - updateStateValue: Reflect DOM changes to state (bidirectional binding)
 * - notifyRedraw: Redraw notification for specific state references
 * - activate/inactivate: Binding lifecycle management
 * - bindContents: Child BindContent array managed by structural control binding
 * 
 * Usage scenarios:
 * - Attribute binding (BindingNodeAttribute)
 * - Property binding (BindingNodeProperty*)
 * - Event binding (BindingNodeEvent*)
 * - Structural control binding (BindingNodeFor, BindingNodeIf, etc.)
 *
 * ### IRenderBinding
 * Common interface providing rendering functionality (base of IBindContent and IBinding).
 * 
 * Responsibilities:
 * - Change application entry point (applyChange)
 * - Activation state management (activate/inactivate)
 * 
 * Design intent:
 * - Unify common behavior in IBindContent and IBinding
 * - Enable uniform handling from Renderer
 *
 * ### StateBindSummary
 * Map type linking loop contexts and BindContent per state property.
 * 
 * Structure: Map<PropertyPath, WeakMap<ILoopContext, IBindContent>>
 * 
 * Usage:
 * - Dynamic dependency tracking
 * - Wildcard path resolution result caching
 * - BindContent management per loop context
 * 
 * Reason for WeakMap:
 * - Automatic cleanup when LoopContext is destroyed
 * - Memory leak prevention
 *
 * ## Design Principles
 *
 * 1. Separation of concerns:
 *    - IBindContent: DOM fragment and binding group management
 *    - IBinding: Individual binding management
 *    - BindingNode: DOM operation execution
 *    - BindingState: State reference resolution and value get/set
 *
 * 2. Flexibility:
 *    - Support various binding types with Factory pattern
 *    - Ensure extensibility through interface-driven design
 *
 * 3. Performance:
 *    - Memory leak prevention with WeakMap
 *    - Duplicate update prevention (updatedBindings)
 *    - Lazy evaluation (currentLoopContext)
 *
 * 4. Type safety:
 *    - Maximize TypeScript type system
 *    - Minimize runtime errors
 */

/**
 * レンダリング機能を提供する共通インターフェース。
 * IBindContent と IBinding の両方で実装され、統一的なレンダリング制御を可能にします。
 * 
 * 設計意図:
 * - Renderer から IBindContent と IBinding を統一的に扱う
 * - ライフサイクル管理（activate/inactivate）の共通化
 * - 変更適用処理（applyChange）の共通化
 * 
 * 実装クラス:
 * - BindContent: DOM断片とバインディング群のレンダリング
 * - Binding: 個別バインディングのレンダリング
 * 
 * Common interface providing rendering functionality.
 * Implemented by both IBindContent and IBinding, enabling unified rendering control.
 * 
 * Design intent:
 * - Uniformly handle IBindContent and IBinding from Renderer
 * - Common lifecycle management (activate/inactivate)
 * - Common change application processing (applyChange)
 * 
 * Implementing classes:
 * - BindContent: Rendering of DOM fragments and binding groups
 * - Binding: Rendering of individual bindings
 */
export interface IRenderBinding {
  /**
   * 状態変更をDOMに適用するメソッド。
   * Rendererから呼び出され、内部で二重更新防止などの最適化を行います。
   * 
   * Method to apply state changes to DOM.
   * Called from Renderer, performs internal optimizations like duplicate update prevention.
   * 
   * @param renderer - レンダラーインスタンス（更新管理情報を保持） / Renderer instance (holds update management info)
   */
  applyChange(renderer: IRenderer): void;
  
  /**
   * バインディングを有効化するメソッド。
   * 状態の購読開始、初期レンダリング、イベントリスナー登録などを行います。
   * 
   * Method to activate binding.
   * Starts state subscription, initial rendering, event listener registration, etc.
   */
  activate(): void;
  
  /**
   * バインディングを無効化するメソッド。
   * 状態の購読解除、イベントリスナー削除、リソースクリーンアップなどを行います。
   * 
   * Method to inactivate binding.
   * Unsubscribes from state, removes event listeners, cleans up resources, etc.
   */
  inactivate(): void;
  
  /**
   * バインディングが有効化されているかどうかを示すフラグ。
   * 
   * Flag indicating whether binding is activated.
   */
  readonly isActive: boolean;
}

/**
 * BindContent の基本インターフェース（レンダリング機能を除く）。
 * テンプレートから生成されたDOM断片とバインディング情報を管理します。
 * 
 * 責務:
 * 1. DOM断片のライフサイクル管理
 * 2. 複数バインディングの統合管理
 * 3. ループコンテキストの保持と解決
 * 4. 親子関係の追跡
 * 
 * 階層構造:
 * ComponentEngine → root BindContent → Binding[] → child BindContent[] → ...
 * 
 * Base interface of BindContent (excluding rendering functionality).
 * Manages DOM fragments generated from templates and binding information.
 * 
 * Responsibilities:
 * 1. DOM fragment lifecycle management
 * 2. Integrated management of multiple bindings
 * 3. Loop context retention and resolution
 * 4. Parent-child relationship tracking
 * 
 * Hierarchical structure:
 * ComponentEngine → root BindContent → Binding[] → child BindContent[] → ...
 */
export interface IBindContentBase {
  /**
   * このBindContentが所属するループコンテキスト（ループでない場合はnull）。
   * ループ構造（for）で使用され、ループインデックス情報を保持します。
   * 
   * Loop context this BindContent belongs to (null if not in loop).
   * Used in loop structures (for), holds loop index information.
   */
  loopContext  : ILoopContext | null;
  
  /**
   * このBindContentを生成した親Binding（ルートの場合はnull）。
   * 構造制御バインディング（for, if等）が子BindContentを生成する際に設定されます。
   * 
   * Parent Binding that generated this BindContent (null if root).
   * Set when structural control bindings (for, if, etc.) generate child BindContent.
   */
  parentBinding: IBinding | null;
  
  /**
   * このBindContentがDOMにマウント済みかどうかを判定するgetter。
   * 判定ロジック: childNodes.length > 0 && childNodes[0].parentNode !== fragment
   * 
   * Getter to determine if this BindContent is mounted to DOM.
   * Determination logic: childNodes.length > 0 && childNodes[0].parentNode !== fragment
   */
  readonly isMounted         : boolean;
  
  /**
   * このBindContentが使用するテンプレートID。
   * Template.registerTemplate() で登録されたIDを参照します。
   * 
   * Template ID used by this BindContent.
   * References ID registered via Template.registerTemplate().
   */
  readonly id                : number;
  
  /**
   * childNodes配列の最初のノード（存在しない場合はnull）。
   * マウント位置の特定に使用されます。
   * 
   * First node of childNodes array (null if none).
   * Used to identify mount position.
   */
  readonly firstChildNode    : Node | null;
  
  /**
   * childNodes配列の最後のノード（存在しない場合はnull）。
   * 挿入位置の特定やgetLastNode()で使用されます。
   * 
   * Last node of childNodes array (null if none).
   * Used for insertion position identification and getLastNode().
   */
  readonly lastChildNode     : Node | null;
  
  /**
   * 現在のループコンテキストを取得するgetter（キャッシュ付き）。
   * 自身のloopContextがnullの場合、親方向へ遡ってループコンテキストを探索します。
   * 一度解決した値はキャッシュされ、unmount時にクリアされます。
   * 
   * Getter to retrieve current loop context (with caching).
   * If own loopContext is null, traverses parent direction to search for loop context.
   * Once resolved value is cached, cleared on unmount.
   */
  readonly currentLoopContext: ILoopContext | null;
  
  /**
   * 親ノードの末尾にchildNodesをマウントします（appendChild）。
   * 注意: 冪等ではないため、重複マウントは呼び出し側で避けてください。
   * 
   * Mounts childNodes to end of parent node (appendChild).
   * Note: Not idempotent, caller must avoid duplicate mounts.
   * 
   * @param parentNode - マウント先の親ノード / Parent node for mount destination
   */
  mount(parentNode:Node):void;
  
  /**
   * 指定ノードの直前にchildNodesをマウントします（insertBefore）。
   * beforeNodeがnullの場合、末尾に追加されます。
   * 
   * Mounts childNodes immediately before specified node (insertBefore).
   * If beforeNode is null, appended to end.
   * 
   * @param parentNode - マウント先の親ノード / Parent node for mount destination
   * @param beforeNode - 挿入位置の基準ノード（この直前に挿入） / Reference node for insertion position (insert immediately before this)
   */
  mountBefore(parentNode:Node, beforeNode:Node | null):void;
  
  /**
   * 指定ノードの直後にchildNodesをマウントします。
   * afterNode.nextSiblingをbeforeNodeとしてinsertBeforeを実行します。
   * 
   * Mounts childNodes immediately after specified node.
   * Executes insertBefore with afterNode.nextSibling as beforeNode.
   * 
   * @param parentNode - マウント先の親ノード / Parent node for mount destination
   * @param afterNode - 挿入位置の基準ノード（この直後に挿入） / Reference node for insertion position (insert immediately after this)
   */
  mountAfter(parentNode:Node, afterNode:Node | null):void;
  
  /**
   * DOMからchildNodesをアンマウント（取り外し）します。
   * アンマウント後、currentLoopContextキャッシュがクリアされます。
   * 
   * Unmounts (detaches) childNodes from DOM.
   * After unmount, currentLoopContext cache is cleared.
   */
  unmount():void;
  
  /**
   * テンプレートから生成されたDocumentFragment。
   * unmount時にchildNodesがこのfragmentに戻されます（再利用可能）。
   * 
   * DocumentFragment generated from template.
   * childNodes are returned to this fragment on unmount (reusable).
   */
  fragment: DocumentFragment;
  
  /**
   * このBindContentが管理するDOMノード配列。
   * fragmentからArrayに変換されたもので、mount/unmountで親が変わります。
   * 
   * Array of DOM nodes managed by this BindContent.
   * Converted from fragment to Array, parent changes with mount/unmount.
   */
  childNodes: Node[];
  
  /**
   * このBindContentに含まれる全バインディング配列。
   * data-bind属性から生成され、各バインディングが個別のDOM操作を担当します。
   * 
   * Array of all bindings included in this BindContent.
   * Generated from data-bind attributes, each binding handles individual DOM operations.
   */
  bindings: IBinding[];
  
  /**
   * ループ内のリストインデックスを再割り当てします。
   * BindingNodeForでの配列要素の並び替え時に使用されます。
   * 
   * Reassigns list index within loop.
   * Used when reordering array elements in BindingNodeFor.
   * 
   * @param listIndex - 新しいリストインデックス / New list index
   */
  assignListIndex(listIndex: IListIndex): void;
  
  /**
   * 再帰的に最終ノード（末尾のバインディング配下も含む）を取得します。
   * BindingNodeForでのDOM挿入位置の決定に使用されます。
   * 
   * Recursively retrieves last node (including those under trailing bindings).
   * Used for determining DOM insertion position in BindingNodeFor.
   * 
   * @param parentNode - 検証対象の親ノード / Parent node for validation
   * @returns 最終ノードまたはnull（親子関係が崩れている場合） / Last node or null (if parent-child relationship broken)
   */
  getLastNode(parentNode: Node): Node | null;
}

/**
 * BindContent の完全なインターフェース。
 * IBindContentBase（基本機能）とIRenderBinding（レンダリング機能）を組み合わせます。
 * 
 * 実装クラス:
 * - BindContent: DataBinding/BindContent.ts
 * 
 * 生成方法:
 * - createBindContent(): ファクトリ関数で生成
 * 
 * Complete interface of BindContent.
 * Combines IBindContentBase (basic functionality) and IRenderBinding (rendering functionality).
 * 
 * Implementing class:
 * - BindContent: DataBinding/BindContent.ts
 * 
 * Generation method:
 * - createBindContent(): Generated via factory function
 */
export type IBindContent = IBindContentBase & IRenderBinding;

/**
 * Binding の基本インターフェース（レンダリング機能を除く）。
 * 1つのバインディング（DOMノードと状態プロパティの対応関係）を管理します。
 * 
 * 責務:
 * 1. BindingNode（DOM操作層）とBindingState（状態管理層）の統合
 * 2. 双方向バインディングのサポート
 * 3. 子BindContentの管理（構造制御バインディングの場合）
 * 4. 親BindContentへの参照保持
 * 
 * アーキテクチャ:
 * - BindingNode: 属性、プロパティ、イベント、構造制御など、実際のDOM操作を実行
 * - BindingState: 状態参照の解決、値の取得・設定、フィルター適用
 * - 両者を協調させてリアクティブなバインディングを実現
 * 
 * Base interface of Binding (excluding rendering functionality).
 * Manages one binding (correspondence between DOM node and state property).
 * 
 * Responsibilities:
 * 1. Integration of BindingNode (DOM operation layer) and BindingState (state management layer)
 * 2. Bidirectional binding support
 * 3. Child BindContent management (for structural control bindings)
 * 4. Reference retention to parent BindContent
 * 
 * Architecture:
 * - BindingNode: Executes actual DOM operations like attributes, properties, events, structural control
 * - BindingState: State reference resolution, value get/set, filter application
 * - Coordinates both to achieve reactive binding
 */
export interface IBindingBase {
  /**
   * このBindingが所属する親BindContent。
   * 全てのBindingは必ず何らかのBindContent内に存在します。
   * 
   * Parent BindContent this Binding belongs to.
   * All Bindings always exist within some BindContent.
   */
  parentBindContent: IBindContent;
  
  /**
   * コンポーネントエンジンへの参照。
   * フィルター、パス管理、バインディング検索などの機能にアクセスします。
   * 
   * Reference to component engine.
   * Accesses functionality like filters, path management, binding search.
   */
  readonly engine           : IComponentEngine;
  
  /**
   * バインディング対象のDOMノード。
   * Element、Text、Commentノードなど様々なノードタイプをサポートします。
   * 
   * Target DOM node for binding.
   * Supports various node types like Element, Text, Comment nodes.
   */
  readonly node             : Node;
  
  /**
   * DOM操作を担当するBindingNode。
   * ノードタイプに応じた適切な実装（属性、プロパティ、イベント等）が設定されます。
   * 
   * BindingNode responsible for DOM operations.
   * Appropriate implementation (attribute, property, event, etc.) set according to node type.
   */
  readonly bindingNode      : IBindingNode;
  
  /**
   * 状態参照の解決と値の取得・設定を担当するBindingState。
   * 通常のバインディング（BindingState）とループインデックスバインディング（BindingStateIndex）があります。
   * 
   * BindingState responsible for state reference resolution and value get/set.
   * Includes normal binding (BindingState) and loop index binding (BindingStateIndex).
   */
  readonly bindingState     : IBindingState;
  
  /**
   * このBindingが管理する子BindContent配列。
   * 構造制御バインディング（for, if等）のみが子BindContentを持ちます。
   * 通常のバインディングは空配列を返します。
   * 
   * Array of child BindContent managed by this Binding.
   * Only structural control bindings (for, if, etc.) have child BindContent.
   * Normal bindings return empty array.
   */
  bindContents              : IBindContent[];
  
  /**
   * リストインデックスごとのバインディングセット（WeakMapでメモリリーク防止）。
   * ループ構造で使用され、各ループアイテムに対応するバインディングを管理します。
   * 
   * Binding set per list index (WeakMap prevents memory leaks).
   * Used in loop structures, manages bindings corresponding to each loop item.
   */
  readonly bindingsByListIndex: WeakMap<IListIndex, Set<IBinding>>;
  
  /**
   * 状態値を更新するメソッド（双方向バインディング用）。
   * DOM変更（input入力等）を状態プロキシに反映します。
   * 
   * Method to update state value (for bidirectional binding).
   * Reflects DOM changes (input entry, etc.) to state proxy.
   * 
   * @param writeState - 書き込み可能な状態プロキシ / Writable state proxy
   * @param handler - 状態更新ハンドラー / State update handler
   * @param value - 設定する値 / Value to set
   */
  updateStateValue(writeState: IWritableStateProxy, handler: IWritableStateHandler, value: any): void;
  
  /**
   * 再描画が必要な状態参照をBindingNodeに通知します。
   * 動的依存関係の解決後に関連バインディングを更新する際に使用されます。
   * 
   * Notifies BindingNode of state references requiring redraw.
   * Used to update related bindings after resolving dynamic dependencies.
   * 
   * @param refs - 再描画対象の状態参照配列 / Array of state references for redraw
   */
  notifyRedraw(refs: IStatePropertyRef[]): void;
}

/**
 * Binding の完全なインターフェース。
 * IBindingBase（基本機能）とIRenderBinding（レンダリング機能）を組み合わせます。
 * 
 * 実装クラス:
 * - Binding: DataBinding/Binding.ts
 * 
 * 生成方法:
 * - createBinding(): ファクトリ関数で生成
 * - createBindingNodeとcreateBindingStateファクトリを受け取り、適切な型のバインディングを生成
 * 
 * バインディングの種類:
 * - 属性バインディング: BindingNodeAttribute
 * - プロパティバインディング: BindingNodeProperty*, BindingNodePropertyValue, BindingNodePropertyChecked等
 * - イベントバインディング: BindingNodeEventCustom, BindingNodeEventPrevent等
 * - 構造制御バインディング: BindingNodeFor, BindingNodeIf
 * - コンポーネントバインディング: BindingNodeComponent*
 * 
 * Complete interface of Binding.
 * Combines IBindingBase (basic functionality) and IRenderBinding (rendering functionality).
 * 
 * Implementing class:
 * - Binding: DataBinding/Binding.ts
 * 
 * Generation method:
 * - createBinding(): Generated via factory function
 * - Receives createBindingNode and createBindingState factories, generates appropriate binding type
 * 
 * Binding types:
 * - Attribute binding: BindingNodeAttribute
 * - Property binding: BindingNodeProperty*, BindingNodePropertyValue, BindingNodePropertyChecked, etc.
 * - Event binding: BindingNodeEventCustom, BindingNodeEventPrevent, etc.
 * - Structural control binding: BindingNodeFor, BindingNodeIf
 * - Component binding: BindingNodeComponent*
 */
export type IBinding = IBindingBase & IRenderBinding;

/**
 * 状態プロパティごとにループコンテキストとBindContentを紐付けるマップ型。
 * 動的依存関係（ワイルドカードパス等）の追跡に使用されます。
 * 
 * 構造:
 * - 外側のMap: プロパティパス文字列 → WeakMap
 * - 内側のWeakMap: ILoopContext → IBindContent
 * 
 * 用途:
 * 1. ワイルドカードパスの解決結果キャッシュ
 *    例: "items.*.name" → 各ループコンテキストごとのBindContent
 * 2. 動的依存関係の追跡
 *    実行時に解決されるパスの依存関係を管理
 * 3. ループコンテキスト単位でのBindContent管理
 *    ループアイテムごとの関連付けを保持
 * 
 * WeakMap使用の理由:
 * - LoopContextが破棄されたら自動的にエントリが削除される
 * - メモリリークを防止
 * - ガベージコレクションを妨げない
 * 
 * 使用場所:
 * - PathManager: 動的依存関係の管理
 * - ComponentEngine: ワイルドカードパス解決時のキャッシュ
 * 
 * Map type linking loop contexts and BindContent per state property.
 * Used for dynamic dependency tracking (wildcard paths, etc.).
 * 
 * Structure:
 * - Outer Map: property path string → WeakMap
 * - Inner WeakMap: ILoopContext → IBindContent
 * 
 * Usage:
 * 1. Wildcard path resolution result caching
 *    Example: "items.*.name" → BindContent per loop context
 * 2. Dynamic dependency tracking
 *    Manages dependencies of paths resolved at runtime
 * 3. BindContent management per loop context
 *    Retains associations per loop item
 * 
 * Reason for WeakMap:
 * - Entries automatically deleted when LoopContext is destroyed
 * - Prevents memory leaks
 * - Does not hinder garbage collection
 * 
 * Usage locations:
 * - PathManager: Dynamic dependency management
 * - ComponentEngine: Cache during wildcard path resolution
 */
export type StateBindSummary = Map<string, WeakMap<ILoopContext, IBindContent>>;
