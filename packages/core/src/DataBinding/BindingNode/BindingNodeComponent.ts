import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { NotifyRedrawSymbol } from "../../ComponentStateInput/symbols.js";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { IStatePropertyRef } from "../../StatePropertyRef/types.js";
import { IRenderer } from "../../Updater/types.js";
import { raiseError } from "../../utils.js";
import { registerStructiveComponent, removeStructiveComponent } from "../../WebComponents/findStructiveParent.js";
import { getCustomTagName } from "../../WebComponents/getCustomTagName.js";
import { StructiveComponent } from "../../WebComponents/types";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNodeComponent クラスは、StructiveComponent(カスタムコンポーネント)への
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、コンポーネント固有のバインディング処理を実装
 * - 親コンポーネントの状態を子コンポーネントの state プロパティにバインド
 * - カスタムエレメントの定義完了を待機して初期化を実行
 * - bindingsByComponent でコンポーネント単位のバインディング情報を管理
 *
 * 主な役割:
 * 1. name から state プロパティ名(subName)を抽出(例: "state.count" → "count")
 * 2. 親コンポーネントの状態変更を子コンポーネントに伝播(NotifyRedrawSymbol 経由)
 * 3. カスタムエレメントの tagName を判定(ハイフン付きタグ名または is 属性)
 * 4. 親子コンポーネント間の関係を登録・管理
 * 5. バインディングのライフサイクル管理(activate/inactivate)
 *
 * 使用例:
 * - <my-child data-bind="state.message: parentMessage"> → 親の parentMessage を子の message にバインド
 * - <div is="custom-comp" data-bind="state.count: totalCount"> → is 属性形式のコンポーネント
 * - <my-component data-bind="state.user: currentUser"> → オブジェクトのバインディング
 *
 * 設計ポイント:
 * - customElements.whenDefined() で定義完了を待機してから初期化
 * - notifyRedraw で変更通知の伝播範囲を絞り込み(パス・ループインデックスで判定)
 * - applyChange は即座に _notifyRedraw を呼び出し(単一バインディングの変更)
 * - activate で親子関係を登録し、inactivate で解除
 * - tagName の判定は2パターン(ハイフン付きタグ名または is 属性)
 * - bindingsByComponent でコンポーネントごとのバインディングを追跡
 *
 * ---
 *
 * BindingNodeComponent class implements binding processing to StructiveComponent (custom component).
 *
 * Architecture:
 * - Inherits BindingNode, implements component-specific binding processing
 * - Binds parent component state to child component state property
 * - Waits for custom element definition completion before initialization
 * - Manages per-component binding information with bindingsByComponent
 *
 * Main responsibilities:
 * 1. Extract state property name (subName) from name (e.g., "state.count" → "count")
 * 2. Propagate parent component state changes to child component (via NotifyRedrawSymbol)
 * 3. Determine custom element tagName (hyphenated tag name or is attribute)
 * 4. Register and manage parent-child component relationships
 * 5. Manage binding lifecycle (activate/inactivate)
 *
 * Usage examples:
 * - <my-child data-bind="state.message: parentMessage"> → Bind parent's parentMessage to child's message
 * - <div is="custom-comp" data-bind="state.count: totalCount"> → Component with is attribute
 * - <my-component data-bind="state.user: currentUser"> → Object binding
 *
 * Design points:
 * - Wait for definition completion with customElements.whenDefined() before initialization
 * - notifyRedraw narrows change notification scope (determined by path and loop index)
 * - applyChange immediately calls _notifyRedraw (single binding change)
 * - activate registers parent-child relationship, inactivate unregisters
 * - tagName determination has 2 patterns (hyphenated tag name or is attribute)
 * - bindingsByComponent tracks bindings per component
 *
 * @throws COMP-401 Cannot determine custom element tag name: タグ名を判定できない場合 / When tag name cannot be determined
 */
class BindingNodeComponent extends BindingNode {
  #subName: string;
  /**
   * カスタムエレメントのタグ名(小文字)。
   * ハイフン付きタグ名または is 属性から取得。
   *
   * Custom element tag name (lowercase).
   * Obtained from hyphenated tag name or is attribute.
   */
  tagName: string;
  
