import { COMMENT_TEMPLATE_MARK } from "../../constants.js";
import { raiseError } from "../../utils.js";
import { BindingNode } from "./BindingNode.js";
const COMMENT_TEMPLATE_MARK_LEN = COMMENT_TEMPLATE_MARK.length;
/**
 * BindingNodeBlock is the base class for template blocks (for, if, etc.).
 * Extracts and validates template ID from comment node format: "@@|<id> <pattern>"
 *
 * Validation: Non-negative integer only, no leading zeros.
 *
 * @throws BIND-201 Invalid node: When ID cannot be extracted from comment node
 */
export class BindingNodeBlock extends BindingNode {
    _id;
    /**
     * Returns template ID extracted from comment node.
     *
     * @returns Template ID (non-negative integer)
     */
    get id() {
        return this._id;
    }
    /**
     * Extracts and validates template ID from comment node.
     * Rejects leading zeros, decimals, negatives, NaN, and Infinity.
     *
     * @param binding - Parent IBinding instance
     * @param node - Comment node containing template ID
     * @param name - Binding name
     * @param subName - Sub-property name
     * @param filters - Filter functions to apply
     * @param decorates - Array of decorators
     * @throws BIND-201 Invalid node (cannot extract valid template ID)
     */
    constructor(binding, node, name, subName, filters, decorates) {
        super(binding, node, name, subName, filters, decorates);
        const commentText = this.node.textContent?.slice(COMMENT_TEMPLATE_MARK_LEN) ?? raiseError({
            code: 'BIND-201',
            message: 'Invalid node',
            context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent ?? null },
            docsUrl: './docs/error-codes.md#bind',
            severity: 'error',
        });
        const [id,] = commentText.split(' ', 2);
        const numId = Number(id);
        if (numId.toString() !== id || isNaN(numId) || !isFinite(numId) || !Number.isInteger(numId) || numId < 0) {
            raiseError({
                code: 'BIND-201',
                message: 'Invalid node',
                context: { where: 'BindingNodeBlock.id', textContent: this.node.textContent },
                docsUrl: './docs/error-codes.md#bind',
                severity: 'error',
            });
        }
        this._id = numId;
    }
}
