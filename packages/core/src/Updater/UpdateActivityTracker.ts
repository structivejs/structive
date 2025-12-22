import { raiseError } from "../utils";
import { IRenderMain, IUpdateActivityTracker } from "./types";

class UpdateActivityTracker implements IUpdateActivityTracker  {
  private _version: number = 0;
  private _processResolvers: PromiseWithResolvers<void>[] = [];
  private _waitResolver: PromiseWithResolvers<void> | null = null;
  private _renderMain: IRenderMain;
  private _processing: boolean = false;
  constructor(renderMain: IRenderMain) {
    this._renderMain = renderMain;
  }

  createProcessResolver(): PromiseWithResolvers<void> {
    const resolver = Promise.withResolvers<void>();
    this._processResolvers.push(resolver);
    if (this._waitResolver === null) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._main();
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
    const processPromises = this._processResolvers.map(c => c.promise);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(processPromises).then(() => {
      if (this._version !== version) {
        return;
      }
      if (this._waitResolver === null) {
        raiseError({
          code: 'UPD-007',
          message: 'UpdaterObserver waitResolver is null.',
          context: { where: 'UpdaterObserver.nextWaitPromise' },
          docsUrl: "./docs/error-codes.md#upd",
        });
      }
      this._waitResolver.resolve();
    });
    return this._waitResolver.promise;
  }

  private async _main() {
    this._processing = true;
    try {
      let waitPromise = this._nextWaitPromise();
      while(waitPromise !== null) {
        try {
          await waitPromise;
          break;
        } catch(_e) {
          waitPromise = this._nextWaitPromise();
        }
      }
    } finally {
      // 終了処理
      this._renderMain.terminate();
      this._processing = false;
      this._waitResolver = null;
      this._processResolvers = [];
    }
  }

  get isProcessing(): boolean {
    return this._processing;
  }
}

export function createUpdateActivityTracker(renderMain: IRenderMain): IUpdateActivityTracker {
  return new UpdateActivityTracker(renderMain);
}