  /**
   * 子コンポーネントの state プロパティ名を返す getter。
   * name から抽出された state プロパティ名("state.count" の "count" 部分)。
   *
   * Getter to return child component's state property name.
   * State property name extracted from name ("count" part of "state.count").
   */
  get subName():string {
    return this.#subName;
  }
  
  /**
   * コンストラクタ。
   * - 親クラス(BindingNode)を初期化
   * - name から state プロパティ名(subName)を抽出
   * - カスタムエレメントのタグ名を判定
   *
   * 処理フロー:
   * 1. super() で親クラスを初期化
   * 2. name を "." で分割し、2番目の要素を subName として保存("state.count" → "count")
   * 3. ノードを HTMLElement にキャスト
   * 4. タグ名にハイフンが含まれる場合、そのタグ名を小文字で保存(<my-component>)
   * 5. is 属性にハイフンが含まれる場合、その属性値を小文字で保存(<div is="custom-comp">)
   * 6. どちらにも該当しない場合はエラー(COMP-401)
   *
   * タグ名判定の2パターン:
   * - パターン1: <my-component> → tagName = "my-component"
   * - パターン2: <div is="custom-comp"> → tagName = "custom-comp"
   *
   * エラー条件:
   * - タグ名にもハイフンがなく、is 属性も存在しない、または is 属性にハイフンがない
   *
   * Constructor.
   * - Initializes parent class (BindingNode)
   * - Extracts state property name (subName) from name
   * - Determines custom element tag name
   *
   * Processing flow:
   * 1. Initialize parent class with super()
   * 2. Split name by "." and save second element as subName ("state.count" → "count")
   * 3. Cast node to HTMLElement
   * 4. If tag name includes hyphen, save that tag name in lowercase (<my-component>)
   * 5. If is attribute includes hyphen, save that attribute value in lowercase (<div is="custom-comp">)
   * 6. Error (COMP-401) if neither applies
   *
   * Two patterns for tag name determination:
   * - Pattern 1: <my-component> → tagName = "my-component"
   * - Pattern 2: <div is="custom-comp"> → tagName = "custom-comp"
   *
   * Error conditions:
   * - No hyphen in tag name and is attribute doesn't exist, or is attribute has no hyphen
   */
  constructor(
    binding   : IBinding, 
    node      : Node, 
    name      : string,
    filters   : Filters,
    decorates : string[]
  ) {
    super(binding, node, name, filters, decorates);
    // name を分割して state プロパティ名を抽出("state.count" → "count")
    // Split name to extract state property name ("state.count" → "count")
    const [, subName] = this.name.split(".");
    this.#subName = subName;
    
    const element = this.node as HTMLElement;
    // パターン1: タグ名にハイフンが含まれる場合(<my-component>)
    // Pattern 1: Tag name includes hyphen (<my-component>)
    if (element.tagName.includes("-")) {
      this.tagName = element.tagName.toLowerCase();
    } 
    // パターン2: is 属性にハイフンが含まれる場合(<div is="custom-comp">)
    // Pattern 2: is attribute includes hyphen (<div is="custom-comp">)
    else if (element.getAttribute("is")?.includes("-")) {
      this.tagName = element.getAttribute("is")!.toLowerCase();
    } 
    // どちらにも該当しない場合はエラー
    // Error if neither applies
    else {
      raiseError({
        code: 'COMP-401',
        message: 'Cannot determine custom element tag name',
        context: { where: 'BindingNodeComponent.constructor' },
        docsUrl: '/docs/error-codes.md#comp',
      });
    }
  }

