import { raiseError } from "../utils";
class UpdateActivityTracker {
    _version = 0;
    _processResolvers = [];
    _waitResolver = null;
    _renderMain;
    _processing = false;
    constructor(renderMain) {
        this._renderMain = renderMain;
    }
    createProcessResolver() {
        const resolver = Promise.withResolvers();
        this._processResolvers.push(resolver);
        if (this._waitResolver === null) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._main();
        }
        else {
            this._waitResolver.reject();
        }
        return resolver;
    }
    _getVersionUp() {
        this._version++;
        return this._version;
    }
    _nextWaitPromise() {
        const version = this._getVersionUp();
        this._waitResolver = Promise.withResolvers();
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
    async _main() {
        this._processing = true;
        try {
            let waitPromise = this._nextWaitPromise();
            while (waitPromise !== null) {
                try {
                    await waitPromise;
                    break;
                }
                catch (_e) {
                    waitPromise = this._nextWaitPromise();
                }
            }
        }
        finally {
            // 終了処理
            this._renderMain.terminate();
            this._processing = false;
            this._waitResolver = null;
            this._processResolvers = [];
        }
    }
    get isProcessing() {
        return this._processing;
    }
}
export function createUpdateActivityTracker(renderMain) {
    return new UpdateActivityTracker(renderMain);
}
