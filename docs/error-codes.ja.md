# エラーコード体系（Draft v0.7）

Structive のエラーコードは「何が起き、どこで発生し、なぜ失敗し、どう直すのか」を素早く共有することを目的に、`接頭辞 (領域) + 3 桁番号` という書式に統一しています。

- 形式: `PREFIX-NNN`
- 例: `BIND-102 Node not found by nodePath`
- 番号は原則 3 桁。帯の目安は下表を参考にします。

## 番号帯（ガイド）

- 0xx: 初期化 / 設定 / Bootstrap の不備
- 1xx: 未登録・未検出・重複（template, node, component, route）
- 2xx: 無効な値 / フォーマット / 整合性エラー（引数, 構文, スキーマ）
- 3xx: 状態 / コンテキストの不一致（readonly 変更, loopContext null, 依存トラッキング崩れ）
- 4xx: ランタイム失敗（render, mount, unmount, apply など）
- 5xx: 非同期 / ロード失敗（ImportMap, SFC）
- 6xx: 環境・互換性・機能不足（ShadowRoot 非対応、jsdom 制限など）
- 8xx: 廃止予定・互換警告
- 9xx: 警告 / ソフトエラー（処理継続は可能）

## 接頭辞（領域）

- TMP: Template
  - 例: TMP-001 Template not found / TMP-102 SVG template conversion failed
- BIND: DataBinding / BindContent / BindingNode
  - 例: BIND-101 Data-bind not registered / BIND-201 BindContent not initialized yet
- COMP: Component / WebComponents 登録・定義
  - 例: COMP-301 Connected callback failed / COMP-401 Custom element tag name not found
- IMP: ImportMap（loadFromImportMap, lazy alias）
  - 例: IMP-201 Lazy component alias not found / IMP-202 Lazy component load failed
- PATH: PathManager / PathTree
  - 例: PATH-101 Path node not found
- LIST: ListIndex / ListDiff
  - 例: LIST-201 ListIndex not found / LIST-203 List indexes missing from cache entry
- STATE: StateClass / StateProperty / Ref
  - 例: STATE-202 Failed to parse state / STATE-301 Readonly property mutation
- STC: StateClass 内部（キャッシュ, getter, ループスコープ）
  - 例: STC-001 Missing state property / STC-002 Ref stack empty during getter
- CSO: ComponentStateOutput（子 ↔ 親 state の橋渡し）
  - 例: CSO-101 Child path not found / CSO-102 Child binding not registered
- FLT: Filter（built-in / custom）
  - 例: FLT-201 Filter not found / FLT-202 Filter argument invalid
- CSS: StyleSheet 登録
  - 例: CSS-001 Stylesheet not found
- UPD: Updater / Renderer
  - 例: UPD-001 Engine not initialized / UPD-006 ListDiff is null during renderItem

## メッセージ記述ガイドライン

- 1 行目は「対象 + 問題」を短く書く（末尾ピリオドなし）
  - 例: `Node not found by nodePath`
- 追加で付けられるメタ情報
  - `hint`: よくある原因や修正案（1〜2 個）
  - `context`: templateId / nodePath / bindText など最低限の手掛かり
  - `docsUrl`: 補足ドキュメントへのリンク
  - `cause`: 下位例外の要約（取得できる場合）

### 表記ルール（簡易）

- `is not found` より `not found` を使う（冗長な be 動詞を避ける）
  - OK: `Template not found: 123` / NG: `Template is not found: 123`
- 既定の形は「対象 + not found: 詳細」
  - 例: `ListIndex not found: items.*`
- null と undefined は区別して表現する
- 動詞は現在形かつ能動で簡潔に（例: `Cannot set …`, `Value must be …`）
- 初期化不足は `not initialized`（必要なら `yet` を付ける）
  - 例: `bindContent not initialized yet`

### 発生箇所（context.where）の扱い

- 関数 / クラス名は message 内に直接書かず `context.where` に入れる
  - OK: `message: "Node not found: 0,1"`, `context: { where: 'BindContent.createBindings', templateId, nodePath }`
  - NG: `message: "BindContent.createBindings: Node not found: 0,1"`
- message は 1 行・先頭大文字・語尾ピリオドなし
- 同じメッセージを複数箇所で使っても `context.where` で識別できる

## 代表コード（初期セット）

