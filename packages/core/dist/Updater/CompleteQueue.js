import { raiseError } from "../utils";
class UpdateCompleteQueue {
    _queue = [];
    _processing = false;
    get _currentItem() {
        return this._queue.length > 0 ? this._queue[0] : null;
    }
    get current() {
        return this._currentItem ? this._currentItem.notifyResolver.promise : null;
    }
    async _processNext(resolver) {
        const item = this._currentItem ?? raiseError({
            code: 'UPD-301',
            message: 'No item in update complete queue to process',
            context: { where: 'CompleteQueue.processNext' },
            docsUrl: './docs/error-codes.md#upd',
        });
        let retValue = false;
        try {
            retValue = await item.completePromise; // 先につかむとは限らない
        }
        finally {
            this._queue.shift();
            item.notifyResolver.resolve(retValue);
            resolver.resolve();
        }
    }
    async _processQueue() {
        if (this._processing) {
            return;
        }
        this._processing = true;
        try {
            while (this._queue.length > 0) {
                const resolver = Promise.withResolvers();
                queueMicrotask(() => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._processNext(resolver);
                });
                await resolver.promise;
            }
        }
        finally {
            this._processing = false;
        }
    }
    enqueue(updateComplete) {
        this._queue.push({
            completePromise: updateComplete,
            notifyResolver: Promise.withResolvers(),
        });
        if (!this._processing) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._processQueue();
        }
    }
}
export function createCompleteQueue() {
    return new UpdateCompleteQueue();
}
