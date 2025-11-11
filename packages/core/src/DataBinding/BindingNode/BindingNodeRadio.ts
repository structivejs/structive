import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * BindingNodeRadioクラスは、ラジオボタン（input[type="radio"]）の
 * バインディング処理を担当するバインディングノードの実装です。
 *
 * 主な役割:
 * - バインディング値とinput要素のvalueが一致していればchecked=trueにする
 * - null/undefined/NaNの場合は空文字列に変換して比較
 * - フィルタやデコレータにも対応
 *
 * 設計ポイント:
 * - assignValueで値を文字列化し、input要素のvalueと比較してcheckedを制御
 * - 柔軟なバインディング記法・フィルタ適用に対応
 */
class BindingNodeRadio extends BindingNode {
  get value(): any {
    const element = this.node as HTMLInputElement;
    return element.value;
  }
  get filteredValue(): any {
    let value = this.value;
    for (let i = 0; i < this.filters.length; i++) {
      value = this.filters[i](value);
    }
    return value;
  }
  constructor(
    binding: IBinding,
    node: Node,
    name: string,
    filters: Filters,
    decorates: string[],
  ) {
    super(binding, node, name, filters, decorates);

    const isInputElement = this.node instanceof HTMLInputElement;
    if (!isInputElement) return;
    const inputElement = this.node as HTMLInputElement;
    if (inputElement.type !== "radio") return;
    if (decorates.length > 1) {
      raiseError({
        code: "BIND-201",
        message: "Has multiple decorators",
        context: { where: "BindingNodeRadio.constructor", name: this.name, decoratesCount: decorates.length },
        docsUrl: "/docs/error-codes.md#bind",
        severity: "error",
      });
    }
    const event = (decorates[0]?.startsWith("on") ? decorates[0]?.slice(2) : decorates[0]) ?? null;
    const eventName = event ?? "input";
    if (eventName === "readonly" || eventName === "ro") return;
    // 双方向バインディング: イベント発火時にstateを更新
    const engine = this.binding.engine;
    this.node.addEventListener(eventName, async (e) => {
      const loopContext = this.binding.parentBindContent.currentLoopContext;
      const value = this.filteredValue;
      await createUpdater(engine, async (updater) => {
        await updater.update(loopContext, async (state, handler) => {
          binding.updateStateValue(state, handler, value);
        });
      });
    });

  }
  assignValue(value:any) {
    if (value === null || value === undefined) {
      value = "";
    }
    const element = this.node as HTMLInputElement;
    element.checked = value === this.filteredValue;
  }
}

/**
 * ラジオボタン用バインディングノード生成ファクトリ関数
 * - name, フィルタ、デコレータ情報からBindingNodeRadioインスタンスを生成
 */
export const createBindingNodeRadio: CreateBindingNodeFn = 
(name: string, filterTexts: IFilterText[], decorates: string[]) => 
  (binding:IBinding, node: Node, filters: FilterWithOptions) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeRadio(binding, node, name, filterFns, decorates);
  }