- TMP-001 Template not found
- TMP-102 Template conversion failed
- BIND-101 Data-bind not registered
- BIND-201 BindContent not initialized yet
- COMP-301 Connected callback failed
- COMP-401 Custom element tag name not found
- IMP-201 Lazy component alias not found
- PATH-101 PathNode not found
- LIST-201 ListIndex not found
- STATE-301 Readonly property mutation
- STC-001 State property missing / not an array
- CSO-101 Child path not found
- FLT-201 Filter not found
- CSS-001 Stylesheet not found
- UPD-003 Dependency path missing during collection

## 実装ガイド

- `StructiveError` 型（`code`, `message`, `context`, `hint`, `docsUrl`, `severity`, `cause`）を定義
- `raiseError({ code, message, context?, hint?, docsUrl?, cause?, severity? })` へ統一
- `config.debug === true` のとき `console.groupCollapsed` で context/hint/docs を展開
- まずは BindContent / BindingBuilder / Template / ImportMap / Component 登録周辺から適用を開始

---

以下、領域ごとの代表コードと使い方のメモです。

## TMP — Template（テンプレート関連）

テンプレート未登録・取得失敗・変換エラーなど。

### TMP-001 Template not found
- **Where**: `Template.registerTemplate|getTemplate`, ComponentEngine 初期化, `Template.resolve`
- **Condition**: 指定 `templateId` に対応するテンプレートが登録されていない
- **Message**: `Template not found: ${templateId}`
- **Context 例**: `{ where: 'Template.registerTemplate|getTemplate', templateId }`
- **Hint**: `registerTemplate` の呼び出し順や ID のスペル、ビルド時の取り込み漏れを確認

### TMP-101 Layout fetch failed
- **Where**: `MainWrapper.loadLayout`
- **Condition**: `layoutPath` の取得が 2xx 以外で失敗
- **Message**: `Failed to load layout from ${layoutPath}`
- **Context 例**: `{ where: 'MainWrapper.loadLayout', layoutPath }`
- **Hint**: `config.layoutPath` が到達可能な HTML を指しているか、サーバーが 2xx を返すか確認

### TMP-102 Template conversion failed / invalid Mustache structure
- **Where**: SVG→DOM 変換 (`registerHtml`, `replaceTemplateTagWithComment`), Mustache 前処理 (`Template.replaceMustacheWithTemplateTag`)
- **Condition**:
  - 無効な SVG / ルート欠落で DOM 化できない
  - Mustache 制御構造（if/for/elseif/else）が未対応の並び（`endif` の前に `if` が無い等）
- **Messages**:
  - `SVG template conversion failed`
  - `Endif without if`
  - `Endfor without for`
  - `Elseif without if`
  - `Else without if`
- **Context 例**: `{ where: 'Template.registerHtml', templateId }`, `{ where: 'Template.replaceMustacheWithTemplateTag', expr, stackDepth }`
- **Hint**: SVG 断片は単一ルートにそろえ、Mustache 構文の対応関係を事前に検証

## BIND — DataBinding / BindContent / BindingNode

### BIND-101 Data-bind not registered
- **Where**: `BindingBuilder.registerDataBindAttributes`, `ComponentEngine.setup`
- **Condition**: data-bind で参照した名前が登録されていない
- **Message**: `Data-bind not registered: ${bindName}`
- **Context 例**: `{ where: 'registerDataBindAttributes', bindName, nodePath }`
- **Hint**: 登録忘れ・スペルミス・命名不一致を確認

### BIND-102 Node not found by nodePath
- **Where**: `BindContent.createBindings`, `replaceTextNodeFromComment`, `getAbsoluteNodePath`
- **Condition**: 保存済み nodePath が DOM 上で解決できない
- **Message**: `Node not found by nodePath: ${nodePath}`
- **Context 例**: `{ where: 'BindContent.createBindings', templateId, nodePath }`
- **Hint**: 登録後にテンプレート構造を壊していないか、nodePath の書き込み順序を見直す

### BIND-103 Creator not found for bindText
- **Where**: `BindingBuilder.getBindingNodeCreator`, `parseBindText`
- **Condition**: 解析済み bindText に対応する BindingNode creator が存在しない
- **Message**: `Creator not found for bindText: ${bindText}`
- **Context 例**: `{ where: 'getBindingNodeCreator', bindText }`
- **Hint**: 対応ノードが export / register 済みかチェック

### BIND-104 Child bindContent not found
- **Where**: `BindContent.getLastNode`
- **Condition**: ネストした BindContent を遡る過程で子 BindContent が見つからない
- **Message**: `Child bindContent not found`
- **Context 例**: `{ where: 'BindContent.getLastNode', templateId }`
- **Hint**: 親子配列の整合を保ち、`getLastNode` 実行中に子を除去しない

