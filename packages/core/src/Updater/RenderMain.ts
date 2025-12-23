import { IComponentEngine } from "../ComponentEngine/types";
import { render } from "./Renderer";
import { IRenderMain, IUpdater } from "./types";

class RenderMain implements IRenderMain {
  private _engine: IComponentEngine;
  private _updater: IUpdater;
  private _waitResolver: PromiseWithResolvers<PromiseWithResolvers<boolean> | void> = 
    Promise.withResolvers<PromiseWithResolvers<boolean> | void>();
  private _completedResolvers: PromiseWithResolvers<boolean>;

  constructor(
    engine: IComponentEngine,
    updater: IUpdater,
    completedResolvers: PromiseWithResolvers<boolean>,
  ) {
    this._engine = engine;
    this._updater = updater;
    this._completedResolvers = completedResolvers;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this._main();
  }

  private async _main() {
    const renderPromises: Promise<void>[] = [];
    let termResolver: PromiseWithResolvers<boolean> | null = null;
    let result: boolean = true;
    while(termResolver === null) {
      termResolver = await this._waitResolver.promise ?? null;
      // Retrieve current queue and reset for new items
      const queue = this._updater.retrieveAndClearQueue();
      if (queue.length === 0) {
        continue;
      }

      // Execute rendering for all refs in this batch
      const resolver = Promise.withResolvers<void>();
      renderPromises.push(resolver.promise);
      try {
        // Render the queued refs
        render(queue, this._engine, this._updater, resolver);
      } catch (e) {
        console.error("Rendering error:", e);
        resolver.reject();
      }
    }
    try {
      await Promise.all(renderPromises);
    } catch(_e) {
      result = false;
    } finally {
      termResolver.resolve(result);
    }
  }

  wakeup() {
    this._waitResolver.resolve();
    this._waitResolver = Promise.withResolvers<PromiseWithResolvers<boolean> | void>();
  }

  terminate() {
    this._waitResolver.resolve(this._completedResolvers);
  }
}

export function createRenderMain(
  engine: IComponentEngine,
  updater: IUpdater,
  completedResolvers: PromiseWithResolvers<boolean>,
): IRenderMain {
  return new RenderMain(engine, updater, completedResolvers);
}