  /**
   * 子コンポーネントに再描画通知を送信する内部メソッド。
   * カスタムエレメントの定義完了を待ってから NotifyRedrawSymbol を呼び出す。
   *
   * 処理フロー:
   * 1. ノードを StructiveComponent にキャスト
   * 2. getCustomTagName でタグ名を取得
   * 3. customElements.whenDefined() で定義完了を待機
   * 4. 定義完了後、component.state[NotifyRedrawSymbol](refs) を呼び出し
   *
   * 設計意図:
   * - カスタムエレメントが未定義の場合でもエラーにならないよう、whenDefined で待機
   * - NotifyRedrawSymbol 経由で子コンポーネントに変更通知を送信
   * - 子コンポーネントは受け取った refs を基に関連する state を再評価
   *
   * Internal method to send redraw notification to child component.
   * Waits for custom element definition completion before calling NotifyRedrawSymbol.
   *
   * Processing flow:
   * 1. Cast node to StructiveComponent
   * 2. Get tag name with getCustomTagName
   * 3. Wait for definition completion with customElements.whenDefined()
   * 4. After definition, call component.state[NotifyRedrawSymbol](refs)
   *
   * Design intent:
   * - Wait with whenDefined to avoid errors when custom element is undefined
   * - Send change notification to child component via NotifyRedrawSymbol
   * - Child component re-evaluates related state based on received refs
   *
   * @param refs - 変更された state 参照の配列 / Array of changed state references
   */
  _notifyRedraw(refs: IStatePropertyRef[]): void {
    const component = this.node as StructiveComponent;
    // コンポーネントが定義されるのを待ち、初期化完了後に notifyRedraw を呼び出す
    // Wait for component definition, call notifyRedraw after initialization
    const tagName = getCustomTagName(component);
    customElements.whenDefined(tagName).then(() => {
      component.state[NotifyRedrawSymbol](refs);
    });
  }

  /**
   * 変更通知を受け取り、このバインディングに関連する参照のみを子コンポーネントに伝播。
   * パスとループインデックスで通知範囲を絞り込む。
   *
   * 処理フロー:
   * 1. 空の通知用配列(notifyRefs)を作成
   * 2. このバインディングの状態参照(compRef)とループインデックス情報を取得
   * 3. 渡された refs を1つずつチェック:
   *    a. compRef と同じパターンの場合はスキップ(applyChange で処理済み)
   *    b. compRef の累積パスセットに含まれない場合はスキップ
   *    c. ループインデックスが一致しない場合はスキップ
   * 4. フィルタを通過した refs を notifyRefs に追加
   * 5. notifyRefs が空でなければ _notifyRedraw を呼び出し
   *
   * フィルタリングの3条件:
   * 1. パターン一致チェック: applyChange で既に処理済みの ref を除外
   * 2. パス包含チェック: 累積パスセットに含まれない無関係な ref を除外
   * 3. ループインデックスチェック: 異なるループ反復の ref を除外
   *
   * 設計意図:
   * - 不要な再描画通知を削減し、パフォーマンスを向上
   * - ループ内のコンポーネントで正しいインデックスの変更のみを通知
   * - 親の状態変更が子の関連プロパティにのみ伝播するよう制御
   *
   * Receives change notification and propagates only related references to child component.
   * Narrows notification scope by path and loop index.
   *
   * Processing flow:
   * 1. Create empty notification array (notifyRefs)
   * 2. Get state reference (compRef) and loop index info for this binding
   * 3. Check each ref in passed refs:
   *    a. Skip if same pattern as compRef (already processed by applyChange)
   *    b. Skip if not included in compRef's cumulative path set
   *    c. Skip if loop index doesn't match
   * 4. Add refs that passed filter to notifyRefs
   * 5. Call _notifyRedraw if notifyRefs is not empty
   *
   * Three filtering conditions:
   * 1. Pattern match check: Exclude refs already processed by applyChange
   * 2. Path inclusion check: Exclude unrelated refs not in cumulative path set
   * 3. Loop index check: Exclude refs from different loop iterations
   *
   * Design intent:
   * - Reduce unnecessary redraw notifications to improve performance
   * - Notify only changes for correct index in components within loops
   * - Control so parent state changes propagate only to child's related properties
   *
   * @param refs - 変更された state 参照の配列 / Array of changed state references
   */
  notifyRedraw(refs: IStatePropertyRef[]): void {
    const notifyRefs: IStatePropertyRef[] = [];
    const compRef = this.binding.bindingState.ref;
    const listIndex = compRef.listIndex;
    const atIndex = (listIndex?.length ?? 0) - 1;
    
    for(const ref of refs) {
      // 条件1: applyChange で処理済みなのでスキップ
      // Condition 1: Skip as already processed by applyChange
      if (ref.info.pattern === compRef.info.pattern) {
        continue;
      }
      // 条件2: 累積パスセットに含まれない場合はスキップ
      // Condition 2: Skip if not included in cumulative path set
      if (!ref.info.cumulativePathSet.has(compRef.info.pattern)) {
        continue;
      }
      // 条件3: ループインデックスが一致しない場合はスキップ
      // Condition 3: Skip if loop index doesn't match
      if (atIndex >= 0) {
        if (ref.listIndex?.at(atIndex) !== listIndex) {
          continue;
        }
      }
      notifyRefs.push(ref);
    }
    
    // 通知対象が存在する場合のみ _notifyRedraw を呼び出し
    // Call _notifyRedraw only if there are notification targets
    if (notifyRefs.length === 0) {
      return;
    }
    this._notifyRedraw(notifyRefs);
  }