### BIND-201 BindContent not initialized / Block parent node not set
- **Where**: `ComponentEngine.bindContent` getter, `ComponentEngine.connectedCallback` (block モード), `StateClass.getAll`
- **Condition**: `setup` 前なのに bindContent にアクセス、`_blockParentNode` が未設定、`getAll` で wildcard 情報が欠落
- **Messages**:
  - `BindContent not initialized yet`
  - `Block parent node not set`
  - `Wildcard info is missing`
- **Context 例**: `{ where: 'ComponentEngine.bindContent.get', componentId }`, `{ where: 'ComponentEngine.connectedCallback', mode: 'block' }`, `{ where: 'StateClass.getAll', pattern, wildcardIndex }`
- **Hint**: `setup` 順序を守り、Block/Inline 親を解決した状態でアクセスする。`getAll` では wildcard メタを破棄しない

### BIND-301 Binding method not implemented
- **Where**: `BindingNode.assignValue`, `BindingNode.updateElements`, `BindingStateIndex.pattern|info|assignValue`
- **Condition**: 派生クラスが必要メソッドを未オーバーライド or Readonly なのに代入を試みた
- **Messages**:
  - `Binding assignValue not implemented`
  - `Binding updateElements not implemented`
  - `Binding pattern not implemented`
  - `Binding info not implemented`
- **Context 例**: `{ where: 'BindingNode.assignValue', name }`
- **Hint**: 派生クラスで実装を提供するか、`$1` など Readonly Bindings に書き込みを行わない

### BIND-202 Invalid binding input / rejected handler
- **Where**: `BindingNodeEvent.handler`, `BindingNodeFor.setPoolLength`, `BindingStateIndex.constructor`
- **Condition**:
  - 非同期イベントハンドラが reject し、エラーを構造化して表面化させたい
  - BindContent プール長に負の値が渡された
  - ループインデックス（`$x`）が数値に変換できない
- **Messages**:
  - `Event handler rejected`
  - `BindContent pool length is negative`
  - `Pattern is not a number`
- **Context 例**: `{ where: 'BindingNodeEvent.handler', bindName, eventName }`, `{ where: 'BindingNodeFor.setPoolLength', bindName, requestedLength }`, `{ where: 'BindingStateIndex.constructor', pattern }`
- **Hint**: 非同期ハンドラ内で例外処理を行い、プール操作は 0 以上を保証、ループインデックスは `$1` のように数値で定義

### BIND-105 Node type not supported
- **Where**: `BindingBuilder.getNodeType`
- **Condition**: Binding がサポートしないノード種別（コメント以外の Text 等）
- **Message**: `Node type not supported: ${nodeType}`
- **Context 例**: `{ where: 'BindingBuilder.getNodeType', nodeType, nodeName, nodeConstructor }`
- **Hint**: HTML/SVG/Structive コメント以外をテンプレートに含めない

### BIND-106 Comment binding property not supported
- **Where**: `BindingBuilder.getBindingNodeCreator`
- **Condition**: コメントバインドで `if` / `for` 以外のプロパティを参照
- **Message**: `Comment binding property not supported: ${propertyName}`
- **Context 例**: `{ where: 'BindingBuilder.getBindingNodeCreator', propertyName, nodeType: 'Comment' }`
- **Hint**: コメントバインドは `if` / `for` のみ。その他はエレメント側の binding を使う

## FLT — Filter

### FLT-201 Filter not found
- **Where**: `createFilters.textToFilter`, `builtinFilterFn`
- **Condition**: フィルタ名が登録済みリストに存在しない
- **Message**: `Filter not found: ${name}`
- **Context 例**: `{ where: 'createFilters.textToFilter', name }`
- **Hint**: Input/Output いずれかのレジストリへ登録してから使用する

### FLT-202 Filter options or value invalid
- **Where**: `Filter.optionsRequired`, `Filter.optionMustBeNumber`, `Filter.valueMustBeNumber` など
- **Condition**:
  - オプション必須なのに指定が無い
  - 数値オプションなのに文字列などが渡された
  - 対象値が想定型（number/string/boolean/date）と一致しない
- **Messages**:
  - `${fnName} requires at least one option`
  - `${fnName} requires a number as option`
  - `${fnName} requires a number value`
  - `${fnName} requires a string value`
  - `${fnName} requires a boolean value`
  - `${fnName} requires a date value`
