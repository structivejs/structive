# Structive

構造が意味を定義する、構造駆動型テンプレートエンジン

## 概要

Structiveは、構造自体が意味を持つ宣言的なテンプレートエンジンです。HTML構造を活かしながら、直感的なデータバインディングとコンポーネント化を実現します。

### はじめに

- [クイックスタートガイド](docs/getting-started.ja.md)
- [エラーコードガイド](docs/error-codes.ja.md)

## 特徴

- **構造駆動型**: HTML構造をベースとした宣言的な構文
- **データバインディング**: シンプルかつ強力なデータバインディング機能
- **Web Components**: Web Components標準を完全サポート
- **軽量**: 高速で軽量なランタイム

## 開発

```bash
# 依存関係のインストール
npm install

# テストの実行
npm test

# カバレッジ付きテストの実行
npm run test:coverage

# Lintの実行
npm run lint

# Lintの自動修正
npm run lint:fix

# ビルド
npm run build

# distのクリア
npm run clean
```

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください


## バージョン

現在のバージョンを確認: `npm pkg get version` (packages/core ディレクトリで実行)

バージョン更新手順については [packages/core/VERSION.md](packages/core/VERSION.md) を参照してください。