  /**
   * 単一バインディングの変更を子コンポーネントに即座に反映。
   * このバインディングの状態参照のみを通知。
   *
   * 処理:
   * - _notifyRedraw を呼び出し、このバインディングの bindingState.ref のみを渡す
   *
   * 設計意図:
   * - notifyRedraw は複数の変更をフィルタリングするが、applyChange は単一変更を直接通知
   * - renderer パラメータは未使用(他の BindingNode との互換性のため)
   *
   * Immediately reflects single binding change to child component.
   * Notifies only this binding's state reference.
   *
   * Processing:
   * - Call _notifyRedraw, passing only this binding's bindingState.ref
   *
   * Design intent:
   * - notifyRedraw filters multiple changes, but applyChange directly notifies single change
   * - renderer parameter unused (for compatibility with other BindingNode)
   *
   * @param renderer - レンダラー(未使用) / Renderer (unused)
   */
  applyChange(renderer: IRenderer): void {
    this._notifyRedraw([this.binding.bindingState.ref]);
  }

  /**
   * バインディングをアクティブ化し、親子コンポーネント間の関係を登録。
   * カスタムエレメントの定義完了を待ってから初期化を実行。
   *
   * 処理フロー:
   * 1. エンジンと親コンポーネントを取得
   * 2. ノードを StructiveComponent にキャスト
   * 3. タグ名を取得し、customElements.whenDefined() で定義完了を待機
   * 4. 定義完了後:
   *    a. 親コンポーネントに子コンポーネントを登録(registerChildComponent)
   *    b. 子コンポーネントの stateBinding にこのバインディングを追加
   * 5. registerStructiveComponent で親子関係をグローバルに登録
   * 6. bindingsByComponent にこのバインディングを追加
   *
   * 登録される情報:
   * - 親コンポーネント → 子コンポーネントの参照
   * - 子コンポーネント → バインディング情報
   * - エンジン → コンポーネントごとのバインディングセット
   *
   * 設計意図:
   * - カスタムエレメント定義前にアクセスするとエラーになるため、whenDefined で待機
   * - 親子関係を双方向に登録し、状態変更の伝播を可能にする
   * - bindingsByComponent でコンポーネント単位の管理を実現
   *
   * Activates binding and registers parent-child component relationship.
   * Waits for custom element definition completion before executing initialization.
   *
   * Processing flow:
   * 1. Get engine and parent component
   * 2. Cast node to StructiveComponent
   * 3. Get tag name and wait for definition completion with customElements.whenDefined()
   * 4. After definition:
   *    a. Register child component to parent component (registerChildComponent)
   *    b. Add this binding to child component's stateBinding
   * 5. Register parent-child relationship globally with registerStructiveComponent
   * 6. Add this binding to bindingsByComponent
   *
   * Registered information:
   * - Parent component → Child component reference
   * - Child component → Binding information
   * - Engine → Binding set per component
   *
   * Design intent:
   * - Wait with whenDefined as accessing before custom element definition causes error
   * - Register parent-child relationship bidirectionally to enable state change propagation
   * - Achieve per-component management with bindingsByComponent
   */
  activate(): void {
    const engine = this.binding.engine;
    const parentComponent = engine.owner;
    const component = this.node as StructiveComponent;

    const tagName = getCustomTagName(component);
    customElements.whenDefined(tagName).then(() => {
      // 親コンポーネントに子コンポーネントを登録
      // Register child component to parent component
      parentComponent.registerChildComponent(component);
      // 子コンポーネントの stateBinding にバインディングを追加
      // Add binding to child component's stateBinding
      component.stateBinding.addBinding(this.binding);
    });

    // グローバルな親子関係を登録
    // Register global parent-child relationship
    registerStructiveComponent(parentComponent, component);
    
    // bindingsByComponent にこのバインディングを追加
    // Add this binding to bindingsByComponent
    let bindings = engine.bindingsByComponent.get(component);
    if (typeof bindings === "undefined") {
      engine.bindingsByComponent.set(component, bindings = new Set<IBinding>());
    }
    bindings.add(this.binding);
  }

