import { raiseError } from "../utils";
import { IUpdateCompleteQueue, UpdateComplete } from "./types";

interface ICompletedQueueItem {
  completePromise: UpdateComplete;
  notifyResolver: PromiseWithResolvers<boolean>;
}

class UpdateCompleteQueue implements IUpdateCompleteQueue {
  private _queue: ICompletedQueueItem[] = [];
  private _processing: boolean = false;

  private get _currentItem(): ICompletedQueueItem | null {
    return this._queue.length > 0 ? this._queue[0] : null;
  }

  get current(): UpdateComplete | null {
    return this._currentItem ? this._currentItem.notifyResolver.promise : null;
  }

  private async _processNext(resolver: PromiseWithResolvers<void>) {
    const item = this._currentItem ?? raiseError({
      code: 'UPD-301',
      message: 'No item in update complete queue to process',
      context: { where: 'CompleteQueue.processNext' },
      docsUrl: './docs/error-codes.md#upd',
    });
    let retValue = false;
    try {
      retValue = await item.completePromise; // 先につかむとは限らない
    } finally {
      this._queue.shift();
      item.notifyResolver.resolve(retValue);
      resolver.resolve();
    }
  }

  private async _processQueue() {
    if (this._processing) {
      return;
    }
    this._processing = true;
    try {
      while (this._queue.length > 0) {
        const resolver = Promise.withResolvers<void>();
        queueMicrotask(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this._processNext(resolver);
        });
        await resolver.promise;
      }
    } finally {
      this._processing = false;
    }
  }

  enqueue(updateComplete: UpdateComplete): void {
    this._queue.push({
      completePromise: updateComplete,
      notifyResolver: Promise.withResolvers<boolean>(),
    });
    if (!this._processing) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._processQueue();
    }
  }
}

export function createCompleteQueue(): IUpdateCompleteQueue {
  return new UpdateCompleteQueue();
}

// Export for testing purposes only
export { UpdateCompleteQueue as _UpdateCompleteQueue };