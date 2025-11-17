import { resolveNodeFromPath } from "../BindingBuilder/resolveNodeFromPath.js";
import { ILoopContext } from "../LoopContext/types";
import { IComponentEngine } from "../ComponentEngine/types";
import { getTemplateById } from "../Template/registerTemplate.js";
import { raiseError } from "../utils.js";
import { createBinding } from "./Binding.js";
import { IBindContent, IBinding } from "./types";
import { createLoopContext } from "../LoopContext/createLoopContext.js";
import { getDataBindAttributesById } from "../BindingBuilder/registerDataBindAttributes.js";
import { hasLazyLoadComponents, loadLazyLoadComponent } from "../WebComponents/loadFromImportMap.js";
import { IListIndex } from "../ListIndex/types.js";
import { IRenderer } from "../Updater/types.js";
import { IStatePropertyRef } from "../StatePropertyRef/types.js";
import { BindingNode } from "./BindingNode/BindingNode.js";

/**
 * 指定テンプレートIDから DocumentFragment を生成する内部ヘルパー関数。
 * 
 * 処理フロー:
 * 1. テンプレートIDから登録済みテンプレートを取得
 * 2. テンプレート内容をディープコピーして DocumentFragment を生成
 * 3. 遅延読み込みコンポーネントが存在する場合、自動的にロード
 * 4. 生成された DocumentFragment を返す
 * 
 * 遅延読み込み対応:
 * - `:not(:defined)` セレクタで未定義カスタム要素を検出
 * - 各要素のタグ名を取得し、対応するコンポーネントをロード
 * - Web Components の段階的読み込みをサポート
 * 
 * Internal helper function to generate DocumentFragment from specified template ID.
 * 
 * Processing flow:
 * 1. Retrieve registered template from template ID
 * 2. Deep copy template content to generate DocumentFragment
 * 3. Automatically load lazy-load components if present
 * 4. Return generated DocumentFragment
 * 
 * Lazy loading support:
 * - Detects undefined custom elements with `:not(:defined)` selector
 * - Retrieves tag name of each element and loads corresponding component
 * - Supports progressive loading of Web Components
 * 
 * @param id - 登録済みテンプレートID / Registered template ID
 * @returns テンプレート内容を複製した DocumentFragment / DocumentFragment with copied template content
 * @throws BIND-101 Template not found: 未登録IDが指定された場合 / When unregistered ID is specified
 */
function createContent(id: number): DocumentFragment {
  // ステップ1: テンプレートIDから登録済みテンプレートを取得（存在しない場合はエラー）
  // Step 1: Retrieve registered template from template ID (error if not exists)
  const template = getTemplateById(id) ?? 
    raiseError({
      code: "BIND-101",
      message: `Template not found: ${id}`,
      context: { where: 'BindContent.createContent', templateId: id },
      docsUrl: "./docs/error-codes.md#bind",
    });
  
  // ステップ2: テンプレート内容をディープコピー（true = 子孫ノードも含む）
  // Step 2: Deep copy template content (true = includes descendant nodes)
  const fragment = document.importNode(template.content, true);
  
  // ステップ3: 遅延読み込みコンポーネントの自動ロード
  // Step 3: Automatic loading of lazy-load components
  if (hasLazyLoadComponents()) {
    // 未定義のカスタム要素を検出
    // Detect undefined custom elements
    const lazyLoadElements = fragment.querySelectorAll(":not(:defined)");
    for(let i = 0; i < lazyLoadElements.length; i++) {
      // タグ名を取得してコンポーネントをロード
      // Retrieve tag name and load component
      const tagName = lazyLoadElements[i].tagName.toLowerCase();
      loadLazyLoadComponent(tagName);
    }
  }
  
  // ステップ4: 生成された DocumentFragment を返す
  // Step 4: Return generated DocumentFragment
  return fragment;
}

