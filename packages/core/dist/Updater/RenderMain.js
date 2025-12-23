import { render } from "./Renderer";
class RenderMain {
    _engine;
    _updater;
    _waitResolver = Promise.withResolvers();
    _completedResolvers;
    constructor(engine, updater, completedResolvers) {
        this._engine = engine;
        this._updater = updater;
        this._completedResolvers = completedResolvers;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._main();
    }
    async _main() {
        const renderPromises = [];
        let termResolver = null;
        let result = true;
        while (termResolver === null) {
            termResolver = await this._waitResolver.promise ?? null;
            // Retrieve current queue and reset for new items
            const queue = this._updater.retrieveAndClearQueue();
            if (queue.length === 0) {
                continue;
            }
            // Execute rendering for all refs in this batch
            const resolver = Promise.withResolvers();
            renderPromises.push(resolver.promise);
            try {
                // Render the queued refs
                render(queue, this._engine, this._updater, resolver);
            }
            catch (e) {
                console.error("Rendering error:", e);
                resolver.reject();
            }
        }
        try {
            await Promise.all(renderPromises);
        }
        catch (_e) {
            result = false;
        }
        finally {
            termResolver.resolve(result);
        }
    }
    wakeup() {
        this._waitResolver.resolve();
        this._waitResolver = Promise.withResolvers();
    }
    terminate() {
        this._waitResolver.resolve(this._completedResolvers);
    }
}
export function createRenderMain(engine, updater, completedResolvers) {
    return new RenderMain(engine, updater, completedResolvers);
}
