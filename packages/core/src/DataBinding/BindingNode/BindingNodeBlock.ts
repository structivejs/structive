import { COMMENT_TEMPLATE_MARK } from "../../constants.js";
import { Filters } from "../../Filter/types";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";

const COMMENT_TEMPLATE_MARK_LEN = COMMENT_TEMPLATE_MARK.length;

/**
 * BindingNodeBlock は、テンプレートブロック（コメントノードで示すテンプレート挿入部）を
 * バインディング対象とする基底クラス。
 *
 * アーキテクチャ:
 * - BindingNode を継承し、ブロックバインディング（for, if等）の共通処理を提供
 * - #id: コメントノードから抽出したテンプレートID（テンプレート登録時のID）
 * - コメント形式: "@@|<id> <pattern>" （例: "@@|123 items.*"）
 *
 * 役割:
 * 1. コメントのテキストからテンプレートIDを抽出し id として保持
 * 2. Block 系バインディング（BindingNodeFor, BindingNodeIf等）の共通処理を提供
 * 3. テンプレートIDの妥当性を厳密に検証（非負整数のみ許可）
 *
 * サブクラス:
 * - BindingNodeFor: ループバインディング
 * - BindingNodeIf: 条件分岐バインディング
 * - その他の構造制御バインディング
 *
 * コメント形式の詳細:
 * - COMMENT_TEMPLATE_MARK ("@@|") で始まる
 * - 形式: "@@|<テンプレートID> <バインディングパターン>"
 * - 例: "@@|123 items.*" → id=123, pattern="items.*"
 *
 * バリデーション:
 * 1. コメントテキストが存在すること
 * 2. テンプレートIDが数値に変換可能であること
 * 3. 変換後の数値が元の文字列と一致すること（先頭0等を排除）
 * 4. NaN, Infinity でないこと
 * 5. 整数であること
 * 6. 非負であること（0以上）
 *
 * ---
 *
 * BindingNodeBlock is the base class for template blocks (template insertion indicated by comment nodes).
 *
 * Architecture:
 * - Inherits BindingNode, provides common processing for block bindings (for, if, etc.)
 * - #id: Template ID extracted from comment node (ID during template registration)
 * - Comment format: "@@|<id> <pattern>" (e.g., "@@|123 items.*")
 *
 * Responsibilities:
 * 1. Extract template ID from comment text and hold as id
 * 2. Provide common processing for Block-type bindings (BindingNodeFor, BindingNodeIf, etc.)
 * 3. Strictly validate template ID (only non-negative integers allowed)
 *
 * Subclasses:
 * - BindingNodeFor: Loop binding
 * - BindingNodeIf: Conditional branch binding
 * - Other structural control bindings
 *
 * Comment format details:
 * - Starts with COMMENT_TEMPLATE_MARK ("@@|")
 * - Format: "@@|<template ID> <binding pattern>"
 * - Example: "@@|123 items.*" → id=123, pattern="items.*"
 *
 * Validation:
 * 1. Comment text must exist
 * 2. Template ID must be convertible to number
 * 3. Converted number must match original string (exclude leading zeros, etc.)
 * 4. Not NaN or Infinity
 * 5. Must be integer
 * 6. Non-negative (0 or greater)
 *
 * @throws BIND-201 Invalid node: コメントノードからIDを抽出できない場合 / When ID cannot be extracted from comment node
 */
export class BindingNodeBlock extends BindingNode {
  #id: number;
  
  /**
   * テンプレートIDを返すgetter。
   * コメントノードから抽出された、テンプレート登録時のID。
   *
   * Getter to return template ID.
   * ID extracted from comment node, used during template registration.
   */
  get id(): number {
    return this.#id;
  }

  /**
   * コンストラクタ。
   * - 親クラス（BindingNode）を初期化
   * - コメントノードからテンプレートIDを抽出し、厳密に検証
   *
   * 処理フロー:
   * 1. super() で親クラスを初期化
   * 2. コメントノードのテキストから COMMENT_TEMPLATE_MARK ("@@|") 以降を取得
   * 3. スペースで分割し、最初の要素をテンプレートIDとして抽出
   * 4. 数値に変換し、厳密なバリデーションを実行
   * 5. 検証通過後、#id に保存
   *
   * バリデーションの詳細:
   * - numId.toString() !== id: 先頭0等の不正な形式を排除（例: "007" → 7 → "7" ≠ "007"）
   * - isNaN(numId): 数値変換失敗を検出
   * - !isFinite(numId): 無限大（Infinity, -Infinity）を排除
   * - !Number.isInteger(numId): 小数を排除（整数のみ許可）
   * - numId < 0: 負数を排除（0以上のみ許可）
   *
   * Number('') は 0 を返すため、文字列比較で妥当性を確認する必要がある。
   *
   * Constructor.
   * - Initializes parent class (BindingNode)
   * - Extracts template ID from comment node and strictly validates
   *
   * Processing flow:
   * 1. Initialize parent class with super()
   * 2. Get text after COMMENT_TEMPLATE_MARK ("@@|") from comment node
   * 3. Split by space, extract first element as template ID
   * 4. Convert to number, execute strict validation
   * 5. After validation passes, save to #id
   *
   * Validation details:
   * - numId.toString() !== id: Exclude invalid formats like leading zeros (e.g., "007" → 7 → "7" ≠ "007")
   * - isNaN(numId): Detect number conversion failure
   * - !isFinite(numId): Exclude infinity (Infinity, -Infinity)
   * - !Number.isInteger(numId): Exclude decimals (only integers allowed)
   * - numId < 0: Exclude negatives (only 0 or greater allowed)
   *
   * Note: Number('') returns 0, so string comparison is needed for validity check.
   */
  constructor(
    binding   : IBinding, 
    node      : Node, 
    name      : string,
    filters   : Filters,
    decorates : string[]
  ) {
    super(binding, node, name, filters, decorates);
    
    // ステップ1: コメントテキストからテンプレートマーク以降を取得
    // Step 1: Get text after template mark from comment text
    const commentText = this.node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN) ?? raiseError({
      code: 'BIND-201',
      message: 'Invalid node',
      context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent ?? null },
      docsUrl: '/docs/error-codes.md#bind',
      severity: 'error',
    });
    
    // ステップ2-3: スペースで分割し、最初の要素をテンプレートIDとして抽出
    // Step 2-3: Split by space, extract first element as template ID
    const [ id,  ] = commentText.split(' ', 2);
    const numId = Number(id);
    
    // ステップ4: 厳密なバリデーション
    // Step 4: Strict validation
    // - Number('') は 0 を返すため、文字列としての比較で妥当性を確認
    // - また isFinite で無限大も排除
    // - Integer であることも確認
    // - 負の数も不可
    // - Number('') returns 0, so string comparison confirms validity
    // - isFinite also excludes infinity
    // - Confirm it's an integer
    // - Negatives not allowed
    if (numId.toString() !== id || isNaN(numId) || !isFinite(numId) || !Number.isInteger(numId) || numId < 0) {
      raiseError({
        code: 'BIND-201',
        message: 'Invalid node',
        context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent },
        docsUrl: '/docs/error-codes.md#bind',
        severity: 'error',
      });
    }
    
    // ステップ5: 検証済みIDを保存
    // Step 5: Save validated ID
    this.#id = numId;
  }
    
}