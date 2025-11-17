import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { FilterWithOptions } from "../../Filter/types";
import { IListIndex } from "../../ListIndex/types.js";
import { GetByRefSymbol, GetListIndexesByRefSymbol } from "../../StateClass/symbols.js";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { IStructuredPathInfo } from "../../StateProperty/types.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { IRenderer } from "../../Updater/types.js";
import { raiseError } from "../../utils.js";
import { createBindContent } from "../BindContent.js";
import { IBindContent, IBinding } from "../types";
import { BindingNodeBlock } from "./BindingNodeBlock.js";
import { CreateBindingNodeFn } from "./types";

const EMPTY_SET = new Set<any>();

/**
 * フラグメントに追加し、一括でノードで追加するかのフラグ。
 * ベンチマークの結果で判断する。
 * グローバル変数 __STRUCTIVE_USE_ALL_APPEND__ で制御可能。
 *
 * Flag to add to fragment and append all nodes at once.
 * Determined by benchmark results.
 * Controllable via global variable __STRUCTIVE_USE_ALL_APPEND__.
 */
const USE_ALL_APPEND = (globalThis as any).__STRUCTIVE_USE_ALL_APPEND__ === true;

/**
 * BindingNodeFor クラスは、for バインディング（配列やリストの繰り返し描画）を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNodeBlock を継承し、ループ制御に特化した実装を提供
 * - リストの各要素に対して BindContent を生成・管理し、DOM に反映
 * - 差分検出アルゴリズムにより追加・削除・並び替え・上書きを最適化
 * - プール機構により BindContent のライフサイクルを管理し、GC 圧を軽減
 * - WeakMap による BindContent とリストインデックスのマッピング
 *
 * 主な役割:
 * 1. リストデータの各要素ごとに BindContent（バインディングコンテキスト）を生成・管理
 * 2. 配列の差分検出（追加・削除・並び替え・上書き）により、必要な BindContent の生成・再利用・削除・再描画を最適化
 * 3. DOM 上での要素の並び替えや再利用、アンマウント・マウント処理を効率的に行う
 * 4. プール機構により BindContent の再利用を促進し、パフォーマンスを向上
 * 5. リストインデックス情報を管理し、各要素の状態とバインディングを関連付け
 *
 * 使用例:
 * - <ul><li data-bind="for: items">{{name}}</li></ul> → items 配列の各要素を li として繰り返し描画
 * - <div data-bind="for: users"><span>{{user.name}}</span></div> → users 配列の各要素を div 内に描画
 * - <template data-bind="for: products">...</template> → products 配列の各要素をテンプレート展開
 *
 * 差分検出の種類:
 * 1. 追加（adds）: 新しい要素の追加 → BindContent を生成し mount + applyChange
 * 2. 削除（removes）: 既存要素の削除 → BindContent を unmount し プールに格納
 * 3. 並び替え（changeIndexes）: インデックスの変更のみ → DOM 位置調整のみ（再描画なし）
 * 4. 上書き（overwrites）: 同位置の内容変化 → applyChange で再描画
 * 5. 再利用（reuse）: 既存要素の位置調整 → DOM 移動のみ（必要に応じて applyChange）
 *
 * 最適化戦略:
 * 1. リオーダー最適化: 追加・削除がない場合、並び替えのみ DOM 移動で処理（再描画なし）
 * 2. 全削除最適化: 全要素削除時、親ノードの textContent をクリアして一括削除
 * 3. 全追加最適化: 全要素追加時、DocumentFragment でバッファリングして一括追加
 * 4. プール最適化: BindContent を再利用し、生成・破棄のコストを削減
 * 5. 差分最小化: Set.difference() により追加・削除要素を効率的に特定
 *
 * プール機構:
 * - #bindContentPool: 再利用可能な BindContent の配列
 * - #bindContentLastIndex: プール内の最後の有効インデックス
 * - createBindContent: プールから取得 or 新規生成
 * - deleteBindContent: unmount してプールに戻す
 * - poolLength setter: プールサイズを動的に調整
 *
 * 状態管理:
 * - #bindContents: 現在アクティブな BindContent の配列（表示順）
 * - #bindContentByListIndex: ListIndex → BindContent のマッピング（WeakMap）
 * - #oldList: 前回の配列データのコピー（差分検出用）
 * - #oldListIndexes: 前回の ListIndex 配列（差分検出用）
 * - #oldListIndexSet: 前回の ListIndex の Set（高速検索用）
 *
 * 設計ポイント:
 * 1. applyChange でリストの差分を検出し、BindContent の生成・削除・再利用を管理
 * 2. 追加・削除が無い場合はリオーダー（並び替え）のみを DOM 移動で処理し、再描画を抑制
 * 3. 上書き（overwrites）は同位置の内容変化のため、applyChange を再実行
 * 4. BindContent のプール・インデックス管理で GC や DOM 操作の最小化を図る
 * 5. バインディング状態やリストインデックス情報をエンジンに保存し、再描画や依存解決を容易にする
 * 6. WeakMap により BindContent とリストインデックスを関連付け、メモリリークを防止
 * 7. Set 演算（difference）により追加・削除要素を効率的に特定
 * 8. DocumentFragment による一括 DOM 追加で reflow/repaint を削減
 * 9. 全削除・全追加の特殊ケースを最適化し、大量データでもパフォーマンスを維持
 * 10. インデックス変更とデータ変更を区別し、必要な処理のみ実行
 *
 * エラー処理:
 * - BIND-201: applyChange 実行時の不整合（ParentNode is null / BindContent not found 等）
 * - BIND-202: プール長の不正設定（Length is negative）
 * - BIND-301: assignValue は未実装（update or applyChange を使用）
 *
 * パフォーマンス特性:
 * - 差分検出: O(n) - 新旧リストを1回ずつ走査
 * - 追加・削除: O(m) - 変更要素数に比例
 * - 並び替え: O(k) - 移動要素数に比例（再描画なし）
 * - メモリ: O(n) - リストサイズに比例（プールを除く）
 *
 * ---
 *
 * BindingNodeFor class implements binding processing for for binding (repeating rendering of arrays or lists).
 *
 * Architecture:
 * - Inherits BindingNodeBlock, provides implementation specialized for loop control
 * - Generates and manages BindContent for each list element and reflects to DOM
 * - Optimizes additions, deletions, reordering, and overwrites with diff detection algorithm
 * - Manages BindContent lifecycle with pool mechanism to reduce GC pressure
 * - Maps BindContent to list index with WeakMap
 *
 * Main responsibilities:
 * 1. Generate and manage BindContent (binding context) for each list data element
 * 2. Optimize necessary BindContent generation, reuse, deletion, and redrawing by array diff detection (add, remove, reorder, overwrite)
 * 3. Efficiently perform element reordering, reuse, unmount, and mount processing on DOM
 * 4. Promote BindContent reuse with pool mechanism to improve performance
 * 5. Manage list index information and associate each element's state with binding
 *
 * Usage examples:
 * - <ul><li data-bind="for: items">{{name}}</li></ul> → Render each item in items array as li repeatedly
 * - <div data-bind="for: users"><span>{{user.name}}</span></div> → Render each user in users array inside div
 * - <template data-bind="for: products">...</template> → Expand template for each product in products array
 *
 * Types of diff detection:
 * 1. Addition (adds): Adding new elements → Generate BindContent, mount + applyChange
 * 2. Deletion (removes): Deleting existing elements → Unmount BindContent and store in pool
 * 3. Reordering (changeIndexes): Only index changes → Only DOM position adjustment (no redraw)
 * 4. Overwriting (overwrites): Content change at same position → Redraw with applyChange
 * 5. Reuse (reuse): Position adjustment of existing elements → Only DOM move (applyChange if necessary)
 *
 * Optimization strategies:
 * 1. Reorder optimization: When no additions/deletions, process only reordering with DOM move (no redraw)
 * 2. All-remove optimization: When removing all elements, clear parent node's textContent for batch deletion
 * 3. All-append optimization: When adding all elements, buffer with DocumentFragment for batch addition
 * 4. Pool optimization: Reuse BindContent to reduce generation/destruction costs
 * 5. Diff minimization: Efficiently identify added/removed elements with Set.difference()
 *
 * Pool mechanism:
 * - #bindContentPool: Array of reusable BindContent
 * - #bindContentLastIndex: Last valid index in pool
 * - createBindContent: Get from pool or create new
 * - deleteBindContent: Unmount and return to pool
 * - poolLength setter: Dynamically adjust pool size
 *
 * State management:
 * - #bindContents: Array of currently active BindContent (display order)
 * - #bindContentByListIndex: Mapping of ListIndex → BindContent (WeakMap)
 * - #oldList: Copy of previous array data (for diff detection)
 * - #oldListIndexes: Previous ListIndex array (for diff detection)
 * - #oldListIndexSet: Set of previous ListIndex (for fast search)
 *
 * Design points:
 * 1. Detect list diff in applyChange and manage BindContent generation, deletion, and reuse
 * 2. Process only reordering with DOM move and suppress redraw when no additions/deletions
 * 3. Re-execute applyChange for overwrites as they are content changes at same position
 * 4. Minimize GC and DOM operations with BindContent pool and index management
 * 5. Store binding state and list index information in engine to facilitate redrawing and dependency resolution
 * 6. Associate BindContent with list index using WeakMap to prevent memory leaks
 * 7. Efficiently identify added/removed elements with Set operations (difference)
 * 8. Reduce reflow/repaint with batch DOM addition using DocumentFragment
 * 9. Optimize special cases of all-remove/all-append to maintain performance with large data
 * 10. Distinguish index changes from data changes and execute only necessary processing
 *
 * Error handling:
 * - BIND-201: Inconsistency during applyChange execution (ParentNode is null / BindContent not found, etc.)
 * - BIND-202: Invalid pool length setting (Length is negative)
 * - BIND-301: assignValue is not implemented (use update or applyChange)
 *
 * Performance characteristics:
 * - Diff detection: O(n) - Scan old and new lists once each
 * - Add/Remove: O(m) - Proportional to number of changed elements
 * - Reorder: O(k) - Proportional to number of moved elements (no redraw)
 * - Memory: O(n) - Proportional to list size (excluding pool)
 */