/**
 * テンプレート内の data-bind 情報から IBinding 配列を構築する内部関数。
 *
 * 処理フロー:
 * 1. テンプレートIDから data-bind 属性情報を取得
 * 2. 各属性について以下を実行:
 *    a. ノードパスからDOMノードを解決
 *    b. 各バインディングテキストについて:
 *       - 対応する BindingCreator を取得
 *       - Binding インスタンスを生成
 *       - 配列に追加
 * 3. 生成された IBinding 配列を返す
 * 
 * バインディング生成の詳細:
 * - createBinding は BindingNode と BindingState を生成
 * - ファクトリ関数（creator）を使用して適切な型のバインディングを生成
 * - 各バインディングは親 BindContent への参照を保持
 * 
 * Internal function to construct IBinding array from data-bind information within template.
 *
 * Processing flow:
 * 1. Retrieve data-bind attribute information from template ID
 * 2. For each attribute, execute the following:
 *    a. Resolve DOM node from node path
 *    b. For each binding text:
 *       - Get corresponding BindingCreator
 *       - Generate Binding instance
 *       - Add to array
 * 3. Return generated IBinding array
 * 
 * Binding generation details:
 * - createBinding generates BindingNode and BindingState
 * - Uses factory function (creator) to generate appropriate binding type
 * - Each binding maintains reference to parent BindContent
 *
 * @param bindContent - 親 BindContent / Parent BindContent
 * @param id - テンプレートID / Template ID
 * @param engine - コンポーネントエンジン / Component engine
 * @param content - テンプレートから複製したフラグメント / Fragment copied from template
 * @returns 生成された IBinding の配列 / Array of generated IBinding
 * @throws BIND-101 Data-bind is not set: テンプレートに data-bind 情報が未登録 / data-bind info not registered in template
 * @throws BIND-102 Node not found: パスで指すノードが見つからない / Node pointed to by path not found
 * @throws BIND-103 Creator not found: 対応する BindingCreator が未登録 / Corresponding BindingCreator not registered
 */
function createBindings(
  bindContent: IBindContent, 
  id         : number, 
  engine     : IComponentEngine, 
  content    : DocumentFragment
): IBinding[] {
  // ステップ1: テンプレートIDから data-bind 属性情報を取得（存在しない場合はエラー）
  // Step 1: Retrieve data-bind attribute information from template ID (error if not exists)
  const attributes = getDataBindAttributesById(id) ?? 
    raiseError({
      code: "BIND-101",
      message: "Data-bind is not set",
      context: { where: 'BindContent.createBindings', templateId: id },
      docsUrl: "./docs/error-codes.md#bind",
    });
  
  // ステップ2: バインディング配列を初期化
  // Step 2: Initialize binding array
  const bindings: IBinding[] = [];
  
  // ステップ3: 各属性について処理
  // Step 3: Process each attribute
  for(let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    
    // ステップ3a: ノードパスからDOMノードを解決（見つからない場合はエラー）
    // Step 3a: Resolve DOM node from node path (error if not found)
    const node = resolveNodeFromPath(content, attribute.nodePath) ?? 
      raiseError({
        code: "BIND-102",
        message: `Node not found: ${attribute.nodePath}`,
        context: { where: 'BindContent.createBindings', templateId: id, nodePath: attribute.nodePath },
        docsUrl: "./docs/error-codes.md#bind",
      });
    
    // ステップ3b: 各バインディングテキストについて処理
    // Step 3b: Process each binding text
    for(let j = 0; j < attribute.bindTexts.length; j++) {
      const bindText = attribute.bindTexts[j];
      
      // 対応する BindingCreator を取得（存在しない場合はエラー）
      // Get corresponding BindingCreator (error if not exists)
      const creator = attribute.creatorByText.get(bindText) ?? 
        raiseError({
          code: "BIND-103",
          message: `Creator not found: ${bindText}`,
          context: { where: 'BindContent.createBindings', templateId: id, bindText },
          docsUrl: "./docs/error-codes.md#bind",
        });
      
      // Binding インスタンスを生成（BindingNode と BindingState を含む）
      // Generate Binding instance (includes BindingNode and BindingState)
      const binding = createBinding(
        bindContent, 
        node, 
        engine, 
        creator.createBindingNode, 
        creator.createBindingState
      );
      
      // 配列に追加
      // Add to array
      bindings.push(binding);
    }
  }
  
  // ステップ4: 生成された IBinding 配列を返す
  // Step 4: Return generated IBinding array
  return bindings;
}

