/**
 * replaceMustacheWithTemplateTag.ts
 *
 * Utility function to convert Mustache syntax ({{if:condition}}, {{for:expr}}, {{endif}}, {{endfor}},
 * {{elseif:condition}}, {{else}}, etc.) into <template> tags or comment nodes.
 *
 * Main responsibilities:
 * - Detects Mustache syntax in HTML strings using regex and converts them to <template data-bind="..."> or comment nodes
 * - Converts control structures like if/for/endif/endfor/elseif/else into <template> tags with nesting support
 * - Converts regular embedded expressions ({{expr}}) into comment nodes (<!--embed:expr-->)
 *
 * Design points:
 * - Uses a stack to manage nested structures and strictly checks correspondence of endif/endfor/elseif/else
 * - Throws exceptions via raiseError for invalid nesting or unsupported syntax
 * - elseif/else automatically generate templates with negated conditions to express conditional branching
 * - Conversion to comment nodes enables safe DOM insertion of embedded expressions
 */
import { COMMENT_EMBED_MARK } from "../constants.js";
import { raiseError } from "../utils.js";
/** Regular expression to match Mustache syntax: {{ ... }} */
const MUSTACHE_REGEXP = /\{\{([^}]+)\}\}/g;
/**
 * Converts Mustache syntax in HTML strings to template tags or comment nodes.
 * Processes control structures (if/for/elseif/else) and embedded expressions,
 * maintaining proper nesting through a stack-based parser.
 *
 * @param {string} html - HTML string containing Mustache syntax ({{...}})
 * @returns {string} HTML string with Mustache syntax replaced by template tags and comments
 * @throws {Error} Throws TMP-102 error for invalid nesting (endif without if, endfor without for, etc.)
 *
 * @example
 * const html = '<div>{{if:active}}<span>{{name}}</span>{{endif}}</div>';
 * const result = replaceMustacheWithTemplateTag(html);
 * // Returns: '<div><template data-bind="if:active"><span><!--embed:name--></span></template></div>'
 */
export function replaceMustacheWithTemplateTag(html) {
    // Stack to track nested control structures (if/for/elseif)
    const stack = [];
    return html.replaceAll(MUSTACHE_REGEXP, (_match, expression) => {
        const expr = expression.trim();
        // Extract the type (first part before ':')
        const [type] = expr.split(':');
        // If not a control structure, treat as embedded expression
        if (type !== 'if' && type !== 'for' && type !== 'endif' && type !== 'endfor' && type !== 'elseif' && type !== 'else') {
            // Convert to comment node for later processing
            return `<!--${COMMENT_EMBED_MARK}${expr}-->`;
        }
        // Extract the remaining expression after the type
        const remain = expr.slice(type.length + 1).trim();
        const currentInfo = { type, expr, remain };
        // Handle opening tags (if/for): push to stack and generate opening template tag
        if (type === 'if' || type === 'for') {
            stack.push(currentInfo);
            return `<template data-bind="${expr}">`;
        }
        else if (type === 'endif') {
            // Handle endif: pop stack until matching 'if' is found, closing all elseif branches
            const endTags = [];
            if (stack.length === 0) {
                raiseError({
                    code: 'TMP-102',
                    message: 'Endif without if',
                    context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                    docsUrl: './docs/error-codes.md#tmp',
                });
            }
            while (stack.length > 0) {
                const info = stack.pop();
                // Found the matching 'if', close it and stop
                if (info.type === 'if') {
                    endTags.push('</template>');
                    break;
                }
                else if (info.type === 'elseif') {
                    // Close elseif branches (each elseif creates nested templates)
                    endTags.push('</template>');
                }
                else {
                    // Invalid nesting: encountered non-if/elseif tag
                    raiseError({
                        code: 'TMP-102',
                        message: 'Endif without if',
                        context: { where: 'Template.replaceMustacheWithTemplateTag', got: info.type, expr },
                        docsUrl: './docs/error-codes.md#tmp',
                    });
                }
            }
            return endTags.join('');
        }
        else if (type === 'endfor') {
            // Handle endfor: pop stack and verify matching 'for'
            const info = stack.pop() ?? raiseError({
                code: 'TMP-102',
                message: 'Endfor without for',
                context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (info.type === 'for') {
                return '</template>';
            }
            // Invalid nesting: endfor without corresponding for
            raiseError({
                code: 'TMP-102',
                message: 'Endfor without for',
                context: { where: 'Template.replaceMustacheWithTemplateTag', got: info.type, expr },
                docsUrl: './docs/error-codes.md#tmp',
            });
        }
        else if (type === 'elseif') {
            const lastInfo = stack.at(-1) ?? raiseError({
                code: 'TMP-102',
                message: 'Elseif without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (lastInfo.type === 'if' || lastInfo.type === 'elseif') {
                stack.push(currentInfo);
                return `</template><template data-bind="if:${lastInfo.remain}|not"><template data-bind="if:${remain}">`;
            }
            raiseError({
                code: 'TMP-102',
                message: 'Elseif without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', got: lastInfo.type, expr },
                docsUrl: './docs/error-codes.md#tmp',
            });
        }
        else if (type === 'else') {
            // Handle else: verify it follows if, then create negated condition template
            const lastInfo = stack.at(-1) ?? raiseError({
                code: 'TMP-102',
                message: 'Else without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
                docsUrl: './docs/error-codes.md#tmp',
            });
            if (lastInfo.type === 'if') {
                // Close previous if branch and open negated condition for else
                // Structure: </template><template data-bind="if:condition|not">
                return `</template><template data-bind="if:${lastInfo.remain}|not">`;
            }
            // Invalid: else must follow if
            return raiseError({
                code: 'TMP-102',
                message: 'Else without if',
                context: { where: 'Template.replaceMustacheWithTemplateTag', got: lastInfo.type, expr },
                docsUrl: './docs/error-codes.md#tmp',
            });
        }
        /* c8 ignore start */
        // Unreachable code: All possible Mustache types are handled above
        // This code path is theoretically impossible because:
        // 1. Non-control-structure types are converted to embed comments (line 66)
        // 2. All control structure types (if/for/endif/endfor/elseif/else) have explicit handlers above
        return raiseError({
            code: 'TMP-102',
            message: 'Unreachable: All Mustache types should be handled by preceding branches',
            context: { where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth: stack.length },
            docsUrl: './docs/error-codes.md#tmp',
        });
        /* c8 ignore stop */
    });
}
