# Getting Started (CDN + EasyLoader)

バンドラや npm セットアップを行わずに Structive を試したい場合は、CDN からコアと EasyLoader を読み込むのが最も手軽です。EasyLoader は以下を自動化します。

- Structive コア（`structive.esm.js` または minified 版）のロード
- グローバル設定 (`config`) のプリセット
- Import Map をウォッチして SFC を自動登録（`config.autoLoadFromImportMap = true`）

ここでは CDN（jsDelivr）と EasyLoader `components.js` を使った最小構成を紹介します。

## 前提条件
- モダンブラウザ（Web Components / ES Modules 対応）
- 任意の静的ホスティング（`index.html` と `.sfc.html` を配信できれば OK）
- SFC をホスティングできるパス（例: `/components/hello.sfc.html`）

### VS Code Live Server を推奨
最も手軽な実行方法として、VS Code 拡張機能 **Live Server** の利用を推奨します。

1. VS Code の拡張タブで "Live Server" をインストール
2. プロジェクトルート（`my-structive-app/`）を VS Code で開く
3. `index.html` を開いて、エディター右下の **Go Live** をクリック
4. 自動で起動するローカルサーバー（通常 `http://127.0.0.1:5500`）にアクセス

SFC も同じルートから配信されるため、Import Map のパスはこのドキュメントの例のまま動作します。

## 1. プロジェクトの構成
```
my-structive-app/
├─ components/
│  └─ hello.sfc.html
└─ index.html
```

`components/hello.sfc.html`
```html
<template>
  <section>
    <h1>Hello {{name}}!</h1>
    <button data-bind="onclick:toggle">Toggle</button>
    <p data-bind="textContent:message"></p>
  </section>
</template>

<script type="module">
export default class {
  name = "Structive";
  message = "Welcome!";

  toggle() {
    this.message = this.message === "Welcome!" ? "Enjoy Structive" : "Welcome!";
  }
}
</script>

<style>
section { font-family: system-ui; padding: 1rem; }
button { margin-top: 0.5rem; }
</style>
```

## 2. HTML に Import Map と EasyLoader を追加
`index.html`
```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Structive + EasyLoader</title>

    <!-- SFC を Import Map に登録 -->
    <script type="importmap">
      {
        "imports": {
          "@components/hello-world": "/components/hello.sfc.html"
        }
      }
    </script>

    <!-- EasyLoader: Structive コア + 設定 + コンポーネント登録を自動実行 -->
    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/structivejs/structive@latest/packages/core/dist/EasyLoaders/components.js"
    ></script>
  </head>
  <body>
    <hello-world></hello-world>
  </body>
</html>
```

ポイント:
- Import Map のキーを `@components/<tag-name>` 形式にすると、EasyLoader が `<tag-name>` の Web Component を自動登録します。
- `components.js` は MainWrapper / Router を無効化し、既存 DOM に直接描画するライトな構成です。
- 同じ CDN パスで `default.js`（Router/MainWrapper 有効）、`locale-ja.js` など別プリセットも選べます。
- EasyLoader や独自ローダーを `<script>` で読み込む際は **必ず `type="module"` を付与** してください（Structive は ES Modules で動作します）。
- テンプレート内では `{{name}}` のように参照できます。イベントハンドラは `toggle` のようにクラスメソッドを直接バインドできます。
- `data-bind="onclick:toggle"` のように、イベント名は `on` で始まるプロパティ名（`onclick` / `oninput` など）を指定する必要があります。

## 3. ミニファイ版を使う
本番では bandwidth を抑えるために min 版を推奨します。
```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/structivejs/structive@v1.5.1/packages/core/dist/EasyLoaders/min/components.js"
></script>
```
`min/` ディレクトリのファイルは `structive.esm.min.js` を内部で読み込みます。

## 4. ルーターや Shadow DOM を使いたい場合
EasyLoader にはプリセット済みのファイルが 16 種類あります。ファイル名で有効化されるフラグが変わります。

| 例 | 説明 |
| --- | --- |
| `default.js` | Router / MainWrapper 有効。`config.enableRouter = true` 等のデフォルト値を維持 |
| `shadow-dom-mode-none.js` | Shadow DOM を完全に無効化 |
| `locale-ja.js` | `config.locale = "ja"` をセット |
| `components--shadow-dom-mode-none.js` | Router/MainWrapper 無効 + Shadow DOM 無効 |

必要に応じて `<script>` の `src` だけ切り替えれば設定が変わります。

## 5. さらに細かくカスタマイズしたい場合
EasyLoader は実体がシンプルな ES Module です。CDN から取得した `components.js` などをコピーし、一部の `config` を書き換えて自分のサーバーで配信すれば細かな設定も可能です。

```js
// 独自の easy-loader.js （structive.esm.js への相対パスは配置場所に合わせて調整）
import { bootstrapStructive, config } from "../structive.esm.js";

config.autoLoadFromImportMap = true;
config.enableRouter = true;
config.shadowDomMode = "none";

bootstrapStructive();
```

## 6. コンポーネントのホスティング
- Import Map で指している URL は **Fetch 可能** である必要があります（CORS 許可が必要）。
- 例の `@components/hello-world` は `/components/hello.sfc.html` に置いた SFC を直接読み込みます。CDN や別オリジンから配信する場合も、同様に URL を記載するだけで構いません。

## 7. トラブルシューティング
- 「コンポーネントが表示されない」場合は Import Map キーと `<hello-world>` のタグ名が一致しているか確認してください。
- テンプレートが適用されない場合は、各 `.sfc.html` のマークアップが 1 つの `<template>` で囲まれているか、タグ名が小文字 `<template>` になっているか確認してください。
- `<script>` に `type="module"` を付与していないと ES Module として解釈されず Structive が実行されません。EasyLoader や SFC クラス、独自ローダーなど Structive 関連のスクリプトには必ず `type="module"` を指定してください。
- CORS エラーが発生する場合は SFC を配信しているサーバー側の `Access-Control-Allow-Origin` を確認してください。
- ルーター用のプレースホルダが必要な構成 (`default.js` など) では `<app-main>` や `<view-router>` を DOM に配置するか、`config.autoInsertMainWrapper` の挙動を確認してください。

以上で CDN + EasyLoader を使った最小セットアップは完了です。Import Map にエイリアスを追加していくだけで、複数コンポーネント・ルートを順次ロードしていけます。
