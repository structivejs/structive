import { createUpdater } from "../../Updater/Updater";
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
    const resultPromise = createUpdater<T>(handler.engine, (updater) => {
      return updater.update<T>(null, (state, _handler) => {
        if (typeof callback === "function") {
          return Reflect.apply(callback, state, []);
        } else {
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
      });
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
