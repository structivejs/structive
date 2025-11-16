import { COMMENT_TEMPLATE_MARK } from "../../constants.js";
import { raiseError } from "../../utils.js";
import { BindingNode } from "./BindingNode.js";
const COMMENT_TEMPLATE_MARK_LEN = COMMENT_TEMPLATE_MARK.length;
/**
 * BindingNodeBlock は、テンプレートブロック（コメントノードで示すテンプレート挿入部）を
 * バインディング対象とする基底クラス。
 *
 * 役割:
 * - コメントのテキストからテンプレートIDを抽出し id として保持
 * - Block 系バインディングの共通処理を提供
 *
 * Throws:
 * - BIND-201 Invalid node: コメントノードから ID を抽出できない場合
 */
export class BindingNodeBlock extends BindingNode {
    #id;
    get id() {
        return this.#id;
    }
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        const commentText = this.node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN) ?? raiseError({
            code: 'BIND-201',
            message: 'Invalid node',
            context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent ?? null },
            docsUrl: '/docs/error-codes.md#bind',
            severity: 'error',
        });
        const [id,] = commentText.split(' ', 2);
        const numId = Number(id);
        // Number('') は 0 を返すため、文字列としての比較で妥当性を確認
        // また isFinite で無限大も排除
        // Integer であることも確認
        // 負の数も不可
        if (numId.toString() !== id || isNaN(numId) || !isFinite(numId) || !Number.isInteger(numId) || numId < 0) {
            raiseError({
                code: 'BIND-201',
                message: 'Invalid node',
                context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        this.#id = numId;
    }
}
