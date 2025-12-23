import { raiseError } from "../utils";
class UpdateActivityTracker {
    _version = 0;
    _processResolvers = [];
    _observedResolvers = [];
    _waitResolver = null;
    _mainResolver = null;
    _renderMain;
    constructor(renderMain) {
        this._renderMain = renderMain;
    }
    createProcessResolver() {
        const resolver = Promise.withResolvers();
        this._processResolvers.push(resolver);
        if (this._waitResolver === null) {
            if (this._mainResolver === null) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this._main();
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this._mainResolver.promise.then(() => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this._main();
                });
            }
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
    async _main() {
        if (this._mainResolver !== null) {
            return;
        }
        this._mainResolver = Promise.withResolvers();
        try {
            while (true) {
                const waitPromise = this._nextWaitPromise();
                try {
                    await waitPromise;
                    this._waitResolver = null;
                    if (this._processResolvers.length === 0 && this._observedResolvers.length === 0) {
                        this._renderMain.terminate();
                        break;
                    }
                }
                catch (_e) {
                    continue;
                }
            }
        }
        finally {
            // 終了処理
            if (this._mainResolver !== null) {
                this._mainResolver.resolve();
            }
            this._mainResolver = null;
        }
    }
    get isProcessing() {
        return this._mainResolver !== null;
    }
}
export function createUpdateActivityTracker(renderMain) {
    return new UpdateActivityTracker(renderMain);
}
// Export for testing purposes only
export { UpdateActivityTracker as _UpdateActivityTracker };
