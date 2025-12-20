import { raiseError } from "../../utils";
export function invoke(_target, _prop, _receiver, handler) {
    return (callback) => {
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
        const resultPromise = handler.updater.invoke(() => {
            return Reflect.apply(callback, _receiver, []);
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