- **Context 例**: `{ where: 'Filter.valueMustBeNumber', fnName }`
- **Hint**: 各フィルタに合わせたオプション/値を渡す。事前に型ガードを書くことも検討

## COMP — Component / WebComponents

### COMP-301 Connected callback failed
- **Where**: `ComponentEngine.connectedCallback`
- **Condition**: StateClass の `ConnectedCallbackSymbol` が throw / reject
- **Message**: `Connected callback failed`
- **Context 例**: `{ where: 'ComponentEngine.connectedCallback' }`
- **Hint**: state 側の `connectedCallback` 実装を確認し、非同期例外を捕捉

### COMP-302 Disconnected callback failed
- **Where**: `ComponentEngine.disconnectedCallback`
- **Condition**: StateClass の `DisconnectedCallbackSymbol` が teardown 中に失敗
- **Message**: `Disconnected callback failed`
- **Context 例**: `{ where: 'ComponentEngine.disconnectedCallback' }`
- **Hint**: cleanup 内で例外を握り潰し、エンジンの後処理を完遂させる

### COMP-401 Custom element tag name not found
- **Where**: `BindingNodeComponent.constructor`, `WebComponents.getCustomTagName`
- **Condition**: `tagName` と `is` 属性の両方にハイフンが無く、カスタム要素と認識できない
- **Message**: `Custom element tag name not found`
- **Context 例**: `{ where: 'BindingNodeComponent.constructor' }`, `{ where: 'WebComponents.getCustomTagName', tagName, isAttribute }`
- **Hint**: ハイフンを含むタグ名、もしくは `is` 属性に既存カスタム要素名をセットしてから参照する

### COMP-402 Custom element definition failed
- **Where**: `BindingNodeComponent._notifyRedraw`, `BindingNodeComponent.activate`
- **Condition**: `customElements.whenDefined(tagName)` が reject（子コンポーネントが定義されなかった）
- **Message**: `Custom element definition failed: ${tagName}`
- **Context 例**: `{ where: 'BindingNodeComponent.activate', tagName }`
- **Hint**: 子コンポーネントを事前に `customElements.define` し、`cause` を追跡

## UPD — Updater / Renderer

### UPD-001 Engine not initialized
- **Where**: `Renderer.engine`
- **Condition**: Renderer がエンジン参照を保持していない
- **Message**: `Engine not initialized`
- **Context 例**: `{ where: 'Renderer.engine' }`
- **Hint**: Renderer を生成する際に IComponentEngine を必ず渡す

### UPD-002 Readonly state handler not initialized
- **Where**: `Renderer.readonlyState`, `Renderer.readonlyHandler`
- **Condition**: `render()` / `createReadonlyState` 以外のスコープで readonly ビューに触れた
- **Messages**: `ReadonlyState not initialized`, `ReadonlyHandler not initialized`
- **Context 例**: `{ where: 'Updater.Renderer.readonlyState' }`, `{ where: 'Updater.Renderer.readonlyHandler' }`
- **Hint**: `createReadonlyState` / `render` で渡すコールバック内部に処理を限定

### UPD-003 Dependency path missing during collection
- **Where**: `Updater.collectMaybeUpdates`
- **Condition**: 依存トラッキング対象のパスが PathTree に無い
- **Message**: `Path node not found for pattern: ${path}`
- **Context 例**: `{ where: 'Updater.collectMaybeUpdates', path }`
- **Hint**: すべての binding パターンを事前に PathTree へ登録

### UPD-004 Parent ref missing / dependent path missing
- **Where**: `Renderer.render`, `Updater.recursiveCollectMaybeUpdates`
- **Condition**:
  - A: list 要素 ref が `parentRef` を持たない
  - B: 動的依存パスが PathTree に存在しない
- **Messages**: `ParentInfo is null for ref: ${ref.key}`, `Path node not found for pattern: ${depPath}`
- **Context 例**: `{ where: 'Updater.Renderer.render', refKey, pattern }`, `{ where: 'Updater.recursiveCollectMaybeUpdates', depPath }`
- **Hint**: list 要素は親参照を保持し、動的依存パターンも事前登録する

### UPD-005 Async updated callback failed
- **Where**: `Updater.update`（updated callback の microtask）
- **Condition**: updated callback が返す Promise が reject
- **Message**: `An error occurred during asynchronous state update.`
- **Context 例**: `{ where: 'Updater.update.updatedCallback' }`
- **Hint**: updated callback 内で try/catch し、Promise を解決済みにする

## PATH — PathManager / PathTree

