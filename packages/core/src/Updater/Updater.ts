import { IComponentEngine, IVersionRevision } from "../ComponentEngine/types";
import { ILoopContext } from "../LoopContext/types";
import { findPathNodeByPath } from "../PathTree/PathNode";
import { IPathNode } from "../PathTree/types";
import { createReadonlyStateHandler, createReadonlyStateProxy } from "../StateClass/createReadonlyStateProxy";
import { UpdatedCallbackSymbol } from "../StateClass/symbols";
import { IReadonlyStateHandler, IReadonlyStateProxy, IWritableStateHandler, IWritableStateProxy } from "../StateClass/types";
import { useWritableStateProxy } from "../StateClass/useWritableStateProxy";
import { IStatePropertyRef } from "../StatePropertyRef/types";
import { raiseError } from "../utils";
import { createRenderer, render } from "./Renderer";
import { IListInfo, IRenderer, IUpdater, ReadonlyStateCallback, UpdateCallback } from "./types";


/**
 * Updaterクラスは、状態管理と更新の中心的な役割を果たします。
 * 状態更新が必要な場合に、都度インスタンスを作成して使用します。
 * 主な機能は以下の通りです:
 */
class Updater implements IUpdater {
  queue: IStatePropertyRef[] = [];
  #rendering: boolean = false;
  #engine: IComponentEngine;

  #version: number;
  #revision: number = 0;
  #swapInfoByRef: Map<IStatePropertyRef, IListInfo> = new Map();
  #saveQueue: IStatePropertyRef[] = [];

  constructor(engine: IComponentEngine) {
    this.#engine = engine;
    this.#version = engine.versionUp();
  }

  get version(): number {
    return this.#version;
  }

  get revision(): number {
    return this.#revision;
  }

  get swapInfoByRef(): Map<IStatePropertyRef, IListInfo> {
    return this.#swapInfoByRef;
  }

  /**
   * 更新したRefをキューに追加し、レンダリングをスケジュールする
   * @param ref 
   * @returns 
   */
  enqueueRef(ref: IStatePropertyRef): void {
    this.#revision++;
    this.queue.push(ref);
    this.#saveQueue.push(ref);
    this.collectMaybeUpdates(this.#engine, ref.info.pattern, this.#engine.versionRevisionByPath, this.#revision);
    // レンダリング中はスキップ
    if (this.#rendering) return;
    this.#rendering = true;
    queueMicrotask(() => {
      // 非同期処理で中断するか、更新処理が完了した後にレンダリングを実行
      this.rendering();
    });
  }

  /**
   * 状態更新処理開始
   * @param loopContext 
   * @param callback 
   */
  update<R>(
    loopContext: ILoopContext | null, 
    callback: (state: IWritableStateProxy, handler: IWritableStateHandler) => R
  ): R {
    let resultPromise: R;
    resultPromise = useWritableStateProxy<R>(this.#engine, this, this.#engine.state, loopContext, (state:IWritableStateProxy, handler:IWritableStateHandler): R => {
      // 状態更新処理
      return callback(state, handler);
    });
    const updatedCallbackHandler = () =>{
      if (this.#engine.pathManager.hasUpdatedCallback && this.#saveQueue.length > 0) {
        const saveQueue = this.#saveQueue;
        this.#saveQueue = [];
        queueMicrotask(() => {
          this.update<void>(null, (state, handler) => {
            state[UpdatedCallbackSymbol](saveQueue);
          });
        });
      }
    };
    if (resultPromise instanceof Promise) {
      resultPromise.finally(() => {
        updatedCallbackHandler();
      });
    } else {
      updatedCallbackHandler();
    }
    return resultPromise;
 }

  /**
   * レンダリング処理
   */
  rendering(): void {
    try {
      while( this.queue.length > 0 ) {
        // キュー取得
        const queue = this.queue;
        this.queue = [];
        // レンダリング実行
        render(queue, this.#engine, this);
      }
    } finally {
      this.#rendering = false;
    }
  }

  initialRender(callback: (renderer: IRenderer) => void): void {
    const renderer = createRenderer(this.#engine, this);
    callback(renderer);
  }
  /**
   * 更新したパスに対して影響があるパスを再帰的に収集する
   * @param engine 
   * @param path 
   * @param node 
   * @param revisionByUpdatedPath 
   * @param revision 
   * @param visitedInfo 
   * @returns 
   */
  recursiveCollectMaybeUpdates(
    engine: IComponentEngine,
    path: string,
    node: IPathNode,
    visitedInfo: Set<string>,
    isSource: boolean
  ): void {
    if (visitedInfo.has(path)) return;
    // swapの場合スキップしたい
    if (isSource && engine.pathManager.elements.has(path)) {
      return;
    }
    visitedInfo.add(path);

    for(const [name, childNode] of node.childNodeByName.entries()) {
      const childPath = childNode.currentPath;
      this.recursiveCollectMaybeUpdates(engine, childPath, childNode, visitedInfo, false);
    }

    const deps = engine.pathManager.dynamicDependencies.get(path) ?? [];
    for(const depPath of deps) {
      const depNode = findPathNodeByPath(engine.pathManager.rootNode, depPath);
      if (depNode === null) {
        raiseError({
          code: "UPD-004",
          message: `Path node not found for pattern: ${depPath}`,
          docsUrl: "./docs/error-codes.md#upd",
        });
      }
      this.recursiveCollectMaybeUpdates(engine, depPath, depNode, visitedInfo, false);
    }
  }

  #cacheUpdatedPathsByPath: Map<string, Set<string>> = new Map();
  collectMaybeUpdates(engine: IComponentEngine, path: string, versionRevisionByPath: Map<string, IVersionRevision>, revision: number): void {
    const node = findPathNodeByPath(engine.pathManager.rootNode, path);
    if (node === null) {
      raiseError({
        code: "UPD-003",
        message: `Path node not found for pattern: ${path}`,
        docsUrl: "./docs/error-codes.md#upd",
      });
    }

    // キャッシュ
    let updatedPaths = this.#cacheUpdatedPathsByPath.get(path);
    if (typeof updatedPaths === "undefined") {
      updatedPaths = new Set<string>();
      this.recursiveCollectMaybeUpdates(engine, path, node, updatedPaths, true);
    }
    const versionRevision = {
      version: this.version,
      revision: revision,
    } 
    for(const updatedPath of updatedPaths) {
      versionRevisionByPath.set(updatedPath, versionRevision);
    }
    this.#cacheUpdatedPathsByPath.set(path, updatedPaths);
  }

  /**
   * リードオンリーな状態を生成し、コールバックに渡す
   * @param callback 
   * @returns 
   */
  createReadonlyState<R>(
    callback: (state: IReadonlyStateProxy, handler: IReadonlyStateHandler) => R
  ): R {
    const handler = createReadonlyStateHandler(this.#engine, this, null);
    const stateProxy = createReadonlyStateProxy(this.#engine.state, handler);
    return callback(stateProxy, handler);
  }
}

/**
 * Updaterを生成しコールバックに渡す
 * スコープを明確にするための関数
 * @param engine 
 * @param callback 
 */
export function createUpdater<R>(
  engine: IComponentEngine, 
  callback: (updater: IUpdater) => R
): R {
  const updater = new Updater(engine);
  return callback(updater);
}