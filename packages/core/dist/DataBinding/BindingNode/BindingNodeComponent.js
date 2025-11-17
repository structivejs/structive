import { createFilters } from "../../BindingBuilder/createFilters.js";
import { NotifyRedrawSymbol } from "../../ComponentStateInput/symbols.js";
import { raiseError } from "../../utils.js";
import { registerStructiveComponent, removeStructiveComponent } from "../../WebComponents/findStructiveParent.js";
import { getCustomTagName } from "../../WebComponents/getCustomTagName.js";
import { BindingNode } from "./BindingNode.js";
/**
 * BindingNodeComponentクラスは、StructiveComponent（カスタムコンポーネント）への
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * 主な役割:
 * - バインディング対象のコンポーネントのstateプロパティ（subName）に値を反映
 * - バインディング情報をコンポーネント単位で管理（bindingsByComponentに登録）
 * - フィルタやデコレータにも対応
 *
 * 設計ポイント:
 * - nameからstateプロパティ名（subName）を抽出（例: "state.foo" → "foo"）
 * - assignValueでコンポーネントのstateに値をセット（RenderSymbol経由で反映）
 * - 初期化時にbindingsByComponentへバインディング情報を登録
 * - 柔軟なバインディング記法・フィルタ適用に対応
 */
class BindingNodeComponent extends BindingNode {
    #subName;
    tagName;
    get subName() {
        return this.#subName;
    }
    constructor(binding, node, name, filters, decorates) {
        super(binding, node, name, filters, decorates);
        const [, subName] = this.name.split(".");
        this.#subName = subName;
        const element = this.node;
        if (element.tagName.includes("-")) {
            this.tagName = element.tagName.toLowerCase();
        }
        else if (element.getAttribute("is")?.includes("-")) {
            this.tagName = element.getAttribute("is").toLowerCase();
        }
        else {
            raiseError({
                code: 'COMP-401',
                message: 'Cannot determine custom element tag name',
                context: { where: 'BindingNodeComponent._notifyRedraw' },
                docsUrl: '/docs/error-codes.md#comp',
            });
        }
    }
    _notifyRedraw(refs) {
        const component = this.node;
        // コンポーネントが定義されるのを待ち、初期化完了後に notifyRedraw を呼び出す
        const tagName = getCustomTagName(component);
        customElements.whenDefined(tagName).then(() => {
            component.state[NotifyRedrawSymbol](refs);
        });
    }
    notifyRedraw(refs) {
        const notifyRefs = [];
        const compRef = this.binding.bindingState.ref;
        const listIndex = compRef.listIndex;
        const atIndex = (listIndex?.length ?? 0) - 1;
        for (const ref of refs) {
            if (ref.info.pattern === compRef.info.pattern) {
                // applyChangeで処理済みなのでスキップ
                continue;
            }
            if (!ref.info.cumulativePathSet.has(compRef.info.pattern)) {
                continue;
            }
            if (atIndex >= 0) {
                if (ref.listIndex?.at(atIndex) !== listIndex) {
                    continue;
                }
            }
            notifyRefs.push(ref);
        }
        if (notifyRefs.length === 0) {
            return;
        }
        this._notifyRedraw(notifyRefs);
    }
    applyChange(renderer) {
        this._notifyRedraw([this.binding.bindingState.ref]);
    }
    activate() {
        const engine = this.binding.engine;
        const parentComponent = engine.owner;
        const component = this.node;
        const tagName = getCustomTagName(component);
        customElements.whenDefined(tagName).then(() => {
            // 親コンポーネントの状態をバインドする
            parentComponent.registerChildComponent(component);
            // 親コンポーネントの状態を子コンポーネントにバインドする
            component.stateBinding.addBinding(this.binding);
        });
        registerStructiveComponent(parentComponent, component);
        let bindings = engine.bindingsByComponent.get(component);
        if (typeof bindings === "undefined") {
            engine.bindingsByComponent.set(component, bindings = new Set());
        }
        bindings.add(this.binding);
    }
    inactivate() {
        const engine = this.binding.engine;
        removeStructiveComponent(this.node);
        let bindings = engine.bindingsByComponent.get(this.node);
        if (typeof bindings !== "undefined") {
            bindings.delete(this.binding);
        }
    }
}
/**
 * コンポーネント用バインディングノード生成ファクトリ関数
 * - name, フィルタ、デコレータ情報からBindingNodeComponentインスタンスを生成
 */
export const createBindingNodeComponent = (name, filterTexts, decorates) => (binding, node, filters) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeComponent(binding, node, name, filterFns, decorates);
};
