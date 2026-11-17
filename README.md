# KeMoSika

Ke(yboard) and Mo(use) Realtime Input Visualizer

キーボードとマウスの入力をリアルタイムに可視化するデスクトップアプリケーションです。レイアウト、キー、マウス、画像の見た目や配置を編集し、専用のビジュアライザーウィンドウに表示できます。

## 開発状況と配布版

現在開発中です。この README は `main` ブランチの実装を説明しています。

[過去の v0.0.1 リリース](https://github.com/nekobato/KeMoSika/releases/tag/v0.0.1)（2024年1月28日）には `TTurns-Mac-0.0.1-Installer.dmg` と `TTurns-Windows-0.0.1-Setup.exe` という名前の配布物があります。現行の KeMoSika の機能を含む配布版としては案内していません。現行実装を試す場合は、下記の開発起動を利用してください。

macOS 向けの権限確認を実装していますが、対応 OS の最低バージョンや Windows / Linux を含む動作保証範囲は未整理です。ビルド設定や過去の配布物の存在だけで、現在の動作確認済み環境を示すものではありません。

## 開発起動

Node.js と pnpm のバージョンは [package.json](./package.json) の `engines` と `packageManager` に合わせてください。現在は Node.js `^24.22.3 || ^26.13.1`、pnpm `10.24.0` です。

```sh
git clone https://github.com/nekobato/KeMoSika.git
cd KeMoSika
pnpm install
pnpm run dev
```

入力取得に `uiohook-napi` を使用しているため、通常の Web ブラウザだけでは入力可視化を確認できません。Electron の開発ウィンドウで試してください。

## 基本的な使い方

1. ホーム画面の「デフォルトレイアウト」または「カスタムレイアウト」からレイアウトを選びます。
2. デフォルトレイアウトを変更する場合は「コピー」でカスタムレイアウトを作成し、「編集」を開きます。「新規作成」から作ることもできます。
3. 編集画面で「キー追加」「マウス追加」「画像追加」を使い、配置や見た目を調整します。
4. ホーム画面に戻り、レイアウトを選んで「ビジュアライザー」を押します。

カスタムレイアウトは「エクスポート」で画像を含むレイアウトファイルに保存できます。「インポート」はフォルダ、`.kemosika-layout`、`.zip` を受け付けます。大切なレイアウトは変更前に書き出しておいてください。

### macOS の権限

入力イベントの取得にはアクセシビリティ権限が必要です。アプリの案内に従い、「システム設定 > プライバシーとセキュリティ > アクセシビリティ」で実行中のアプリを確認して許可し、再度試してください。

開発起動と配布アプリでは、許可対象の表示名や実行ファイルが異なる場合があります。権限を付与する際は、実行しているアプリであることを確認してください。権限なしで利用できるとは保証していません。

## 開発用コマンド

| コマンド | 内容 |
| --- | --- |
| `pnpm run dev` | Electron の開発起動 |
| `pnpm run typecheck` | TypeScript / Vue の型検査 |
| `pnpm run lint` | 現在は型検査を実行 |
| `pnpm run build` | アプリのビルド |
| `pnpm run docs:dev` | VitePress の開発起動 |

`pnpm run release` は配布物の公開を伴うため、ローカル確認には使用しないでください。設定の詳細は [package.json](./package.json) と [electron-builder.config.cjs](./electron-builder.config.cjs) を参照してください。

## 不具合の報告

[Issues](https://github.com/nekobato/KeMoSika/issues) に、OS と CPU、実行方法（開発起動 / 配布版）、バージョンまたはコミット、再現手順、期待した結果、実際の結果を記載してください。権限に関する問題では、警告の文面も添えてください。個人情報や入力内容を含む画像・ログは、必要な部分だけに絞ってください。

## ライセンス

[MIT License](./LICENSE)
