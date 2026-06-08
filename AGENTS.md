# AGENTS.md

## 会話

- 既定の応答は日本語で行う。
- 敬体を保ち、必要に応じて優雅なお嬢様口調を用いる。
- コード、コマンド、URL、API 名、ファイル名は原文を維持する。
- 不確実な点は推測で断定せず、確認範囲と未確認事項を明示する。

## プロジェクト概要

KeMoSika はキーボードとマウスの入力をリアルタイムに可視化する Electron アプリケーションである。ユーザーは可視化レイアウト、キー、マウス、画像などを編集できる。

## 技術スタック

- Electron / electron-vite
- Vue 3 / TypeScript
- Pinia
- PrimeVue / PrimeFlex / @primeuix/themes
- Sass (`sass-embedded`)
- electron-store
- uiohook-napi
- fflate

## 開発環境

- Node.js は `package.json` の `engines.node` に従う。現在は `>=24`。
- pnpm は `packageManager` に従う。現在は `pnpm@10.24.0`。
- 依存の追加、削除、更新を行う場合は `package.json` と `pnpm-lock.yaml` を一致させる。

## 主要コマンド

- `pnpm run dev`: Electron 開発起動
- `pnpm run build`: Electron ビルド
- `pnpm run release`: リリースビルドと publish
- `pnpm run docs:dev`: VitePress 開発起動
- `pnpm run typecheck`: TypeScript / Vue typecheck
- `pnpm run lint`: 現在は `typecheck` を実行

`test` と `format` スクリプトは現時点では存在しない。追加された場合は、その時点の `package.json` に従って実行する。

## ディレクトリ構成

- `src/main`: Electron main process
- `src/preload`: Electron preload script
- `src/renderer`: Vue renderer process
- `src/shared`: main / preload / renderer で共有する型定義
- `resources`: 配布・実行時に使うリソース
- `doc`: VitePress ドキュメント

## 実装方針

- 変更は目的に対して最小限に保ち、無関係なリファクタを混ぜない。
- TypeScript は関数型の書き方を優先し、不要な class ベース設計を避ける。
- 型は明示し、`any` は既存 API 制約などの理由がある場合に限定する。
- 共通型は `src/shared/types.d.ts` または `src/shared/app-api.d.ts` に置く。
- ユーザー向けエラー文は日本語で、原因と次の行動が分かる表現にする。
- ライブラリやフレームワークの仕様に依存する変更では、context7 または公式ドキュメントで最新仕様を確認する。

## Electron / IPC

- IPC channel 名は `layout:save`、`uiohook:start`、`config:get` のように名前空間を持たせる。
- renderer へは `src/preload/index.ts` の `contextBridge.exposeInMainWorld("kemosikaApi", ...)` で API を公開する。
- renderer からは `window.kemosikaApi` を使い、raw `ipcRenderer` を直接公開しない。
- `kemosikaApi` の型は `src/shared/app-api.d.ts` と `src/renderer/src/types/global.d.ts` を更新して同期する。

## Vue / Renderer

- Vue SFC は `<script setup lang="ts">` と Composition API を基本にする。
- props と emits は明示的に型定義する。
- Vue コンポーネント名は PascalCase、TypeScript ファイル名は camelCase を基本にする。
- Pinia store は `defineStore` を使い、Composition API 形式で定義する。
- renderer から main へ処理を委譲する場合は `window.kemosikaApi` 経由にする。
- PrimeVue はフォーム、ボタン、ダイアログなどの標準 UI に使い、レイアウト編集体験に関わる独自 UI は既存デザインに合わせる。

## スタイリング

- Vue コンポーネント固有のスタイルは `<style scoped lang="scss">` を基本にする。
- クラス名は kebab-case を使う。
- テーマ・共通変数は `src/renderer/src/assets/styles` 配下に集約する。
- SCSS 変数より CSS custom properties を優先する。
- PrimeVue テーマ拡張は `src/renderer/src/theme` 配下に置く。

## テスト / 検証

- 実装後は、該当する最小範囲の検証を行う。
- 現在の必須検証は `pnpm run lint`。
- `test`、`format`、追加の typecheck や対象別テストが `package.json` に追加された場合は、それらも実行する。
- E2E は computer use で実際のアプリ操作を確認する。
- 長時間起動する dev server や watch は PID とログを管理し、作業後に終了確認する。

## Git / 作業ツリー

- 既存の未コミット変更はユーザーの作業として扱い、明示依頼なしに戻さない。
- 自分の変更と無関係な差分は触らない。
- 重要ファイルの削除、依存追加、長時間ジョブ、本番リリース相当の操作は事前に確認する。