class BindingNodeFor extends BindingNodeBlock {
  /**
   * 現在アクティブな BindContent の配列（DOM の表示順）。
   * applyChange で更新され、リストの変更に応じて再構築される。
   * 
   * Currently active BindContent array (DOM display order).
   * Updated in applyChange, rebuilt according to list changes.
   */
  #bindContents          : IBindContent[] = [];
  
  /**
   * ListIndex → BindContent のマッピング（WeakMap）。
   * リストインデックスから対応する BindContent を高速検索するために使用。
   * WeakMap を使用することで、ListIndex が GC されると自動的にエントリも削除される。
   * 
   * Mapping of ListIndex → BindContent (WeakMap).
   * Used for fast search of corresponding BindContent from list index.
   * Using WeakMap automatically removes entries when ListIndex is GC'd.
   */
  #bindContentByListIndex: WeakMap<IListIndex, IBindContent> = new WeakMap();
  
  /**
   * 再利用可能な BindContent のプール配列。
   * 削除された BindContent が格納され、次回の生成時に再利用される。
   * プールを使用することで、生成・破棄のコストを削減し、GC 圧を軽減。
   * 
   * Pool array of reusable BindContent.
   * Stores deleted BindContent, reused in next generation.
   * Using pool reduces generation/destruction cost and GC pressure.
   */
  #bindContentPool       : IBindContent[] = [];
  
  /**
   * プール内の最後の有効インデックス。
   * プールから要素を取得する際に使用され、デクリメントされる。
   * -1 の場合はプールが空であることを示す。
   * 
   * Last valid index in pool.
   * Used when getting elements from pool, decremented.
   * -1 indicates pool is empty.
   */
  #bindContentLastIndex  : number = 0;
  
  /**
   * ループのパス情報（遅延初期化）。
   * "pattern.*" の形式で、ループ内の各要素へのパスを表す。
   * 初回アクセス時に loopInfo getter で生成される。
   * 
   * Loop path information (lazy initialization).
   * Represents path to each element in loop in "pattern.*" format.
   * Generated in loopInfo getter on first access.
   */
  #loopInfo: IStructuredPathInfo | undefined = undefined;

  /**
   * 前回の配列データのコピー（差分検出用）。
   * applyChange で新旧リストを比較し、変更を検出するために保持。
   * スプレッド演算子でコピーされ、参照の変更を防ぐ。
   * 
   * Copy of previous array data (for diff detection).
   * Retained to compare old and new lists in applyChange and detect changes.
   * Copied with spread operator to prevent reference changes.
   */
  #oldList: any = undefined;
  
  /**
   * 前回の ListIndex 配列（差分検出用）。
   * リストの各要素に対応する ListIndex のスナップショット。
   * インデックスの変更を検出するために使用。
   * 
   * Previous ListIndex array (for diff detection).
   * Snapshot of ListIndex corresponding to each list element.
   * Used to detect index changes.
   */
  #oldListIndexes: IListIndex[] = [];
  
  /**
   * 前回の ListIndex の Set（高速検索用）。
   * Set.difference() による差分検出で、追加・削除要素を効率的に特定。
   * O(1) の検索により、大量データでもパフォーマンスを維持。
   * 
   * Set of previous ListIndex (for fast search).
   * Efficiently identify added/removed elements with diff detection by Set.difference().
   * O(1) search maintains performance even with large data.
   */
  #oldListIndexSet: Set<IListIndex> = new Set();

  /**
   * 現在アクティブな BindContent の配列を取得する getter。
   * 
   * 返却される配列は、現在 DOM に表示されている要素の順序と一致します。
   * この配列は applyChange メソッドで更新され、リストの追加・削除・並び替え操作に応じて変化します。
   * 
   * 用途:
   * - DOM の現在の状態を把握するため
   * - リオーダー処理やリスト操作の基準として使用
   * - デバッグやテスト時の状態確認
   * 
   * 注意点:
   * - 返却される配列は内部状態への直接参照ではなく、読み取り専用として扱うべき
   * - プール内の非アクティブな BindContent は含まれない
   * 
   * Getter to retrieve array of currently active BindContent.
   * 
   * The returned array matches the order of elements currently displayed in DOM.
   * This array is updated by applyChange method and changes according to list add/remove/reorder operations.
   * 
   * Usage:
   * - To understand current DOM state
   * - Used as reference for reorder processing and list operations
   * - State verification during debugging or testing
   * 
   * Notes:
   * - Returned array should be treated as read-only, not a direct reference to internal state
   * - Does not include inactive BindContent in pool
   * 
   * @returns {IBindContent[]} 現在アクティブな BindContent の配列 / Array of currently active BindContent
   */
  get bindContents(): IBindContent[] {
    return this.#bindContents;
  }

  init() {
  }

