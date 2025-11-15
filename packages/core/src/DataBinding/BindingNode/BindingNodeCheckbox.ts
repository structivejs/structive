import { createFilters } from "../../BindingBuilder/createFilters.js";
import { IFilterText } from "../../BindingBuilder/types";
import { Filters, FilterWithOptions } from "../../Filter/types";
import { createUpdater } from "../../Updater/Updater.js";
import { raiseError } from "../../utils.js";
import { IBinding } from "../types";
import { BindingNode } from "./BindingNode.js";
import { CreateBindingNodeFn } from "./types";

/**
 * チェックボックス（input[type="checkbox"]）のバインディング。
 *
 * - 値（配列）に input.value が含まれるかで checked を制御
 *
 * Throws:
 * - BIND-201 Value is not array: 配列以外が渡された
 */
class BindingNodeCheckbox extends BindingNode {
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
    if (inputElement.type !== "checkbox") return;
    if (decorates.length > 1) {
      raiseError({
        code: "BIND-201",
        message: "Has multiple decorators",
        context: { where: "BindingNodeCheckbox.constructor", name: this.name, decoratesCount: decorates.length },
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
      // 同期処理
      createUpdater<void>(engine, (updater) => {
        updater.update(loopContext, (state, handler) => {
          binding.updateStateValue(state, handler, value);
        });
      });
    });
  }
  assignValue(value:any) {
    if (!Array.isArray(value)) {
      raiseError({
        code: 'BIND-201',
        message: 'Value is not array',
        context: { where: 'BindingNodeCheckbox.update', receivedType: typeof value },
        docsUrl: '/docs/error-codes.md#bind',
        severity: 'error',
      });
    }
    const filteredValue = this.filteredValue;
    const element = this.node as HTMLInputElement;
    element.checked = value.includes(filteredValue);
  }
}

/**
 * チェックボックス用バインディングノード生成ファクトリ関数
 * - name, フィルタ、デコレータ情報からBindingNodeCheckboxインスタンスを生成
 */
export const createBindingNodeCheckbox: CreateBindingNodeFn = 
(name: string, filterTexts: IFilterText[], decorates: string[]) => 
  (binding:IBinding, node: Node, filters: FilterWithOptions) => {
    const filterFns = createFilters(filters, filterTexts);
    return new BindingNodeCheckbox(binding, node, name, filterFns, decorates);
  }
