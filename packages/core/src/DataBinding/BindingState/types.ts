import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { IListIndex } from "../../ListIndex/types";
import { IReadonlyStateHandler, IReadonlyStateProxy, IStateHandler, IStateProxy, IWritableStateHandler, IWritableStateProxy } from "../../StateClass/types";
import { IStructuredPathInfo } from "../../StateProperty/types";
import { IStatePropertyRef } from "../../StatePropertyRef/types";
import { IBinding, IRenderBinding } from "../types";

/**
 * BindingState関連の型定義ファイル。
 *
 * バインディング状態（BindingState）に関するインターフェース・ファクトリ型を定義します。
 * Stateプロパティへのアクセス・フィルタ適用・値の取得/設定・リストインデックス管理などを型安全に扱うための設計です。
 *
 * ## 主要型
 *
 * - IBindingStateBase: バインディング状態の共通インターフェース
 * - IBindingState: レンダリング機能（activate/inactivate）を含む完全な型
 * - CreateBindingStateByStateFn: バインディングインスタンス生成ファクトリ型
 * - CreateBindingStateFn: ファクトリ関数生成ファクトリ型
 *
 * ## 設計意図
 * - Stateプロパティの参照・値取得・フィルタ適用・双方向バインディング・ループインデックス管理を型安全に抽象化
 * - 通常バインディング（BindingState）とインデックスバインディング（BindingStateIndex）を統一インターフェースで扱う
 * - ファクトリパターンで柔軟な拡張性を確保
 *
 * ---
 *
 * Type definitions related to BindingState.
 *
 * Defines interfaces and factory types for binding state (BindingState).
 * Designed for type-safe handling of state property access, filter application, value get/set, and list index management.
 *
 * ## Main Types
 *
 * - IBindingStateBase: Common interface for binding state
 * - IBindingState: Complete type including rendering functions (activate/inactivate)
 * - CreateBindingStateByStateFn: Factory type for generating binding state instances
 * - CreateBindingStateFn: Factory-of-factory type for generating factory functions
 *
 * ## Design Intent
 * - Type-safe abstraction of state property reference, value get, filter application, bidirectional binding, and loop index management
 * - Uniform interface for normal binding (BindingState) and index binding (BindingStateIndex)
 * - Flexible extensibility via factory pattern
 */

/**
 * IBindingStateBase
 *
 * バインディング状態（Stateプロパティとバインディング情報の1対1対応）の共通インターフェース。
 * 通常バインディング（BindingState）とインデックスバインディング（BindingStateIndex）で共通化。
 *
 * 責務:
 * - pattern, info: バインディング対象の状態プロパティパスとその構造情報
 * - listIndex: ループバインディング時のインデックス情報
 * - ref: 状態プロパティ参照
 * - filters: 値取得時に適用するフィルタ関数群
 * - isLoopIndex: インデックスバインディングかどうかの判定
 * - assignValue: 状態プロキシへの値の書き込み（双方向バインディング）
 * - getValue: 現在の値を取得
 * - getFilteredValue: フィルタ適用後の値を取得
 *
 * 共通化の意図:
 * - 通常バインディングとインデックスバインディングを統一的に扱う
 * - 型安全なAPI設計
 *
 * ---
 *
 * Common interface for binding state (one-to-one correspondence between state property and binding info).
 * Unified for normal binding (BindingState) and index binding (BindingStateIndex).
 *
 * Responsibilities:
 * - pattern, info: State property path targeted by binding and its structural info
 * - listIndex: Index info for loop bindings
 * - ref: State property reference
 * - filters: Array of filter functions applied when retrieving value
 * - isLoopIndex: Flag indicating if this is an index binding
 * - assignValue: Write value to state proxy (for bidirectional binding)
 * - getValue: Get current value
 * - getFilteredValue: Get value after filter application
 *
 * Intent of unification:
 * - Uniform handling of normal and index bindings
 * - Type-safe API design
 */
export interface IBindingStateBase {
  /** バインディング対象の状態プロパティパス（インデックスバインディングでは未実装） / State property path targeted by binding (not implemented for index binding) */
  readonly pattern      : string | never;
  /** パスの構造情報（インデックスバインディングでは未実装） / Structural info of path (not implemented for index binding) */
  readonly info         : IStructuredPathInfo | never;
  /** ループバインディング時のインデックス情報 / Index info for loop bindings */
  readonly listIndex    : IListIndex | null;
  /** 状態プロパティ参照 / State property reference */
  readonly ref          : IStatePropertyRef | never;
  /** フィルタ関数群 / Array of filter functions */
  readonly filters      : Filters;
  /** インデックスバインディングかどうかの判定 / Flag indicating if this is an index binding */
  readonly isLoopIndex  : boolean;
  /** 状態プロキシへの値の書き込み（双方向バインディング） / Write value to state proxy (for bidirectional binding) */
  assignValue(writeState:IWritableStateProxy, handler:IWritableStateHandler, value:any): void;
  /** 現在の値を取得 / Get current value */
  getValue(state: IStateProxy, handler: IStateHandler): any;
  /** フィルタ適用後の値を取得 / Get value after filter application */
  getFilteredValue(state: IStateProxy, handler: IStateHandler): any;
}

/**
 * IBindingState
 *
 * バインディング状態の完全な型。
 * IBindingStateBase（基本機能）とIRenderBinding（activate/inactivate）を組み合わせます。
 *
 * 実装クラス:
 * - BindingState: 通常バインディング
 * - BindingStateIndex: インデックスバインディング
 *
 * Complete type of binding state.
 * Combines IBindingStateBase (basic functionality) and IRenderBinding (activate/inactivate).
 *
 * Implementing classes:
 * - BindingState: Normal binding
 * - BindingStateIndex: Index binding
 */
export type IBindingState = IBindingStateBase & Pick<IRenderBinding, "activate" | "inactivate">;

/**
 * バインディング状態生成ファクトリ型。
 * - バインディングインスタンス（IBinding）とフィルタ情報からIBindingStateを生成
 * - createBindingState, createBindingStateIndex等で利用
 *
 * Factory type for generating binding state.
 * - Generates IBindingState from binding instance (IBinding) and filter info
 * - Used in createBindingState, createBindingStateIndex, etc.
 */
export type CreateBindingStateByStateFn = (binding:IBinding, filters: FilterWithOptions) => IBindingState;

/**
 * バインディング状態ファクトリ関数生成ファクトリ型。
 * - バインディング名・フィルタテキスト配列からCreateBindingStateByStateFnを生成
 * - テンプレートパース時にバインディングごとに生成
 *
 * Factory-of-factory type for generating binding state factory functions.
 * - Generates CreateBindingStateByStateFn from binding name and filter text array
 * - Generated per binding during template parsing
 */
export type CreateBindingStateFn = (name: string, filterTexts: IFilterText[]) => CreateBindingStateByStateFn;