  /**
   * BindContent を生成または再利用するメソッド。
   * 
   * プール機構により、可能な限り既存の BindContent を再利用し、
   * 新規生成のコストを削減します。プールに利用可能な要素がある場合は
   * プールから取得し、ない場合は新規に生成します。
   * 
   * 処理フロー:
   * 1. プールに利用可能な要素があるかチェック（#bindContentLastIndex >= 0）
   * 2a. プールから取得する場合:
   *     - プール内の最後の要素を取得
   *     - プールインデックスをデクリメント（実際のサイズ縮減は後で一括実行）
   *     - リストインデックスを再割り当て
   * 2b. 新規生成する場合:
   *     - loopInfo からループ用の StatePropertyRef を生成
   *     - createBindContent で新しい BindContent を生成
   * 3. BindContent を ListIndex に関連付けて WeakMap に登録
   * 4. BindContent をアクティブ化
   * 5. BindContent を返却
   * 
   * プール最適化:
   * - プールからの取得時、毎回配列サイズを縮減せず、インデックスのみ操作
   * - 実際のサイズ縮減は applyChange 完了後に一括実行（poolLength setter）
   * - これにより配列の再割り当てコストを削減
   * 
   * 再利用の仕組み:
   * - プールから取得した BindContent は assignListIndex で新しいインデックスに紐付け
   * - activate() により、再度アクティブな状態として使用可能に
   * - DOM ノードや内部状態は保持されたまま、異なるリストアイテムとして機能
   * 
   * 新規生成の仕組み:
   * - loopInfo（ループパス情報）と listIndex から StatePropertyRef を生成
   * - この Ref により、リストの各要素に対する状態管理が可能に
   * - binding.engine に登録され、バインディングシステムと連携
   * 
   * Method to generate or reuse BindContent.
   * 
   * Pool mechanism reuses existing BindContent as much as possible to reduce
   * new generation cost. If available elements exist in pool, gets from pool,
   * otherwise generates new.
   * 
   * Processing flow:
   * 1. Check if available elements exist in pool (#bindContentLastIndex >= 0)
   * 2a. When getting from pool:
   *     - Get last element in pool
   *     - Decrement pool index (actual size reduction executed in batch later)
   *     - Reassign list index
   * 2b. When generating new:
   *     - Generate StatePropertyRef for loop from loopInfo
   *     - Generate new BindContent with createBindContent
   * 3. Associate BindContent with ListIndex and register in WeakMap
   * 4. Activate BindContent
   * 5. Return BindContent
   * 
   * Pool optimization:
   * - When getting from pool, only manipulate index without reducing array size each time
   * - Actual size reduction executed in batch after applyChange completion (poolLength setter)
   * - This reduces array reallocation cost
   * 
   * Reuse mechanism:
   * - BindContent retrieved from pool is bound to new index with assignListIndex
   * - activate() makes it available as active state again
   * - DOM nodes and internal state are retained, functioning as different list item
   * 
   * New generation mechanism:
   * - Generate StatePropertyRef from loopInfo (loop path info) and listIndex
   * - This Ref enables state management for each list element
   * - Registered in binding.engine and cooperates with binding system
   * 
   * @param renderer - レンダラーオブジェクト（状態管理・更新制御用） / Renderer object (for state management and update control)
   * @param listIndex - リストインデックス（配列内の位置情報） / List index (position info in array)
   * @returns {IBindContent} 生成または再利用された BindContent / Generated or reused BindContent
   */
  createBindContent(renderer: IRenderer, listIndex: IListIndex): IBindContent {
    let bindContent: IBindContent;
    
    // プールに利用可能な要素があるかチェック
    // Check if available elements exist in pool
    if (this.#bindContentLastIndex >= 0) {
      // プールから再利用: プールの最後の要素を取得
      // Reuse from pool: Get last element in pool
      bindContent = this.#bindContentPool[this.#bindContentLastIndex];
      
      // プールインデックスをデクリメント（実際のサイズ縮減は後で一括実行）
      // Decrement pool index (actual size reduction executed in batch later)
      this.#bindContentLastIndex--;
      
      // 新しいリストインデックスを再割り当て
      // Reassign new list index
      bindContent.assignListIndex(listIndex);
    } else {
      // プールが空の場合は新規生成: ループ用の StatePropertyRef を生成
      // Generate new when pool is empty: Generate StatePropertyRef for loop
      const loopRef = getStatePropertyRef(this.loopInfo, listIndex);
      
      // 新しい BindContent を生成
      // Generate new BindContent
      bindContent = createBindContent(
        this.binding,
        this.id,
        this.binding.engine,
        loopRef
      );
    }
    
    // BindContent を ListIndex に関連付けて WeakMap に登録
    // Associate BindContent with ListIndex and register in WeakMap
    this.#bindContentByListIndex.set(listIndex, bindContent);
    
    // BindContent をアクティブ化（使用可能状態に）
    // Activate BindContent (make it available)
    bindContent.activate();
    
    return bindContent;
  }

  /**
   * BindContent を削除（アンマウント）し、非アクティブ化するメソッド。
   * 
   * リストから要素が削除された際に呼び出され、BindContent を DOM から削除し、
   * 非アクティブ状態にします。削除された BindContent はプールに戻され、
   * 後で再利用されます。
   * 
   * 処理フロー:
   * 1. unmount(): DOM からノードを削除し、親ノードとの関連を解除
   * 2. inactivate(): BindContent を非アクティブ状態にし、再利用可能にする
   * 
   * unmount の役割:
   * - DOM ツリーから BindContent に関連する全ノードを削除
   * - イベントリスナーやバインディングは保持（再利用時に復元）
   * - 親ノードへの参照をクリア
   * 
   * inactivate の役割:
   * - BindContent を非アクティブ状態にマーク
   * - 内部の状態やバインディング情報は保持（プールでの再利用のため）
   * - 新しい ListIndex が割り当てられるまで、処理は停止状態
   * 
   * プールへの戻し方:
   * - このメソッド呼び出し後、呼び出し元で #bindContentPool.push() により格納
   * - プール内では非アクティブ状態で保持され、次回の createBindContent で再利用
   * 
   * 設計意図:
   * - unmount と inactivate を分離することで、段階的なクリーンアップを実現
   * - DOM からの削除とバインディングの非アクティブ化を明確に分離
   * - プールでの再利用を前提とした設計（完全な破棄はしない）
   * - WeakMap からの削除は不要（ListIndex が GC されれば自動的にクリア）
   * 
   * Method to delete (unmount) and inactivate BindContent.
   * 
   * Called when element is deleted from list, removes BindContent from DOM
   * and makes it inactive. Deleted BindContent is returned to pool and
   * reused later.
   * 
   * Processing flow:
   * 1. unmount(): Remove nodes from DOM and release association with parent node
   * 2. inactivate(): Make BindContent inactive and ready for reuse
   * 
   * Role of unmount:
   * - Remove all nodes related to BindContent from DOM tree
   * - Retain event listeners and bindings (restored when reused)
   * - Clear reference to parent node
   * 
   * Role of inactivate:
   * - Mark BindContent as inactive state
   * - Retain internal state and binding info (for reuse in pool)
   * - Processing is suspended until new ListIndex is assigned
   * 
   * How to return to pool:
   * - After calling this method, stored by #bindContentPool.push() in caller
   * - Retained in inactive state in pool, reused in next createBindContent
   * 
   * Design intent:
   * - Achieve staged cleanup by separating unmount and inactivate
   * - Clearly separate removal from DOM and inactivation of binding
   * - Design premised on reuse in pool (no complete destruction)
   * - No need to delete from WeakMap (automatically cleared when ListIndex is GC'd)
   * 
   * @param bindContent - 削除する BindContent / BindContent to delete
   */
  deleteBindContent(bindContent: IBindContent): void {
    // DOM から BindContent のノードを削除
    // Remove BindContent's nodes from DOM
    bindContent.unmount();
    
    // BindContent を非アクティブ状態にし、プールでの再利用に備える
    // Make BindContent inactive and prepare for reuse in pool
    bindContent.inactivate();
  }