### PATH-101 PathNode not found
- **Where**: `Renderer.reorderList`, `Renderer.render`, 動的依存収集
- **Condition**: `findPathNodeByPath` で対象パターンの PathNode が見つからない
- **Message**: `PathNode not found: ${pattern}`
- **Context 例**: `{ pattern }`
- **Hint**: 親ワイルドカードを先に登録し、PathTree を完全に構築する

## LIST — ListIndex / ListDiff

### LIST-201 ListIndex not found
- **Where**: `ComponentStateInput.notifyRedraw`, `Renderer.reorderList`, `LoopContext.listIndex`, `StateClass.getAll`, `StatePropertyRef.listIndex`
- **Condition**: ワイルドカード位置の参照に必要な ListIndex 情報が欠落
- **Messages**: `ListIndex not found for parent ref: ${parentPattern}`, `listIndex is required`, `ListIndex not found: ${pattern}`, `listIndex is null`
- **Context 例**: `{ where: 'ComponentStateInput.notifyRedraw', parentPattern, childPattern }`, `{ where: 'LoopContext.listIndex', path }`, `{ where: 'StateClass.getAll', pattern, index }`, `{ where: 'StatePropertyRef.get listIndex', sid, key }`
- **Hint**: `saveListAndListIndexes` を適切に呼び、LoopContext / StatePropertyRef が ListIndex を保持し続けるようにする

### LIST-202 List cache entry not found
- **Where**: `StateClass.getListIndexesByRef`
- **Condition**: `getByRef` で直前に取得していないためキャッシュにリスト情報が無い
- **Message**: `List cache entry not found: ${pattern}`
- **Context 例**: `{ where: 'StateClass.getListIndexesByRef', pattern }`
- **Hint**: インデックス取得前に `getByRef` を呼び、対象パスをリストとして登録しておく

### LIST-203 List indexes missing from cache entry
- **Where**: `StateClass.getListIndexesByRef`
- **Condition**: キャッシュ項目はあるが `listIndexes` が null
- **Message**: `List indexes not found in cache entry: ${pattern}`
- **Context 例**: `{ where: 'StateClass.getListIndexesByRef', pattern }`
- **Hint**: リストを返す getter が必ず配列を返しているか確認し、キャッシュ構築時に `listIndexes` を保存

## CSS — StyleSheet

### CSS-001 Stylesheet not found
- **Where**: `StyleSheet.getStyleSheetById`
- **Condition**: 指定 ID のスタイルシートがグローバル登録されていない
- **Message**: `Stylesheet not found: ${id}`
- **Context 例**: `{ where: 'StyleSheet.getStyleSheetById', styleSheetId: id }`
- **Hint**: 事前に `registerStyleSheet(id, sheet)` を実行し、ID の整合性を保つ

## STATE — StateClass / StateProperty / Ref

代表的なもの:

- `STATE-202 Failed to parse state from dataset`
  - Context: `{ where: 'ComponentEngine.connectedCallback', datasetState }`
- `STATE-202 Cannot set property ${prop} of readonly state`
  - Context: `{ where: 'createReadonlyStateProxy.set', prop }`
- `STATE-202 propRef.stateProp.parentInfo is undefined`
  - Context: `{ where: 'getByRefReadonly|getByRefWritable|setByRef', refPath }`
- `STATE-202 lastWildcardPath is null / wildcardParentPattern is null / wildcardIndex is null`
  - Context: `{ where: 'getListIndex', pattern, index }`
- `STATE-202 ref is null`
  - Context: `{ where: 'LoopContext.ref', path }`
- `STATE-202 Invalid path / segment name`
  - Context: `{ where: 'StateProperty.createAccessorFunctions', pattern, segment }`
- `STATE-202 Pattern is reserved word`
  - Context: `{ where: 'StateProperty.getStructuredPathInfo', structuredPath }`

### STATE-204 ComponentStateInput property not supported
- **Where**: `ComponentStateInput.get`, `ComponentStateInput.set`
- **Condition**: ComponentStateInput がマッピングしていないプロパティへアクセス
- **Message**: `ComponentStateInput property not supported: ${prop}`
- **Context 例**: `{ where: 'ComponentStateInput.get', prop }`
- **Hint**: 宣言済みパスか専用シンボル（`AssignStateSymbol`, `NotifyRedrawSymbol`）のみ使用

