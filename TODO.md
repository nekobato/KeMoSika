# TODO

最終同期日: 2026-07-15

## 現在地

同期確認時点のローカル`main`は`989ccce`で、この文書以外の未コミット差分はなく、保存済みの`origin/main`より10 commit遅れている。
`origin/main`にはSentry導入とElectron、Vite、TypeScript等のdependency updateがmerge済みである。

## 最優先

- [ ] ローカル`main`を`origin/main`へ安全にfast-forwardし、10 commit分の変更を現在地にする。
- [ ] `main` pushごとに`pnpm release`を実行するworkflowをtagまたは手動承認へ変更する。
- [ ] workflowのpnpm 8をprojectのpnpm 10.24へ揃え、frozen install、typecheck、test、buildをpublish前のgateにする。
- [ ] Sentry merge時のGitHub ActionsとReleaseを確認し、意図しないartifact公開がなかったか記録する。
- [ ] dependency update後のmacOSとWindows packageをsmoke testする。

## Runtimeとsecurity

- [ ] `uiohook:start`と`visualizer:start`のruntime戻り値`{ started, reason }`をpublic API型と一致させる。
- [ ] preloadの`openUrl`をmain handlerへ接続するか、dead APIとして削除する。
- [ ] Sentryへkey input、layout、path、component propsを送らない方針を決め、捕捉対象の例外だけを`reportError`へ接続する。
- [ ] layout import rollback、IPC sender validation、uiohookとglobal shortcutのlifecycle testを追加する。

## UIと初期データ

- [ ] キャンバスサイズをdragで変更できるようにする。
- [ ] `onRotateGroup`がgroupの中心を基準に回転するようにする。
- [ ] MacBook Airのkeyboard layoutを追加する。
- [ ] NuPhy Air75のkeyboard layoutを追加する。

## 文書

- [ ] README、既存TODO、versionとtagを現在の実装へ同期する。