  /**
   * プール内の最後の有効インデックスを取得する getter。
   * 
   * このインデックスは、プールから BindContent を取得する際に使用されます。
   * -1 の場合はプールが空であることを示します。
   * 
   * Getter to retrieve last valid index in pool.
   * 
   * This index is used when getting BindContent from pool.
   * -1 indicates pool is empty.
   * 
   * @returns {number} プール内の最後の有効インデックス / Last valid index in pool
   */
  get bindContentLastIndex():number {
    return this.#bindContentLastIndex;
  }
  
  /**
   * プール内の最後の有効インデックスを設定する setter。
   * 
   * applyChange の開始時に poolLength - 1 で初期化され、
   * プールから要素を取得するたびにデクリメントされます。
   * 
   * 設定タイミング:
   * - applyChange 開始時: this.poolLength - 1 で初期化
   * - createBindContent 内: プールから取得後にデクリメント
   * 
   * Setter to set last valid index in pool.
   * 
   * Initialized with poolLength - 1 at start of applyChange,
   * decremented each time element is retrieved from pool.
   * 
   * Setting timing:
   * - At start of applyChange: Initialize with this.poolLength - 1
   * - Inside createBindContent: Decrement after getting from pool
   * 
   * @param value - 設定する有効インデックス / Valid index to set
   */
  set bindContentLastIndex(value:number) {
    this.#bindContentLastIndex = value;
  }

  /**
   * プールの現在の長さを取得する getter。
   * 
   * プール配列の実際の長さを返します。
   * この値は applyChange 完了時に動的に調整されます。
   * 
   * Getter to retrieve current length of pool.
   * 
   * Returns actual length of pool array.
   * This value is dynamically adjusted at completion of applyChange.
   * 
   * @returns {number} プールの現在の長さ / Current length of pool
   */
  get poolLength():number {
    return this.#bindContentPool.length;
  }
  
  /**
   * プールの長さを設定する setter。
   * 
   * プール配列の長さを動的に調整します。負の値が設定された場合はエラーをスローします。
   * applyChange 完了時に bindContentLastIndex + 1 で設定され、未使用の要素を削除します。
   * 
   * プールサイズ調整の仕組み:
   * 1. applyChange 中、bindContentLastIndex はプールから取得するたびにデクリメント
   * 2. applyChange 完了時、bindContentLastIndex + 1 が実際に使用された要素数
   * 3. poolLength に設定することで、未使用の末尾要素を自動的に削除
   * 
   * 例:
   * - プール初期状態: [A, B, C, D, E] (length=5)
   * - bindContentLastIndex 初期化: 4 (length - 1)
   * - A, B, C を使用後: bindContentLastIndex = 1
   * - poolLength = 2 に設定: [A, B] (D, E は削除)
   * 
   * エラー処理:
   * - 負の値が設定された場合、BIND-202 エラーをスロー
   * - これはプールの不正な操作を防ぐための安全機構
   * 
   * Setter to set length of pool.
   * 
   * Dynamically adjusts length of pool array. Throws error if negative value is set.
   * Set with bindContentLastIndex + 1 at completion of applyChange to remove unused elements.
   * 
   * Pool size adjustment mechanism:
   * 1. During applyChange, bindContentLastIndex is decremented each time getting from pool
   * 2. At completion of applyChange, bindContentLastIndex + 1 is number of actually used elements
   * 3. Setting to poolLength automatically removes unused trailing elements
   * 
   * Example:
   * - Pool initial state: [A, B, C, D, E] (length=5)
   * - bindContentLastIndex initialization: 4 (length - 1)
   * - After using A, B, C: bindContentLastIndex = 1
   * - Set poolLength = 2: [A, B] (D, E are removed)
   * 
   * Error handling:
   * - Throws BIND-202 error if negative value is set
   * - This is safety mechanism to prevent improper pool operations
   * 
   * @param length - 設定するプールの長さ / Length of pool to set
   * @throws {Error} BIND-202 - 負の値が設定された場合 / When negative value is set
   */
  set poolLength(length: number) {
    // 負の値チェック: プールの不正な操作を防ぐ
    // Negative value check: Prevent improper pool operations
    if (length < 0) {
      raiseError({
        code: 'BIND-202',
        message: 'Length is negative',
        context: { where: 'BindingNodeFor.setPoolLength', length },
        docsUrl: './docs/error-codes.md#bind',
      });
    }
    
    // プール配列の長さを直接設定（未使用の末尾要素を自動削除）
    // Directly set pool array length (automatically remove unused trailing elements)
    this.#bindContentPool.length = length;
  }

  /**
   * ループのパス情報を取得する getter（遅延初期化）。
   * 
   * ループ内の各要素へのパス情報を "pattern.*" 形式で返します。
   * 初回アクセス時のみ生成され、以降はキャッシュされた値を返します。
   * 
   * 生成される loopPath の例:
   * - binding.bindingState.pattern が "items" の場合
   * - loopPath = "items.*"
   * - これにより、items 配列の各要素（items[0], items[1], ...）へのアクセスが可能
   * 
   * 遅延初期化の利点:
   * - 使用されない場合、getStructuredPathInfo の呼び出しコストを回避
   * - 初回アクセス時のみ計算し、以降は O(1) で取得
   * - メモリ効率の向上（未使用の BindingNodeFor ではメモリ未割り当て）
   * 
   * Getter to retrieve loop path information (lazy initialization).
   * 
   * Returns path information to each element in loop in "pattern.*" format.
   * Generated only on first access, cached value returned thereafter.
   * 
   * Example of generated loopPath:
   * - When binding.bindingState.pattern is "items"
   * - loopPath = "items.*"
   * - This enables access to each element of items array (items[0], items[1], ...)
   * 
   * Advantages of lazy initialization:
   * - Avoid getStructuredPathInfo call cost when not used
   * - Calculate only on first access, get in O(1) thereafter
   * - Improve memory efficiency (memory not allocated for unused BindingNodeFor)
   * 
   * @returns {IStructuredPathInfo} ループのパス情報 / Loop path information
   */
  get loopInfo(): IStructuredPathInfo {
    // 初回アクセス時のみ生成（遅延初期化）
    // Generate only on first access (lazy initialization)
    if (typeof this.#loopInfo === "undefined") {
      // ループパスを構築（"pattern.*" 形式）
      // Build loop path ("pattern.*" format)
      const loopPath = this.binding.bindingState.pattern + ".*";
      
      // 構造化パス情報を生成してキャッシュ
      // Generate structured path information and cache
      this.#loopInfo = getStructuredPathInfo(loopPath);
    }
    
    // キャッシュされた値を返却
    // Return cached value
    return this.#loopInfo;
  }

