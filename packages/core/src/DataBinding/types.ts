import { ILoopContext } from "../LoopContext/types";
import { IComponentEngine } from "../ComponentEngine/types";
import { IBindingNode } from "./BindingNode/types";
import { IBindingState } from "./BindingState/types";
import { IReadonlyStateProxy, IWritableStateHandler, IWritableStateProxy } from "../StateClass/types";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { IListIndex } from "../ListIndex/types";
import { IRenderer } from "../Updater/types";
/**
 * DataBinding/types.ts
 *
 * バインディング処理に関する主要な型定義ファイルです。
 *
 * - IBindContent: テンプレートから生成されたDOM断片とバインディング情報を管理するインターフェース
 *   - mount/mountBefore/mountAfter/unmountでDOMへの挿入・削除を制御
 *   - childNodes, fragment, bindingsなどでDOMノードやバインディング情報を一元管理
 *   - ループや条件分岐などの複雑なバインディングにも対応
 *   - assignListIndexでループ内インデックスの再割り当て、getLastNodeで末尾ノード取得なども提供
 *
 * - IBinding: 1つのバインディング（ノードと状態の対応）を管理するインターフェース
 *   - bindingNode, bindingStateでノード・状態のバインディング情報を保持
 *   - render, init, updateStateValueで再描画・初期化・状態更新を制御
 *   - bindContentsで関連するBindContent集合を取得可能
 *
 * - StateBindSummary: 状態プロパティごとにループコンテキストとBindContentを紐付けるマップ型
 *
 * 設計ポイント:
 * - テンプレート・ループ・条件分岐など複雑なバインディング構造を型安全に管理
 * - DOMノードと状態プロパティの紐付け・再描画・状態更新を効率的に実現
 * - 柔軟な拡張や最適化にも対応できる設計
 */

export interface IRenderBinding {
  applyChange(renderer: IRenderer): void; // バインディングの変更を適用する
  activate(): void;
  inactivate(): void;
  readonly isActive: boolean;
}

export interface IBindContentBase {
  loopContext  : ILoopContext | null;
  parentBinding: IBinding | null;
  readonly isMounted         : boolean; // childNodes.length > 0 && childNodes[0].parentNode !== fragment
  readonly id                : number;
  readonly firstChildNode    : Node | null;
  readonly lastChildNode     : Node | null;
  readonly currentLoopContext: ILoopContext | null;
  mount(parentNode:Node):void;
  mountBefore(parentNode:Node, beforeNode:Node | null):void;
  mountAfter(parentNode:Node, afterNode:Node | null):void
  unmount():void;
  fragment: DocumentFragment; // unmount時にchildNodesをfragmentに移動する
  childNodes: Node[];
  bindings: IBinding[];
  assignListIndex(listIndex: IListIndex): void;
  getLastNode(parentNode: Node): Node | null;
}

export type IBindContent = IBindContentBase & IRenderBinding;

// バインドプロパティ情報
// ノードプロパティとステートプロパティの紐づけ
export interface IBindingBase {
  parentBindContent: IBindContent;
  readonly engine           : IComponentEngine;
  readonly node             : Node;
  readonly bindingNode      : IBindingNode;
  readonly bindingState     : IBindingState;
  bindContents              : IBindContent[];
  readonly bindingsByListIndex: WeakMap<IListIndex, Set<IBinding>>;
  updateStateValue(writeState: IWritableStateProxy, handler: IWritableStateHandler, value: any): void;
  notifyRedraw(refs: IStatePropertyRef[]): void;
}

export type IBinding = IBindingBase & IRenderBinding;

export type StateBindSummary = Map<string, WeakMap<ILoopContext, IBindContent>>;
