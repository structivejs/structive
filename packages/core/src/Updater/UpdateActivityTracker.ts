import { raiseError } from "../utils";
import { IRenderMain, IUpdateActivityTracker } from "./types";

class UpdateActivityTracker implements IUpdateActivityTracker  {
  private _version: number = 0;
  private _processResolvers: PromiseWithResolvers<void>[] = [];
  private _observedResolvers: PromiseWithResolvers<void>[] = [];
  private _waitResolver: PromiseWithResolvers<void> | null = null;
  private _mainResolver: PromiseWithResolvers<void> | null = null;
  private _renderMain: IRenderMain;
  constructor(renderMain: IRenderMain) {
    this._renderMain = renderMain;
  }

  createProcessResolver(): PromiseWithResolvers<void> {
    const resolver = Promise.withResolvers<void>();
    this._processResolvers.push(resolver);
    if (this._waitResolver === null) {
      if (this._mainResolver === null) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._main();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._mainResolver.promise.then(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this._main();
        });
      }
    } else {
      this._waitResolver.reject();
    }
    return resolver;
  }

  private _getVersionUp(): number {
    this._version++;
    return this._version;
  }

  private _nextWaitPromise(): Promise<void> {
    const version = this._getVersionUp();
    this._waitResolver = Promise.withResolvers<void>();
    this._observedResolvers = this._observedResolvers.concat(...this._processResolvers);
    this._processResolvers = [];
    const observedResolvers = [...this._observedResolvers];
    const observedPromises = this._observedResolvers.map(c => c.promise);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.allSettled(observedPromises).then(() => {
      if (this._version !== version) {
        this._observedResolvers = this._observedResolvers.filter(r => !observedResolvers.includes(r));
        return;
      }
      if (this._waitResolver === null) {
        raiseError({
          code: 'UPD-007',
          message: 'UpdateActivityTracker waitResolver is null.',
          context: { where: 'UpdateActivityTracker.nextWaitPromise' },
          docsUrl: "./docs/error-codes.md#upd",
        });
      }
      this._observedResolvers = [];
      this._waitResolver.resolve();
    });
    return this._waitResolver.promise;
  }

  private async _main() {
    if (this._mainResolver !== null) {
      return;
    }
    this._mainResolver = Promise.withResolvers<void>();
    try {
      while(true) {
        const waitPromise = this._nextWaitPromise();
        try {
          await waitPromise;
          this._waitResolver = null;
          if (this._processResolvers.length === 0 && this._observedResolvers.length === 0) {
            this._renderMain.terminate();
            break;
          }
        } catch(_e) {
          continue;
        }
      }
    } finally {
      // 終了処理
      if (this._mainResolver !== null) {
        this._mainResolver.resolve();
      }
      this._mainResolver = null;
    }
  }

  get isProcessing(): boolean {
    return this._mainResolver !== null;
  }
}

export function createUpdateActivityTracker(renderMain: IRenderMain): IUpdateActivityTracker {
  return new UpdateActivityTracker(renderMain);
}