/**
 * BindContent クラスは、テンプレートから生成された DOM 断片（DocumentFragment）と
 * そのバインディング情報（IBinding[]）を管理する中核実装です。
 *
 * アーキテクチャ:
 * - テンプレートベースの DOM 生成とバインディング管理を統合
 * - ループや条件分岐などの動的コンテンツをサポート
 * - 親子関係を持つ階層構造（親 Binding ← BindContent ← 子 Binding[]）
 * - マウント状態の追跡とライフサイクル管理
 * 
 * 主な役割:
 * 1. DOM 断片生成: テンプレートIDから DocumentFragment を生成
 * 2. バインディング構築: data-bind 属性から IBinding 配列を構築
 * 3. DOM 操作: mount/mountBefore/mountAfter/unmount で挿入・削除を制御
 * 4. 変更適用: applyChange で各 IBinding に更新を委譲
 * 5. ループ対応: LoopContext やリストインデックスを管理
 * 6. ノード探索: getLastNode で再帰的に最後のノードを取得
 * 7. インデックス再割り当て: assignListIndex でループ更新に対応
 * 
 * 状態管理:
 * - isMounted: DOM マウント状態の判定
 * - isActive: バインディングの有効/無効状態
 * - currentLoopContext: 親方向へ遡ってループコンテキストを解決（キャッシュ付き）
 * 
 * パフォーマンス最適化:
 * - currentLoopContext のキャッシング（初回解決後は再利用）
 * - 二重更新防止（renderer.updatedBindings でチェック）
 * - 親ノード存在チェックによる無効操作の回避
 * 
 * BindContent class is the core implementation managing DOM fragments (DocumentFragment)
 * generated from templates and their binding information (IBinding[]).
 *
 * Architecture:
 * - Integrates template-based DOM generation and binding management
 * - Supports dynamic content such as loops and conditional branches
 * - Hierarchical structure with parent-child relationships (parent Binding ← BindContent ← child Binding[])
 * - Mount state tracking and lifecycle management
 * 
 * Main responsibilities:
 * 1. DOM fragment generation: Generate DocumentFragment from template ID
 * 2. Binding construction: Build IBinding array from data-bind attributes
 * 3. DOM operations: Control insertion/removal with mount/mountBefore/mountAfter/unmount
 * 4. Change application: Delegate updates to each IBinding via applyChange
 * 5. Loop support: Manage LoopContext and list indices
 * 6. Node traversal: Recursively retrieve last node via getLastNode
 * 7. Index reassignment: Handle loop updates via assignListIndex
 * 
 * State management:
 * - isMounted: Determine DOM mount state
 * - isActive: Active/inactive state of bindings
 * - currentLoopContext: Resolve loop context by traversing parent direction (with caching)
 * 
 * Performance optimization:
 * - Caching of currentLoopContext (reuse after initial resolution)
 * - Duplicate update prevention (check via renderer.updatedBindings)
 * - Invalid operation avoidance via parent node existence check
 *
 * @throws BIND-101 Template not found: 未登録テンプレートID（createContent内） / Unregistered template ID (in createContent)
 * @throws BIND-101/102/103: data-bind 情報不足/不整合（createBindings内） / Insufficient/inconsistent data-bind info (in createBindings)
 * @throws BIND-104 Child bindContent not found: 子探索で不整合（getLastNode） / Child search inconsistency (getLastNode)
 * @throws BIND-201 LoopContext is null: LoopContext 未初期化（assignListIndex） / LoopContext not initialized (assignListIndex)
 */