  /**
   * バインディングを非アクティブ化し、登録された関係を解除。
   *
   * 処理フロー:
   * 1. エンジンを取得
   * 2. removeStructiveComponent でグローバルな親子関係を解除
   * 3. bindingsByComponent からこのバインディングを削除
   *
   * 設計意図:
   * - activate で登録した情報をクリーンアップ
   * - メモリリークを防ぐため、不要になったバインディングを削除
   * - コンポーネントが DOM から削除される際に呼び出される
   *
   * Deactivates binding and unregisters registered relationships.
   *
   * Processing flow:
   * 1. Get engine
   * 2. Unregister global parent-child relationship with removeStructiveComponent
   * 3. Delete this binding from bindingsByComponent
   *
   * Design intent:
   * - Clean up information registered in activate
   * - Delete unnecessary bindings to prevent memory leaks
   * - Called when component is removed from DOM
   */
  inactivate(): void {
    const engine = this.binding.engine;
    // グローバルな親子関係を解除
    // Unregister global parent-child relationship
    removeStructiveComponent(this.node as StructiveComponent);
    
    // bindingsByComponent からこのバインディングを削除
    // Delete this binding from bindingsByComponent
    let bindings = engine.bindingsByComponent.get(this.node as StructiveComponent);
    if (typeof bindings !== "undefined") {
      bindings.delete(this.binding);
    }
  }

}

/**
 * コンポーネント用バインディングノード生成ファクトリ関数。
 *
 * パラメータ:
 * - name: バインディング名(例: "state.count")
 * - filterTexts: フィルタテキスト配列(パース結果)
 * - decorates: デコレータ文字列配列(component では通常未使用)
 *
 * 生成プロセス:
 * 1. 外側の関数で name, filterTexts, decorates を受け取り、内側の関数を返す
 * 2. 内側の関数で binding, node, filters を受け取り、BindingNodeComponent を生成
 * 3. createFilters でフィルタ関数群を生成
 * 4. BindingNodeComponent インスタンスを返す
 *
 * 使用場所:
 * - BindingBuilder: data-bind 属性のパース時に呼び出される
 * - テンプレート登録時に各バインディングごとに生成される
 *
 * Factory function to generate component binding node.
 *
 * Parameters:
 * - name: Binding name (e.g., "state.count")
 * - filterTexts: Array of filter texts (parse result)
 * - decorates: Array of decorator strings (usually unused for component)
 *
 * Generation process:
 * 1. Outer function receives name, filterTexts, decorates and returns inner function
 * 2. Inner function receives binding, node, filters and generates BindingNodeComponent
 * 3. Generate filter functions with createFilters
 * 4. Return BindingNodeComponent instance
 *
 * Usage locations:
 * - BindingBuilder: Called when parsing data-bind attributes
 * - Generated per binding during template registration
 */
export const createBindingNodeComponent: CreateBindingNodeFn = 
  (name: string, filterTexts: IFilterText[], decorates: string[]) => 
    (binding:IBinding, node: Node, filters: FilterWithOptions) => {
      // フィルタ関数群を生成
      // Generate filter functions
      const filterFns = createFilters(filters, filterTexts);
      return new BindingNodeComponent(binding, node, name, filterFns, decorates);
    }
