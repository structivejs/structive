import { raiseError } from "../../utils";
export function setLoopContext(handler, loopContext, callback) {
    if (handler.loopContext) {
        raiseError({
            code: 'STATE-301',
            message: 'already in loop context',
            context: { where: 'setLoopContext' },
            docsUrl: '/docs/error-codes.md#state',
        });
    }
    handler.loopContext = loopContext;
    let resultPromise;
    try {
        if (loopContext) {
            if (handler.refStack.length === 0) {
                raiseError({
                    code: 'STC-002',
                    message: 'handler.refStack is empty in getByRef',
                });
            }
            handler.refIndex++;
            if (handler.refIndex >= handler.refStack.length) {
                handler.refStack.push(null);
            }
            handler.refStack[handler.refIndex] = handler.lastRefStack = loopContext.ref;
            try {
                resultPromise = callback();
            }
            finally {
                handler.refStack[handler.refIndex] = null;
                handler.refIndex--;
                handler.lastRefStack = handler.refIndex >= 0 ? handler.refStack[handler.refIndex] : null;
            }
        }
        else {
            resultPromise = callback();
        }
    }
    finally {
        // Promiseの場合は新しいPromiseチェーンを返してfinallyを適用
        if (resultPromise instanceof Promise) {
            return resultPromise.finally(() => {
                handler.loopContext = null;
            });
        }
        // 同期の場合は即座にリセット
        handler.loopContext = null;
    }
    return resultPromise;
}