class BindContent implements IBindContent {
  loopContext  : ILoopContext | null;
  parentBinding: IBinding | null;
  childNodes   : Node[];
  fragment     : DocumentFragment;
  engine       : IComponentEngine | undefined;
  bindings     : IBinding[] = [];
  isActive     : boolean = false;
  id           : number;
  firstChildNode: Node | null;
  lastChildNode : Node | null;
  /**
   * この BindContent が既に DOM にマウントされているかどうか。
   * 判定は childNodes[0] の親が fragment 以外かで行う。
   */
  get isMounted() {
    return this.childNodes.length > 0 && this.childNodes[0].parentNode !== this.fragment;
  }
  /**
   * 再帰的に最終ノード（末尾のバインディング配下も含む）を取得するメソッド。
   * 
   * 処理アルゴリズム:
   * 1. 末尾のバインディング（lastBinding）を取得
   * 2. lastBinding が lastChildNode と一致する場合:
   *    a. lastBinding が子 BindContent を持つ場合
   *       - 最後の子 BindContent から再帰的に getLastNode を呼び出す
   *       - 有効なノードが返された場合、それを返す
   * 3. lastChildNode の親が parentNode と一致しない場合:
   *    - null を返す（親子関係が崩れている）
   * 4. lastChildNode を返す
   * 
   * 使用例:
   * - BindingNodeFor での DOM 挿入位置の決定
   * - ネストした BindContent の最後のノード探索
   * 
   * Method to recursively retrieve the last node (including those under trailing bindings).
   * 
   * Processing algorithm:
   * 1. Get trailing binding (lastBinding)
   * 2. If lastBinding matches lastChildNode:
   *    a. If lastBinding has child BindContent
   *       - Recursively call getLastNode from last child BindContent
   *       - Return it if valid node is returned
   * 3. If lastChildNode's parent doesn't match parentNode:
   *    - Return null (parent-child relationship broken)
   * 4. Return lastChildNode
   * 
   * Usage examples:
   * - Determining DOM insertion position in BindingNodeFor
   * - Searching last node of nested BindContent
   *
   * @param parentNode - 検証対象の親ノード（このノード配下にあることを期待） / Parent node for validation (expected to be under this node)
   * @returns 最終ノード（Node）または null（親子関係が崩れている場合） / Last node (Node) or null (if parent-child relationship broken)
   * @throws BIND-104 Child bindContent not found: 子 BindContent が見つからない（不整合） / Child BindContent not found (inconsistency)
   */
  getLastNode(parentNode: Node): Node | null {
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
  #currentLoopContext: ILoopContext | null | undefined;
  /**
   * 現在のループコンテキスト（LoopContext）を取得する getter。
   * 
   * 処理ロジック:
   * 1. キャッシュ（#currentLoopContext）が未定義（undefined）の場合:
   *    a. 自身の loopContext をチェック
   *    b. null の場合、親 BindContent へ遡って探索
   *    c. 見つかった LoopContext をキャッシュに保存
   * 2. キャッシュされた値を返す
   * 
   * キャッシュ戦略:
   * - undefined: 未解決（初回アクセス時）
   * - null: 解決済みだがループコンテキストなし
   * - ILoopContext: 解決済みでループコンテキストあり
   * 
   * パフォーマンス最適化:
   * - 親方向への探索は初回のみ
   * - 2回目以降はキャッシュから即座に返す
   * - unmount() でキャッシュをクリア（undefined に戻す）
   * 
   * Getter to retrieve current loop context (LoopContext).
   * 
   * Processing logic:
   * 1. If cache (#currentLoopContext) is undefined:
   *    a. Check own loopContext
   *    b. If null, traverse to parent BindContent
   *    c. Save found LoopContext to cache
   * 2. Return cached value
   * 
   * Cache strategy:
   * - undefined: Unresolved (on first access)
   * - null: Resolved but no loop context
   * - ILoopContext: Resolved with loop context
   * 
   * Performance optimization:
   * - Parent traversal only on first access
   * - Returns immediately from cache on subsequent accesses
   * - Cache cleared (back to undefined) on unmount()
   */
  get currentLoopContext(): ILoopContext | null {
    if (typeof this.#currentLoopContext === "undefined") {
      let bindContent: IBindContent | null = this;
      while(bindContent !== null) {
        if (bindContent.loopContext !== null) break; ;
        bindContent = bindContent.parentBinding?.parentBindContent ?? null;
      }
      this.#currentLoopContext = bindContent?.loopContext ?? null;
    }
    return this.#currentLoopContext;
  }
  /**
   * BindContent のコンストラクタ。
   * 
   * 初期化処理フロー:
   * 1. 親バインディングとテンプレートIDを保存
   * 2. createContent() で DocumentFragment を生成
   * 3. childNodes 配列を構築（fragment.childNodes から）
   * 4. firstChildNode と lastChildNode を設定
   * 5. コンポーネントエンジンを保存
   * 6. loopRef に listIndex がある場合、LoopContext を生成
   * 7. createBindings() で IBinding 配列を生成
   * 
   * LoopContext 生成条件:
   * - loopRef.listIndex が null でない場合
   * - ループバインディング（for）で使用される
   * 
   * 注意事項:
   * - コンストラクタ実行後、activate() を呼び出してバインディングを有効化する必要がある
   * - childNodes は DocumentFragment 内に留まっている（マウント前）
   * 
   * BindContent constructor.
   * 
   * Initialization processing flow:
   * 1. Save parent binding and template ID
   * 2. Generate DocumentFragment via createContent()
   * 3. Build childNodes array (from fragment.childNodes)
   * 4. Set firstChildNode and lastChildNode
   * 5. Save component engine
   * 6. Generate LoopContext if loopRef has listIndex
   * 7. Generate IBinding array via createBindings()
   * 
   * LoopContext generation conditions:
   * - When loopRef.listIndex is not null
   * - Used in loop bindings (for)
   * 
   * Notes:
   * - After constructor execution, need to call activate() to enable bindings
   * - childNodes remain in DocumentFragment (before mount)
   */
  constructor(
    parentBinding: IBinding | null,
    id           : number, 
    engine       : IComponentEngine, 
    loopRef      : IStatePropertyRef,
  ) {
    this.parentBinding = parentBinding;
    this.id = id;
    this.fragment = createContent(id);
    this.childNodes = Array.from(this.fragment.childNodes);
    this.firstChildNode = this.childNodes[0] ?? null;
    this.lastChildNode = this.childNodes[this.childNodes.length - 1] ?? null;
    this.engine = engine;
    this.loopContext = (loopRef.listIndex !== null) ? createLoopContext(loopRef, this) : null;
    const bindings = createBindings(
      this, 
      id, 
      engine, 
      this.fragment
    );
    this.bindings = bindings;
  }
  /**
   * 親ノードの末尾に childNodes をマウント（appendChild）するメソッド。
   * 
   * 処理:
   * - 各 childNode を順番に parentNode.appendChild() で追加
   * - マウント後、isMounted は true になる
   * 
   * 注意事項:
   * - 冪等性（idempotent）ではない
   * - 重複マウントは呼び出し側で避ける必要がある
   * - マウント前に isMounted でチェック推奨
   * 
   * Method to mount childNodes to the end of parent node (appendChild).
   * 
   * Processing:
   * - Add each childNode sequentially via parentNode.appendChild()
   * - After mount, isMounted becomes true
   * 
   * Notes:
   * - Not idempotent
   * - Duplicate mounts must be avoided by caller
   * - Recommend checking with isMounted before mount
   * 
   * @param parentNode - マウント先の親ノード / Parent node for mount destination
   */
  mount(parentNode: Node) {
    for(let i = 0; i < this.childNodes.length; i++) {
      parentNode.appendChild(this.childNodes[i]);
    }
  }
  /**
   * 指定ノードの直前に childNodes をマウント（insertBefore）するメソッド。
   * 
   * 処理:
   * - 各 childNode を順番に parentNode.insertBefore(child, beforeNode) で挿入
   * - beforeNode が null の場合、末尾に追加される（appendChild と同等）
   * 
   * 使用例:
   * - BindingNodeFor での配列要素挿入
   * - BindingNodeIf での条件分岐コンテンツ挿入
   * 
   * Method to mount childNodes immediately before specified node (insertBefore).
   * 
   * Processing:
   * - Insert each childNode sequentially via parentNode.insertBefore(child, beforeNode)
   * - If beforeNode is null, appended to end (equivalent to appendChild)
   * 
   * Usage examples:
   * - Array element insertion in BindingNodeFor
   * - Conditional branch content insertion in BindingNodeIf
   * 
   * @param parentNode - マウント先の親ノード / Parent node for mount destination
   * @param beforeNode - 挿入位置の基準ノード（この直前に挿入） / Reference node for insertion position (insert immediately before this)
   */
  mountBefore(parentNode: Node, beforeNode: Node | null) {
    for(let i = 0; i < this.childNodes.length; i++) {
      parentNode.insertBefore(this.childNodes[i], beforeNode);
    }
  }
  /**
   * 指定ノードの直後に childNodes をマウントするメソッド。
   * 
   * 処理ロジック:
   * 1. afterNode.nextSibling を beforeNode として取得
   * 2. 各 childNode を parentNode.insertBefore(child, beforeNode) で挿入
   * 
   * 動作:
   * - afterNode が null の場合、beforeNode は null となり末尾に追加
   * - afterNode が最後のノードの場合、beforeNode は null となり末尾に追加
   * - それ以外の場合、afterNode の次のノードの直前に挿入
   * 
   * 使用例:
   * - BindingNodeIf での条件分岐コンテンツ挿入（コメントノードの直後）
   * 
   * Method to mount childNodes immediately after specified node.
   * 
   * Processing logic:
   * 1. Get afterNode.nextSibling as beforeNode
   * 2. Insert each childNode via parentNode.insertBefore(child, beforeNode)
   * 
   * Behavior:
   * - If afterNode is null, beforeNode becomes null and appends to end
   * - If afterNode is last node, beforeNode becomes null and appends to end
   * - Otherwise, inserts immediately before afterNode's next node
   * 
   * Usage examples:
   * - Conditional branch content insertion in BindingNodeIf (immediately after comment node)
   * 
   * @param parentNode - マウント先の親ノード / Parent node for mount destination
   * @param afterNode - 挿入位置の基準ノード（この直後に挿入） / Reference node for insertion position (insert immediately after this)
   */
  mountAfter(parentNode: Node, afterNode: Node | null) {
    const beforeNode = afterNode?.nextSibling ?? null;
    for(let i = 0; i < this.childNodes.length; i++) {
      parentNode.insertBefore(this.childNodes[i], beforeNode);
    }
  }
  /**
   * DOM から childNodes をアンマウント（取り外し）するメソッド。
   * 
   * 処理フロー:
   * 1. currentLoopContext キャッシュをクリア（undefined に設定）
   * 2. 最初の childNode の parentNode を取得
   * 3. parentNode が null の場合、早期リターン（既にアンマウント済み）
   * 4. 各 childNode を parentNode.removeChild() で削除
   * 
   * 設計上の注意:
   * - コメントノードやテキストノードでも親を取得できるよう parentNode プロパティを使用
   * - Element.remove() は使用しない（全ノードタイプに対応するため）
   * 
   * アンマウント後の状態:
   * - isMounted は false になる
   * - childNodes 配列は保持される（再マウント可能）
   * - currentLoopContext は再解決が必要
   * 
   * Method to unmount (detach) childNodes from DOM.
   * 
   * Processing flow:
   * 1. Clear currentLoopContext cache (set to undefined)
   * 2. Get parentNode of first childNode
   * 3. If parentNode is null, early return (already unmounted)
   * 4. Remove each childNode via parentNode.removeChild()
   * 
   * Design considerations:
   * - Uses parentNode property to get parent even for comment/text nodes
   * - Does not use Element.remove() (to support all node types)
   * 
   * State after unmount:
   * - isMounted becomes false
   * - childNodes array is retained (remount possible)
   * - currentLoopContext requires re-resolution
   */
  unmount() {
    // 
    this.#currentLoopContext = undefined;
    // コメント/テキストノードでも確実に取得できるよう parentNode を使用する
    const parentNode = this.childNodes[0]?.parentNode ?? null;
    if (parentNode === null) {
      return; // すでにDOMから削除されている場合は何もしない
    }
    for(let i = 0; i < this.childNodes.length; i++) {
      parentNode.removeChild(this.childNodes[i]);
    }
  }
  /**
   * ループ内の ListIndex を再割り当てするメソッド。
   * 
   * 処理:
   * 1. loopContext が null でないことを確認（null の場合はエラー）
   * 2. loopContext.assignListIndex(listIndex) を呼び出し
   * 
   * 使用タイミング:
   * - BindingNodeFor での配列要素の並び替え時
   * - ループアイテムの再利用時（プールから取得したBindContent）
   * - リストインデックスの変更が必要な場合
   * 
   * 影響範囲:
   * - LoopContext 内の listIndex が更新される
   * - BindingState の ref が再解決される
   * - 関連する全バインディングが新しいインデックスを参照
   * 
   * Method to reassign ListIndex within loop.
   * 
   * Processing:
   * 1. Verify loopContext is not null (error if null)
   * 2. Call loopContext.assignListIndex(listIndex)
   * 
   * Usage timing:
   * - When reordering array elements in BindingNodeFor
   * - When reusing loop items (BindContent retrieved from pool)
   * - When list index change is needed
   * 
   * Impact scope:
   * - listIndex in LoopContext is updated
   * - ref in BindingState is re-resolved
   * - All related bindings reference new index
   * 
   * @param listIndex - 新しいリストインデックス / New list index
   * @throws BIND-201 LoopContext is null: LoopContext が未初期化 / LoopContext not initialized
   */
  assignListIndex(listIndex: IListIndex): void {
    if (this.loopContext == null) raiseError({
      code: "BIND-201",
      message: "LoopContext is null",
      context: { where: 'BindContent.assignListIndex', templateId: this.id },
      docsUrl: "./docs/error-codes.md#bind",
    });
    this.loopContext.assignListIndex(listIndex);
  }
  /**
   * 変更を適用するメインエントリポイント。
   * 
   * 処理フロー:
   * 1. 最初の childNode の parentNode を取得
   * 2. parentNode が null の場合、早期リターン（アンマウント済み）
   * 3. 各バインディングについて:
   *    a. renderer.updatedBindings に既に含まれている場合はスキップ
   *    b. binding.applyChange(renderer) を呼び出し
   * 
   * 呼び出し元:
   * - Renderer.render() から呼ばれる
   * - 状態変更時に自動的に実行される
   * 
   * 二重更新防止:
   * - renderer.updatedBindings セットで重複チェック
   * - 同じバインディングが複数回更新されるのを防ぐ
   * - パフォーマンス最適化に寄与
   * 
   * Main entry point to apply changes.
   * 
   * Processing flow:
   * 1. Get parentNode of first childNode
   * 2. If parentNode is null, early return (already unmounted)
   * 3. For each binding:
   *    a. Skip if already included in renderer.updatedBindings
   *    b. Call binding.applyChange(renderer)
   * 
   * Caller:
   * - Called from Renderer.render()
   * - Automatically executed on state changes
   * 
   * Duplicate update prevention:
   * - Duplicate check with renderer.updatedBindings set
   * - Prevents same binding from being updated multiple times
   * - Contributes to performance optimization
   * 
   * @param renderer - レンダラーインスタンス（更新管理情報を保持） / Renderer instance (holds update management information)
   */
  applyChange(renderer: IRenderer): void {
    const parentNode = this.childNodes[0]?.parentNode ?? null;
    if (parentNode === null) {
      return; // すでにDOMから削除されている場合は何もしない
    }
    for(let i = 0; i < this.bindings.length; i++) {
      const binding = this.bindings[i];
      if (renderer.updatedBindings.has(binding)) continue;
      binding.applyChange(renderer);
    }
  }
  activate(): void {
    this.isActive = true;
    for(let i = 0; i < this.bindings.length; i++) {
      this.bindings[i].activate();
    }
  }
  inactivate(): void {
    this.isActive = false;
    this.loopContext?.clearListIndex();
    for(let i = 0; i < this.bindings.length; i++) {
      this.bindings[i].inactivate();
    }
  }
}

/**
 * BindContent インスタンスを生成するファクトリ関数。
 * 
 * 生成プロセス:
 * 1. BindContent コンストラクタを呼び出し
 * 2. 内部で以下が実行される:
 *    - DocumentFragment 生成
 *    - childNodes 配列構築
 *    - LoopContext 生成（必要な場合）
 *    - IBinding 配列生成
 * 3. 生成された BindContent インスタンスを返す
 * 
 * 注意事項:
 * - この関数はインスタンス生成のみを行う
 * - activate() は呼び出し側で実行する必要がある
 * - バインディングを有効化するには activate() が必須
 * 
 * 使用場所:
 * - BindingNodeFor: ループアイテムごとに BindContent を生成
 * - BindingNodeIf: 条件分岐コンテンツの BindContent を生成
 * - ComponentEngine: ルート BindContent の生成
 * 
 * Factory function to generate BindContent instance.
 * 
 * Generation process:
 * 1. Call BindContent constructor
 * 2. Internally executes:
 *    - DocumentFragment generation
 *    - childNodes array construction
 *    - LoopContext generation (if needed)
 *    - IBinding array generation
 * 3. Return generated BindContent instance
 * 
 * Notes:
 * - This function only performs instance generation
 * - activate() must be executed by caller
 * - activate() is required to enable bindings
 * 
 * Usage locations:
 * - BindingNodeFor: Generate BindContent for each loop item
 * - BindingNodeIf: Generate BindContent for conditional branch content
 * - ComponentEngine: Generate root BindContent
 * 
 * @param parentBinding - 親の IBinding（なければ null） / Parent IBinding (null if none)
 * @param id - テンプレートID / Template ID
 * @param engine - コンポーネントエンジン / Component engine
 * @param loopRef - ループ用の StatePropertyRef（listIndex を含む場合に LoopContext を構築） / StatePropertyRef for loop (constructs LoopContext if includes listIndex)
 * @returns 生成された IBindContent インスタンス / Generated IBindContent instance
 */
export function createBindContent(
  parentBinding: IBinding | null,
  id           : number, 
  engine       :IComponentEngine, 
  loopRef      : IStatePropertyRef,
):IBindContent {
  const bindContent = new BindContent(
    parentBinding, 
    id, 
    engine, 
    loopRef,
  );
  return bindContent;
}