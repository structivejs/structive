import { createFilters } from "../../BindingBuilder/createFilters.js";
import { getByRef } from "../../StateClass/methods/getByRef.js";
import { setByRef } from "../../StateClass/methods/setByRef.js";
import { getStructuredPathInfo } from "../../StateProperty/getStructuredPathInfo.js";
import { getStatePropertyRef } from "../../StatePropertyRef/StatepropertyRef.js";
import { raiseError } from "../../utils.js";
/**
 * BindingStateクラスは、バインディング対象の状態（State）プロパティへのアクセス・更新・フィルタ適用を担当する実装です。
 *
 * 主な役割:
 * - バインディング対象の状態プロパティ（pattern, info）やリストインデックス（listIndex）を管理
 * - get valueで現在の値を取得し、get filteredValueでフィルタ適用後の値を取得
 * - initでリストバインディング時のループコンテキストやインデックス参照を初期化
 * - assignValueで状態プロキシに値を書き込む（双方向バインディング対応）
 * - バインディング情報をエンジンに登録し、依存解決や再描画を効率化
 *
 * 設計ポイント:
 * - ワイルドカードパス（配列バインディング等）にも対応し、ループごとのインデックス管理が可能
 * - フィルタ適用は配列で柔軟に対応
 * - createBindingStateファクトリでフィルタ適用済みインスタンスを生成
 */
class BindingState {
    binding;
    pattern;
    info;
    filters;
    isLoopIndex = false;
    #nullRef = null;
    #ref = null;
    #loopContext = null;
    get listIndex() {
        return this.ref.listIndex;
    }
    get ref() {
        if (this.#nullRef === null) {
            if (this.#loopContext === null) {
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            }
            if (this.#ref === null) {
                this.#ref = getStatePropertyRef(this.info, this.#loopContext.listIndex);
            }
            return this.#ref;
        }
        else {
            return this.#nullRef ?? raiseError({
                code: 'BIND-201',
                message: 'ref is null',
                context: { pattern: this.pattern },
                docsUrl: '/docs/error-codes.md#bind',
                severity: 'error',
            });
        }
    }
    constructor(binding, pattern, filters) {
        this.binding = binding;
        this.pattern = pattern;
        this.info = getStructuredPathInfo(pattern);
        this.filters = filters;
        this.#nullRef = (this.info.wildcardCount === 0) ? getStatePropertyRef(this.info, null) : null;
    }
    getValue(state, handler) {
        return getByRef(this.binding.engine.state, this.ref, state, handler);
    }
    getFilteredValue(state, handler) {
        let value = getByRef(this.binding.engine.state, this.ref, state, handler);
        for (let i = 0; i < this.filters.length; i++) {
            value = this.filters[i](value);
        }
        return value;
    }
    assignValue(writeState, handler, value) {
        setByRef(this.binding.engine.state, this.ref, value, writeState, handler);
    }
    activate(renderer) {
        if (this.info.wildcardCount > 0) {
            const lastWildcardPath = this.info.lastWildcardPath ??
                raiseError({
                    code: 'BIND-201',
                    message: 'Wildcard last parentPath is null',
                    context: { where: 'BindingState.init', pattern: this.pattern },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            this.#loopContext = this.binding.parentBindContent.currentLoopContext?.find(lastWildcardPath) ??
                raiseError({
                    code: 'BIND-201',
                    message: 'LoopContext is null',
                    context: { where: 'BindingState.init', lastWildcardPath },
                    docsUrl: '/docs/error-codes.md#bind',
                    severity: 'error',
                });
            this.#ref = null;
        }
        this.binding.engine.saveBinding(this.ref, this.binding);
    }
    inactivate() {
        this.binding.engine.removeBinding(this.ref, this.binding);
        this.#ref = null;
        this.#loopContext = null;
    }
}
export const createBindingState = (name, filterTexts) => (binding, filters) => {
    const filterFns = createFilters(filters, filterTexts); // ToDo:ここは、メモ化できる
    return new BindingState(binding, name, filterFns);
};