### STATE-302 ComponentStateBinding path resolution failed
- **Where**: `ComponentStateBinding.toParentPathFromChildPath`, `.toChildPathFromParentPath`
- **Condition**: 親⇔子のパス対応が登録されていないか、取得できない
- **Messages**: `No parent path found for child path "${childPath}"`, `No child path found for parent path "${parentPath}"`
- **Context 例**: `{ where: 'ComponentStateBinding.toParentPathFromChildPath', childPath }`, `{ where: 'ComponentStateBinding.toChildPathFromParentPath', parentPath }`
- **Hint**: 親コンポーネント側で全 child path を登録し、両者とも同じドット記法を使用

### STATE-303 ComponentStateBinding mapping conflict
- **Where**: `ComponentStateBinding.addBinding`
- **Condition**: 既に紐付いた parentPath / childPath に再登録しようとした
- **Messages**: `Parent path "${parentPath}" already has a child path`, `Child path "${childPath}" already has a parent path`
- **Context 例**: `{ where: 'ComponentStateBinding.addBinding', parentPath, existingChildPath }`, `{ where: 'ComponentStateBinding.addBinding', childPath, existingParentPath }`
- **Hint**: 1:1 マッピングを守り、既存の関連付けは解除してから登録

## STC — StateClass internals

### STC-001 State property missing / not an array
- **Where**: `StateClass.getByRef`
- **Condition**: state オブジェクトにプロパティが無い、もしくはリスト管理対象なのに配列でない
- **Messages**: `Property "${pattern}" does not exist in state.`, `Property "${pattern}" is expected to be an array for list management.`
- **Context 例**: `{ where: 'StateClass.getByRef', pattern }`
- **Hint**: state 形状を登録済みパターンとそろえ、リスト用途は配列を返す

### STC-002 Ref stack empty during getter
- **Where**: `StateClass.getByRef`
- **Condition**: getter 経由のアクセスで `handler.refStack` が空のため依存登録できない
- **Message**: `handler.refStack is empty in getByRef`
- **Context 例**: `{ where: 'StateClass.getByRef', pattern }`
- **Hint**: StateClass プロキシ経由で getter を呼び、`setLoopContext` などで refStack をセットしてから参照

## CSO — ComponentStateOutput

子コンポーネントの state 読み書きを ComponentStateBinding 経由で親へ橋渡しする仕組み。

### CSO-101 Child path not found
- **Where**: `ComponentStateOutput.get`, `.set`, `.getListIndexes`
- **Condition**: 子パスが登録済み ComponentStateBinding に存在しない
- **Message**: `Child path not found: ${path}`
- **Context 例**: `{ where: 'ComponentStateOutput.get', path }`
- **Hint**: 子コンポーネントが公開する state path をすべてバインディングに登録

### CSO-102 Child binding not registered
- **Where**: `ComponentStateOutput.get`, `.set`, `.getListIndexes`
- **Condition**: 子パターンは一致したが `bindingByChildPath` で参照できなかった（欠落 or stale）
- **Message**: `Child binding not registered: ${childPath}`
- **Context 例**: `{ where: 'ComponentStateOutput.set', childPath }`
- **Hint**: ComponentStateBinding の登録とライフサイクルを同期させ、マップを書き換えない

## IMP — ImportMap / Lazy Load

### IMP-201 Lazy component alias not found
- **Where**: `WebComponents.loadFromImportMap.loadLazyLoadComponent`
- **Condition**: `#lazy` 付きタグのロード要求で、 alias が登録済みでない / 既に消費済み
- **Message**: `Alias not found for tagName: ${tagName}`
- **Context 例**: `{ where: 'WebComponents.loadFromImportMap.loadLazyLoadComponent', tagName }`
- **Hint**: importmap に `#lazy` 付きで登録し、`loadLazyLoadComponent` は 1 度だけ呼ぶ

### IMP-202 Lazy component load failed
- **Where**: `WebComponents.loadFromImportMap.loadLazyLoadComponent`
- **Condition**: `loadSingleFileComponent` が reject（ネットワーク失敗、SFC 解析失敗など）
- **Message**: `Failed to load lazy component for tagName: ${tagName}`
- **Context 例**: `{ where: 'WebComponents.loadFromImportMap.loadLazyLoadComponent', tagName, alias }`
- **Hint**: alias の解決可否を確認し、SFC がビルド可能か・`cause` の内容を追跡

## FLT — Filter

未登録フィルタ、型不一致、オプション不足などを捕捉します（詳細は前述の FLT セクション参照）。

---

必要に応じて今後もコードを追加し、`docs/error-codes.md`（英語版）と差分が出た際は本ファイルを更新してください。
