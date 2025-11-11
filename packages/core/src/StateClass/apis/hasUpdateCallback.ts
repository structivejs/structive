import { IStateHandler, IStateProxy } from "../types";

const UPDATED_CALLBACK = "$updatedCallback";

export function hasUpdatedCallback(
  target: Object, 
  prop: PropertyKey,
  receiver: IStateProxy,
  handler: IStateHandler,
):boolean {
  const callback = Reflect.get(target, UPDATED_CALLBACK);
  return (typeof callback === "function");
}
