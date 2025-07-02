# 文字なぞり練習アプリ

子供向けの文字なぞり練習アプリです。キャラクターの名前や好きな文字をなぞって練習できます。

## 特徴

- **タッチ対応**: iPad/タブレットのペンや指での描画に対応
- **キャラクター表示**: 動物や図形のキャラクターと一緒に楽しく学習
- **カスタムテキスト**: 好きな文字を入力してなぞり練習
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

## 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite
- **テスト**: Jest + Testing Library
- **描画**: HTML5 Canvas (Pointer Events)

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build
```

## 利用可能なコマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run test` - テスト実行
- `npm run test:watch` - テスト監視モード
- `npm run lint` - ESLintによるコードチェック

## プロジェクト構成

```
src/
├── components/          # Reactコンポーネント
│   └── DrawingCanvas.tsx   # 描画用Canvas
├── services/            # API・データサービス
│   └── characterApi.ts     # キャラクターデータ管理
├── __tests__/          # テストファイル
├── App.tsx             # メインアプリケーション
├── App.css             # スタイルシート
└── main.tsx            # エントリーポイント
```

## カスタマイズ

### データソースの追加

`src/services/characterApi.ts`でキャラクターデータをカスタマイズできます：

```typescript
// 新しいデータソースの追加例
const customSource: DataSource = {
  name: 'custom',
  description: 'カスタムキャラクター',
  getRandomCharacter: async () => {
    // カスタムロジック
  },
  getAllCharacters: () => [
    // カスタムキャラクター配列
  ]
};

// データソースを登録
DATA_SOURCES.custom = customSource;
```

### ポケモンデータソースの削除

著作権を考慮してポケモン機能を削除したい場合：

1. `src/services/dataSources/pokemonDataSource.ts` ファイルを削除
2. アプリが自動的に動物・図形データソースのみで動作します

### 利用可能なデータソース

- **動物キャラクター** (`animals`): ねこ、いぬ、うさぎ等の絵文字
- **基本図形** (`shapes`): まる、さんかく、しかく等の図形
- **ポケモン** (`pokemon`): PokéAPIから取得（オプション）

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](./LICENSE) ファイルを参照してください。

## 免責事項

- このアプリケーションは教育目的のデモンストレーションです
- 含まれる絵文字・アイコンは各プラットフォームの標準絵文字を使用しています
- 商用利用時は適切なライセンス確認を行ってください

### ポケモンデータソースについて

- ポケモン関連のデータは株式会社ポケモン/任天堂の著作物です
- PokéAPI (https://pokeapi.co/) を通じて取得されます
- 商用利用には適切なライセンス取得が必要です
- 著作権を考慮して、このデータソースは簡単に削除できるよう設計されています

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

問題が発生した場合は、GitHubのIssuesページで報告してください。