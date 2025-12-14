import { createUpdater } from "../../Updater/Updater";
import { raiseError } from "../../utils";
export function invoke(_target, _prop, _receiver, handler) {
    return (callback) => {
        const resultPromise = createUpdater(handler.engine, (updater) => {
            return updater.update(null, (state, handler) => {
                if (typeof callback === "function") {
                    return Reflect.apply(callback, state, []);
                }
                else {
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
            resultPromise.catch((error) => {
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
    };
}