  /**
   * 値を直接割り当てるメソッド（未実装）。
   * 
   * BindingNodeFor では、リストの差分検出と複雑な DOM 操作が必要なため、
   * 単純な値の割り当てではなく applyChange メソッドを使用する必要があります。
   * このメソッドが呼ばれた場合、BIND-301 エラーをスローします。
   * 
   * 未実装の理由:
   * - for バインディングはリスト全体の管理が必要
   * - 差分検出アルゴリズムによる最適化が前提
   * - 単一の値割り当てではリストの追加・削除・並び替えを表現できない
   * - BindContent のプール管理や再利用機構と統合する必要がある
   * 
   * 代替手段:
   * - update() メソッド: バインディングシステムを通じた更新
   * - applyChange() メソッド: 差分検出を伴う DOM 更新
   * - 状態オブジェクトのプロパティを直接変更: 自動的に applyChange がトリガー
   * 
   * 設計意図:
   * - for バインディングの複雑性を明示的にエラーで示す
   * - 誤った使用法を防ぎ、正しい API の使用を促す
   * - 他の BindingNode との一貫性を保つため、メソッド自体は存在
   * 
   * Method to directly assign value (not implemented).
   * 
   * BindingNodeFor requires list diff detection and complex DOM operations,
   * so applyChange method must be used instead of simple value assignment.
   * Throws BIND-301 error when this method is called.
   * 
   * Reasons for not implementing:
   * - for binding requires management of entire list
   * - Optimization by diff detection algorithm is prerequisite
   * - Single value assignment cannot express list addition/deletion/reordering
   * - Need to integrate with BindContent pool management and reuse mechanism
   * 
   * Alternatives:
   * - update() method: Update through binding system
   * - applyChange() method: DOM update with diff detection
   * - Directly change state object property: Automatically triggers applyChange
   * 
   * Design intent:
   * - Explicitly show complexity of for binding with error
   * - Prevent incorrect usage and encourage correct API usage
   * - Method itself exists for consistency with other BindingNode
   * 
   * @param value - 割り当てようとした値（使用されない） / Value attempted to assign (not used)
   * @throws {Error} BIND-301 - 常にスローされる / Always thrown
   */
  assignValue(value:any) {
    // BIND-301 エラーをスロー: assignValue は for バインディングでは未実装
    // Throw BIND-301 error: assignValue is not implemented for for binding
    raiseError({
      code: 'BIND-301',
      message: 'Not implemented. Use update or applyChange',
      context: { where: 'BindingNodeFor.assignValue' },
      docsUrl: './docs/error-codes.md#bind',
    });
  }

  /**
   * リストの差分を適用して DOM とバインディングを更新する中核メソッド。
   * 
   * このメソッドは、新旧のリストを比較し、追加・削除・並び替え・上書きの
   * 差分を検出して、最適な方法で DOM を更新します。
   * 
   * 処理フロー（全体）:
   * 1. 新旧リストの差分検出（追加・削除・並び替え・上書き）
   * 2. 削除処理（全削除最適化 or 個別削除）
   * 3. 追加・再利用処理（全追加最適化 or 個別処理 or リオーダー最適化）
   * 4. 状態の更新（プール長、BindContents、oldList 等）
   * 
   * 差分の種類と処理:
   * - 追加（adds）: BindContent を生成 → mount → applyChange
   * - 削除（removes）: BindContent を unmount → プールに格納
   * - 並び替え（changeIndexes）: DOM 位置調整のみ（再描画なし）
   * - 上書き（overwrites）: 同位置の内容変化 → applyChange で再描画
   * - 再利用（reuse）: 既存要素の位置調整 → DOM 移動のみ
   * 
   * 最適化の種類:
   * 1. リオーダー最適化: 追加・削除なし → DOM 移動のみ（再描画なし）
   * 2. 全削除最適化: 全要素削除 → parentNode.textContent = "" で一括削除
   * 3. 全追加最適化: 全要素追加 → DocumentFragment でバッファリング → 一括追加
   * 
   * パフォーマンス特性:
   * - 差分検出: O(n) - 新旧リストを1回ずつ走査
   * - 追加・削除: O(m) - 変更要素数に比例
   * - 並び替え: O(k) - 移動要素数に比例（再描画なし）
   * 
   * Method to apply list diff and update DOM and bindings - core method.
   * 
   * This method compares old and new lists, detects differences (add, remove,
   * reorder, overwrite), and updates DOM in optimal way.
   * 
   * Processing flow (overall):
   * 1. Detect diff between old and new lists (add, remove, reorder, overwrite)
   * 2. Remove processing (all-remove optimization or individual removal)
   * 3. Add/reuse processing (all-append optimization or individual processing or reorder optimization)
   * 4. Update state (pool length, BindContents, oldList, etc.)
   * 
   * Types of diff and processing:
   * - Addition (adds): Generate BindContent → mount → applyChange
   * - Deletion (removes): Unmount BindContent → Store in pool
   * - Reordering (changeIndexes): Only DOM position adjustment (no redraw)
   * - Overwriting (overwrites): Content change at same position → Redraw with applyChange
   * - Reuse (reuse): Position adjustment of existing elements → Only DOM move
   * 
   * Types of optimization:
   * 1. Reorder optimization: No add/remove → Only DOM move (no redraw)
   * 2. All-remove optimization: Remove all elements → Batch remove with parentNode.textContent = ""
   * 3. All-append optimization: Add all elements → Buffer with DocumentFragment → Batch append
   * 
   * Performance characteristics:
   * - Diff detection: O(n) - Scan old and new lists once each
   * - Add/Remove: O(m) - Proportional to number of changed elements
   * - Reorder: O(k) - Proportional to number of moved elements (no redraw)
   * 
   * @param renderer - レンダラーオブジェクト（状態管理・更新制御用） / Renderer object (for state management and update control)
   */
  applyChange(renderer: IRenderer): void {
    // 新しい BindContents 配列を構築（最終的に #bindContents に設定）
    // Build new BindContents array (finally set to #bindContents)
    let newBindContents: IBindContent[] = [];

    // ステップ1: 新しいリストとリストインデックスを取得
    // Step 1: Get new list and list indexes
    const newList = renderer.readonlyState[GetByRefSymbol](this.binding.bindingState.ref);
    const newListIndexes = renderer.readonlyState[GetListIndexesByRefSymbol](this.binding.bindingState.ref) ?? [];
    const newListIndexesSet = new Set<IListIndex>(newListIndexes);

    // ステップ2: 旧リスト情報を取得し、差分セットを計算
    // Step 2: Get old list info and calculate diff sets
    const oldSet = new Set<any>(this.#oldList ?? EMPTY_SET);
    const oldListLength = this.#oldList?.length ?? 0;
    
    // 削除セット: 旧リストにあって新リストにない要素（Set.difference 使用）
    // Remove set: Elements in old list but not in new list (using Set.difference)
    const removesSet = newListIndexesSet.size === 0 ? this.#oldListIndexSet : this.#oldListIndexSet.difference(newListIndexesSet);
    
    // 追加セット: 新リストにあって旧リストにない要素（Set.difference 使用）
    // Add set: Elements in new list but not in old list (using Set.difference)
    const addsSet = this.#oldListIndexSet.size === 0 ? newListIndexesSet : newListIndexesSet.difference(this.#oldListIndexSet);
    
    const newListLength = newList?.length ?? 0;
    
    // 並び替えセット: インデックスが変更された既存要素
    // Reorder set: Existing elements with changed index
    const changeIndexesSet = new Set<IListIndex>();
    
    // 上書きセット: 同位置で内容が変更された要素
    // Overwrite set: Elements with changed content at same position
    const overwritesSet = new Set<IListIndex>();

    // ステップ3: updatingRefs から並び替え・上書き要素を特定
    // Step 3: Identify reorder/overwrite elements from updatingRefs
    const elementsPath = this.binding.bindingState.info.pattern + ".*";
    for(let i = 0; i < renderer.updatingRefs.length; i++) {
      const updatingRef = renderer.updatingRefs[i];
      
      // このループに関係ない参照はスキップ
      // Skip refs not related to this loop
      if (updatingRef.info.pattern !== elementsPath) continue;
      
      // 既に処理済みの参照はスキップ
      // Skip already processed refs
      if (renderer.processedRefs.has(updatingRef)) continue;
      
      const listIndex = updatingRef.listIndex;
      if (listIndex === null) {
        raiseError({
          code: 'BIND-201',
          message: 'ListIndex is null',
          context: { where: 'BindingNodeFor.applyChange', ref: updatingRef },
          docsUrl: './docs/error-codes.md#bind',
        });
      }
      
      // 旧リストに存在する ListIndex → 並び替え（インデックス変更）
      // ListIndex exists in old list → Reorder (index change)
      if (this.#oldListIndexSet.has(listIndex)) {
        changeIndexesSet.add(listIndex);
      } else {
        // 旧リストに存在しない ListIndex → 上書き（同位置で内容変更）
        // ListIndex not in old list → Overwrite (content change at same position)
        overwritesSet.add(listIndex);
      }
      
      // 処理済みとしてマーク
      // Mark as processed
      renderer.processedRefs.add(updatingRef);
    }

    // ステップ4: 親ノードを取得（必須）
    // Step 4: Get parent node (required)
    const parentNode = this.node.parentNode ?? raiseError({
      code: 'BIND-201',
      message: 'ParentNode is null',
      context: { where: 'BindingNodeFor.applyChange' },
      docsUrl: './docs/error-codes.md#bind',
    });

    // ステップ5: 削除処理（追加より先に実行）
    // Step 5: Removal processing (execute before addition)
    const removeBindContentsSet = new Set<IBindContent>();
    
    // 全削除最適化の条件チェック: 全要素が削除対象か
    // All-remove optimization condition check: Are all elements removal targets
    const isAllRemove = (oldListLength === removesSet.size && oldListLength > 0);
    
    // 親ノードがこのノードだけ持つかチェック（全削除最適化の追加条件）
    // Check if parent node has only this node (additional condition for all-remove optimization)
    let isParentNodeHasOnlyThisNode = false;
    if (isAllRemove) {
      // 親ノードの子ノード一覧を取得
      // Get list of parent node's child nodes
      const parentChildNodes = Array.from(parentNode.childNodes);
      const lastContent = this.#bindContents.at(-1) ?? raiseError({
        code: 'BIND-201',
        message: 'Last content is null',
        context: { where: 'BindingNodeFor.applyChange' },
        docsUrl: '/docs/error-codes.md#bind',
      });
      
      // 最初の有効ノードを取得（空白テキストノードをスキップ）
      // Get first valid node (skip blank text nodes)
      let firstNode: Node | null = parentChildNodes[0];
      while(firstNode && firstNode.nodeType === Node.TEXT_NODE && firstNode.textContent?.trim() === "") {
        firstNode = firstNode.nextSibling;
      }
      
      // 最後の有効ノードを取得（空白テキストノードをスキップ）
      // Get last valid node (skip blank text nodes)
      let lastNode: Node | null = parentChildNodes.at(-1) ?? null;
      while(lastNode && lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent?.trim() === "") {
        lastNode = lastNode.previousSibling;
      }
      
      // 最初のノードがこのノードで、最後のノードが最後の BindContent なら、親ノードはこのノードだけを持つ
      // If first node is this node and last node is last BindContent, parent node has only this node
      if (firstNode === this.node && lastNode === lastContent.getLastNode(parentNode)) {
        isParentNodeHasOnlyThisNode = true;
      }
    }
    if (isAllRemove && isParentNodeHasOnlyThisNode) {
      // 全削除最適化パス: textContent = "" で全ノードを一括削除
      // All-remove optimization path: Batch delete all nodes with textContent = ""
      parentNode.textContent = "";
      
      // このノード（コメントノード）だけは残す
      // Keep only this node (comment node)
      parentNode.append(this.node);
      
      // 全 BindContent を非アクティブ化（unmount は textContent = "" で済んでいる）
      // Inactivate all BindContent (unmount is already done with textContent = "")
      for(let i = 0; i < this.#bindContents.length; i++) {
        this.#bindContents[i].inactivate();
      }
      
      // 全 BindContent をプールに格納
      // Store all BindContent in pool
      this.#bindContentPool.push(...this.#bindContents);
    } else {
      // 個別削除パス: 削除対象を1つずつ処理
      // Individual removal path: Process removal targets one by one
      if (removesSet.size > 0) {
        for(const listIndex of removesSet) {
          // BindContent を取得
          // Get BindContent
          const bindContent = this.#bindContentByListIndex.get(listIndex);
          if (typeof bindContent === "undefined") {
            raiseError({
              code: 'BIND-201',
              message: 'BindContent not found',
              context: { where: 'BindingNodeFor.applyChange', when: 'removes' },
              docsUrl: './docs/error-codes.md#bind',
            });
          }
          
          // BindContent を削除（unmount + inactivate）
          // Delete BindContent (unmount + inactivate)
          this.deleteBindContent(bindContent);
          removeBindContentsSet.add(bindContent);
        }
        
        // 削除した BindContent をプールに格納
        // Store deleted BindContent in pool
        this.#bindContentPool.push(...removeBindContentsSet);
      }
    }

