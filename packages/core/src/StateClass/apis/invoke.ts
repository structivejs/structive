import { raiseError } from "../../utils";
import { IStateHandler, IStateProxy } from "../types";

type InvokeFunction<T> = (callback: () => T) => T;

export function invoke<T>(
  _target: object, 
  _prop: PropertyKey, 
  _receiver: IStateProxy,
  handler: IStateHandler
): InvokeFunction<T> {
  return (callback: () => T): T => {
    if (typeof callback !== "function") {
      raiseError({
        code: 'STATE-203',
        message: 'Callback is not a function',
        context: {
          where: 'StateClass.invoke',
          callback,
        },
        docsUrl: './docs/error-codes.md#state',
      });
    }
    const resultPromise = handler.updater.invoke<T>((): T => {
      return Reflect.apply(callback, _receiver, []);
    });
    if (resultPromise instanceof Promise) {
      resultPromise.catch((error: unknown) => {
        const cause = error instanceof Error ? error : new Error(String(error));
        raiseError({
          code: 'STATE-204',
          message: 'Invoke callback rejected',
          context: { where: 'StateClass.invoke' },
          docsUrl: './docs/error-codes.md#state',
          severity: 'error',
          cause,
        });
      });
    }
    return resultPromise;
  } ;
}