    // ステップ6: 追加・再利用・リオーダー処理
    // Step 6: Addition, reuse, and reorder processing
    let lastBindContent = null;
    const firstNode = this.node;
    
    // プールインデックスを初期化（プールの最後から取得していく）
    // Initialize pool index (get from end of pool)
    this.bindContentLastIndex = this.poolLength - 1;
    
    // 全追加最適化の条件チェック: 全要素が新規追加か
    // All-append optimization condition check: Are all elements new additions
    const isAllAppend = USE_ALL_APPEND && (newListLength === addsSet.size && newListLength > 0);
    
    // リオーダー判定: 追加・削除がなく、並び替え（changeIndexes）または上書き（overwrites）のみの場合
    // Reorder determination: No additions/deletions, only reordering (changeIndexes) or overwrites
    const isReorder = addsSet.size === 0 && removesSet.size === 0 &&
      (changeIndexesSet.size > 0 || overwritesSet.size > 0 );
    if (!isReorder) {
      // 通常処理パス: 追加・削除がある場合
      // Normal processing path: When additions/deletions exist
      
      // 旧リストのインデックスマップを作成（インデックス変更検出用）
      // Create old list index map (for index change detection)
      const oldIndexByListIndex = new Map<IListIndex, number>();
      for(let i = 0; i < this.#oldListIndexes.length; i++) {
        oldIndexByListIndex.set(this.#oldListIndexes[i], i);
      }

      // 全追加の場合、DocumentFragment でバッファリングしてから一括追加
      // For all-append, buffer with DocumentFragment then batch append
      const fragmentParentNode = isAllAppend ? document.createDocumentFragment() : parentNode;
      const fragmentFirstNode = isAllAppend ? null : firstNode;
      
      // インデックスが変更された ListIndex のリスト（後で applyChange を呼ぶ）
      // List of ListIndex with changed index (call applyChange later)
      const changeListIndexes = [];
      
      // 新リストの各要素を処理（追加 or 再利用）
      // Process each element in new list (add or reuse)
      for(let i = 0; i < newListIndexes.length; i++) {
        const listIndex = newListIndexes[i];
        
        // 挿入位置を決定（前の BindContent の最後のノードの次）
        // Determine insertion position (after last node of previous BindContent)
        const lastNode = lastBindContent?.getLastNode(fragmentParentNode) ?? fragmentFirstNode;
        let bindContent;
        
        if (addsSet.has(listIndex)) {
          // 追加パス: 新しい BindContent を生成
          // Addition path: Generate new BindContent
          bindContent = this.createBindContent(renderer, listIndex);
          
          // DOM にマウント
          // Mount to DOM
          bindContent.mountAfter(fragmentParentNode, lastNode);
          
          // 初回描画
          // Initial rendering
          bindContent.applyChange(renderer);
        } else {
          // 再利用パス: 既存の BindContent を取得
          // Reuse path: Get existing BindContent
          bindContent = this.#bindContentByListIndex.get(listIndex);
          if (typeof bindContent === "undefined") {
            raiseError({
              code: 'BIND-201',
              message: 'BindContent not found',
              context: { where: 'BindingNodeFor.applyChange', when: 'reuse' },
              docsUrl: './docs/error-codes.md#bind',
            });
          }
          
          // DOM 位置が正しくない場合は移動
          // Move if DOM position is incorrect
          if (lastNode?.nextSibling !== bindContent.firstChildNode) {
            bindContent.mountAfter(fragmentParentNode, lastNode);
          }
          
          // インデックスが変更された場合は記録（後で applyChange）
          // Record if index changed (applyChange later)
          const oldIndex = oldIndexByListIndex.get(listIndex);
          if (typeof oldIndex !== "undefined" && oldIndex !== i) {
            changeListIndexes.push(listIndex);
          }
        }
        
        // 新しい配列に追加
        // Add to new array
        newBindContents.push(bindContent);
        lastBindContent = bindContent;
      }
      
      // 全追加最適化: DocumentFragment を親ノードに一括挿入
      // All-append optimization: Batch insert DocumentFragment to parent node
      if (isAllAppend) {
        const beforeNode = firstNode.nextSibling;
        parentNode.insertBefore(fragmentParentNode, beforeNode);
      }
      
      // インデックスが変更された要素の applyChange を呼ぶ
      // Call applyChange for elements with changed index
      for(const listIndex of changeListIndexes) {
        const bindings = this.binding.bindingsByListIndex.get(listIndex) ?? [];
        for(const binding of bindings) {
          // 既に更新済みならスキップ
          // Skip if already updated
          if (renderer.updatedBindings.has(binding)) continue;
          binding.applyChange(renderer);
        }
      }
    } else {
      // リオーダー最適化パス: 要素の追加・削除がない場合の最適化処理
      // Reorder optimization path: Optimization processing when no element additions/deletions
      
      // 並び替え処理: インデックスの変更のみなので、要素の再描画は不要
      // Reorder processing: Only index changes, so element redraw is unnecessary
      // DOM 位置の調整のみ行い、BindContent の内容は再利用する
      // Only adjust DOM position and reuse BindContent content
      if (changeIndexesSet.size > 0) {
        // 既存の BindContents をコピー
        // Copy existing BindContents
        const bindContents = Array.from(this.#bindContents);
        
        // 変更されたインデックスをソート（順番に処理するため）
        // Sort changed indexes (to process in order)
        const changeIndexes = Array.from(changeIndexesSet);
        changeIndexes.sort((a, b) => a.index - b.index);
        
        for(const listIndex of changeIndexes) {
          // BindContent を取得
          // Get BindContent
          const bindContent = this.#bindContentByListIndex.get(listIndex);
          if (typeof bindContent === "undefined") {
            raiseError({
              code: 'BIND-201',
              message: 'BindContent not found',
              context: { where: 'BindingNodeFor.applyChange', when: 'reorder' },
              docsUrl: '/docs/error-codes.md#bind',
            });
          }
          
          // 新しいインデックス位置に配置
          // Place at new index position
          bindContents[listIndex.index] = bindContent;
          
          // DOM 位置を調整（前の要素の最後のノードの次に移動）
          // Adjust DOM position (move after last node of previous element)
          const lastNode = bindContents[listIndex.index - 1]?.getLastNode(parentNode) ?? firstNode;
          bindContent.mountAfter(parentNode, lastNode);
        }
        
        newBindContents = bindContents;
      }
      
      // 上書き処理: 同じ位置の要素が異なる値に変更された場合の再描画
      // Overwrite processing: Redraw when element at same position changed to different value
      if (overwritesSet.size > 0) {
        for (const listIndex of overwritesSet) {
          // BindContent を取得
          // Get BindContent
          const bindContent = this.#bindContentByListIndex.get(listIndex);
          if (typeof bindContent === "undefined") {
            raiseError({
              code: 'BIND-201',
              message: 'BindContent not found',
              context: { where: 'BindingNodeFor.applyChange', when: 'overwrites' },
              docsUrl: './docs/error-codes.md#bind',
            });
          }
          
          // 内容が変更されたので再描画
          // Redraw as content changed
          bindContent.applyChange(renderer);
        }

      }
    }

    // ステップ7: 状態を更新（次回の差分検出のため）
    // Step 7: Update state (for next diff detection)
    
    // プールの長さを更新（使用されなかった要素を削除）
    // Update pool length (remove unused elements)
    // プールの長さは、プールの最後の要素のインデックス+1
    // Pool length is last element index in pool + 1
    this.poolLength = this.bindContentLastIndex + 1;
    
    // 新しい BindContents を保存
    // Save new BindContents
    this.#bindContents = newBindContents;
    
    // 新しいリストをコピーして保存（次回の差分検出用）
    // Copy and save new list (for next diff detection)
    this.#oldList = [...newList];
    this.#oldListIndexes = [...newListIndexes];
    this.#oldListIndexSet = newListIndexesSet;
  }

  /**
   * BindingNodeFor を非アクティブ化し、すべてのリソースをクリーンアップするメソッド。
   * 
   * このメソッドは、バインディングが無効化されたり、コンポーネントが破棄されたりする際に呼び出されます。
   * すべての BindContent を DOM からアンマウントし、非アクティブ化した後、
   * 内部状態を初期状態にリセットします。
   * 
   * 処理フロー:
   * 1. すべての BindContent を unmount（DOM から削除）
   * 2. すべての BindContent を inactivate（非アクティブ化）
   * 3. BindContent をプールに格納（再利用可能にする）
   * 4. 内部状態を初期化（配列、WeakMap、インデックス等をクリア）
   * 
   * クリーンアップされるリソース:
   * - DOM ノード: すべての BindContent に関連するノードを DOM から削除
   * - イベントリスナー: inactivate により停止（メモリリーク防止）
   * - バインディング状態: すべてのバインディングを非アクティブ化
   * - 差分検出用データ: oldList、oldListIndexes、oldListIndexSet をクリア
   * - マッピング情報: bindContentByListIndex を新しい WeakMap で置き換え
   * 
   * 状態の初期化:
   * - #bindContents: 空配列にリセット
   * - #bindContentByListIndex: 新しい WeakMap を作成
   * - #bindContentLastIndex: 0 にリセット
   * - #oldList: undefined にリセット
   * - #oldListIndexes: 空配列にリセット
   * - #oldListIndexSet: 新しい空 Set を作成
   * 
   * プールへの格納:
   * - すべての BindContent をプールに push（再利用可能状態）
   * - プール自体はクリアせず、次回の初期化やマウント時に再利用される可能性
   * - これにより、同じコンポーネントの再マウント時のパフォーマンスが向上
   * 
   * 設計意図:
   * - メモリリークを防ぐため、すべての参照を適切にクリア
   * - DOM からのクリーンアップと内部状態のリセットを確実に実行
   * - プールへの格納により、再マウント時の最適化を維持
   * - WeakMap の再作成により、古い ListIndex への参照を確実に削除
   * 
   * 呼び出しタイミング:
   * - バインディングシステムから非アクティブ化が要求されたとき
   * - コンポーネントが破棄されるとき
   * - 親の BindContent が非アクティブ化されるとき
   * 
   * Inactivates BindingNodeFor and cleans up all resources.
   * 
   * This method is called when binding is invalidated or component is destroyed.
   * Unmounts all BindContent from DOM, inactivates them, then resets internal state
   * to initial state.
   * 
   * Processing flow:
   * 1. Unmount all BindContent (remove from DOM)
   * 2. Inactivate all BindContent (make inactive)
   * 3. Store BindContent in pool (make reusable)
   * 4. Initialize internal state (clear arrays, WeakMap, indexes, etc.)
   * 
   * Cleaned up resources:
   * - DOM nodes: Remove all nodes related to BindContent from DOM
   * - Event listeners: Stopped by inactivate (prevent memory leaks)
   * - Binding state: Inactivate all bindings
   * - Diff detection data: Clear oldList, oldListIndexes, oldListIndexSet
   * - Mapping info: Replace bindContentByListIndex with new WeakMap
   * 
   * State initialization:
   * - #bindContents: Reset to empty array
   * - #bindContentByListIndex: Create new WeakMap
   * - #bindContentLastIndex: Reset to 0
   * - #oldList: Reset to undefined
   * - #oldListIndexes: Reset to empty array
   * - #oldListIndexSet: Create new empty Set
   * 
   * Storing to pool:
   * - Push all BindContent to pool (reusable state)
   * - Pool itself not cleared, may be reused on next initialization or mount
   * - This improves performance when remounting same component
   * 
   * Design intent:
   * - Properly clear all references to prevent memory leaks
   * - Reliably execute cleanup from DOM and internal state reset
   * - Maintain optimization for remounting by storing to pool
   * - Ensure removal of references to old ListIndex by recreating WeakMap
   * 
   * Call timing:
   * - When inactivation is requested from binding system
   * - When component is destroyed
   * - When parent BindContent is inactivated
   */
  inactivate(): void {
    // すべての BindContent を DOM からアンマウントし、非アクティブ化
    // Unmount all BindContent from DOM and inactivate
    for(let i = 0; i < this.#bindContents.length; i++) {
      const bindContent = this.#bindContents[i];
      
      // DOM からノードを削除
      // Remove nodes from DOM
      bindContent.unmount();
      
      // BindContent を非アクティブ化（イベントリスナー停止、バインディング無効化）
      // Inactivate BindContent (stop event listeners, invalidate bindings)
      bindContent.inactivate();
    }
    
    // すべての BindContent をプールに格納（再利用可能状態）
    // Store all BindContent in pool (reusable state)
    this.#bindContentPool.push(...this.#bindContents);
    
    // 内部状態を初期化
    // Initialize internal state
    this.#bindContents = [];
    this.#bindContentByListIndex = new WeakMap();
    this.#bindContentLastIndex = 0;
    
    // 差分検出用データをクリア
    // Clear diff detection data
    this.#oldList = undefined;
    this.#oldListIndexes = [];
    this.#oldListIndexSet = new Set();
  }
}

/**
 * BindingNodeFor インスタンスを生成するファクトリー関数。
 * 
 * この関数は、データバインディングシステムにおいて for バインディングのパーサー/ビルダーとして機能します。
 * 2段階のカリー化により、バインディング定義の解析とインスタンス生成を分離しています。
 * 
 * 関数シグネチャ:
 * - 第1段階: (name, filterTexts, decorates) => カリー化された関数
 * - 第2段階: (binding, node, filters) => BindingNodeFor インスタンス
 * 
 * 処理フロー:
 * 1. 第1段階の呼び出し:
 *    - name: バインディング名（"for"）
 *    - filterTexts: フィルター定義のテキスト配列（例: ["| filter1:arg", "| filter2"]）
 *    - decorates: デコレータ配列（例: ["once", "prevent"]）
 *    → カリー化された関数を返却
 * 
 * 2. 第2段階の呼び出し:
 *    - binding: バインディングオブジェクト（状態管理やエンジンへの参照を含む）
 *    - node: 関連付ける DOM ノード（通常はコメントノード）
 *    - filters: 利用可能なフィルター定義のマップ
 *    → フィルター関数配列を生成
 *    → BindingNodeFor インスタンスを生成して返却
 * 
 * カリー化の利点:
 * - 第1段階で静的な定義（name、filterTexts、decorates）を解析
 * - 第2段階で動的なコンテキスト（binding、node、filters）を注入
 * - バインディング定義の再利用が容易（同じ定義を複数のノードに適用）
 * - パフォーマンス向上（定義解析は1回のみ）
 * 
 * フィルター処理:
 * - createFilters により filterTexts を実行可能な関数配列に変換
 * - フィルターは値の変換やフォーマットに使用（例: 大文字変換、日付フォーマット）
 * - BindingNodeFor では配列全体やリスト要素にフィルターを適用可能
 * 
 * 使用例:
 * ```typescript
 * // 第1段階: バインディング定義の解析
 * const factory = createBindingNodeFor("for", ["| uppercase"], ["once"]);
 * 
 * // 第2段階: インスタンス生成
 * const bindingNode = factory(binding, commentNode, availableFilters);
 * ```
 * 
 * デコレータの役割:
 * - "once": 初回のみ実行（更新を無視）
 * - "prevent": デフォルト動作を抑制
 * - その他カスタムデコレータによる動作制御
 * 
 * 設計パターン:
 * - Factory パターン: インスタンス生成ロジックをカプセル化
 * - Currying: 引数を段階的に適用し、部分適用を可能に
 * - Dependency Injection: filters を外部から注入し、テスタビリティ向上
 * 
 * Factory function to generate BindingNodeFor instance.
 * 
 * This function acts as parser/builder for for binding in data binding system.
 * Separates binding definition parsing and instance generation through two-stage currying.
 * 
 * Function signature:
 * - Stage 1: (name, filterTexts, decorates) => curried function
 * - Stage 2: (binding, node, filters) => BindingNodeFor instance
 * 
 * Processing flow:
 * 1. Stage 1 call:
 *    - name: Binding name ("for")
 *    - filterTexts: Array of filter definition text (e.g., ["| filter1:arg", "| filter2"])
 *    - decorates: Decorator array (e.g., ["once", "prevent"])
 *    → Return curried function
 * 
 * 2. Stage 2 call:
 *    - binding: Binding object (includes state management and engine reference)
 *    - node: DOM node to associate (usually comment node)
 *    - filters: Map of available filter definitions
 *    → Generate filter function array
 *    → Generate and return BindingNodeFor instance
 * 
 * Advantages of currying:
 * - Parse static definition (name, filterTexts, decorates) in stage 1
 * - Inject dynamic context (binding, node, filters) in stage 2
 * - Easy to reuse binding definition (apply same definition to multiple nodes)
 * - Performance improvement (definition parsing only once)
 * 
 * Filter processing:
 * - Convert filterTexts to executable function array with createFilters
 * - Filters used for value conversion and formatting (e.g., uppercase, date format)
 * - BindingNodeFor can apply filters to entire array or list elements
 * 
 * Usage example:
 * ```typescript
 * // Stage 1: Parse binding definition
 * const factory = createBindingNodeFor("for", ["| uppercase"], ["once"]);
 * 
 * // Stage 2: Generate instance
 * const bindingNode = factory(binding, commentNode, availableFilters);
 * ```
 * 
 * Role of decorators:
 * - "once": Execute only once (ignore updates)
 * - "prevent": Suppress default behavior
 * - Other custom decorators for behavior control
 * 
 * Design patterns:
 * - Factory pattern: Encapsulate instance generation logic
 * - Currying: Apply arguments in stages, enable partial application
 * - Dependency Injection: Inject filters from outside, improve testability
 * 
 * @param name - バインディング名（通常は "for"） / Binding name (usually "for")
 * @param filterTexts - フィルター定義のテキスト配列 / Array of filter definition text
 * @param decorates - デコレータ配列（動作制御用） / Decorator array (for behavior control)
 * @returns カリー化された関数（第2段階の引数を受け取る） / Curried function (receives stage 2 arguments)
 */
export const createBindingNodeFor: CreateBindingNodeFn = 
(name: string, filterTexts: IFilterText[], decorates: string[]) => 
  (binding:IBinding, node: Node, filters: FilterWithOptions) => {
    // フィルターテキストを実行可能な関数配列に変換
    // Convert filter texts to executable function array
    const filterFns = createFilters(filters, filterTexts);
    
    // BindingNodeFor インスタンスを生成して返却
    // Generate and return BindingNodeFor instance
    return new BindingNodeFor(binding, node, name, filterFns, decorates);
  }
