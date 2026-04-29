# KeMoSika

Ke(yboard) and Mo(use) Realtime Input Visualizer

## Browser Use preview

Run the renderer in a normal browser when you want to inspect the main UI from
Codex Browser Use:

```bash
pnpm run dev:browser
```

Then open `http://127.0.0.1:5173` in Browser Use. This mode installs a
browser-only `window.kemosikaApi` client backed by a same-origin local dev API
server, so it is useful for checking the editor flow without launching Electron.
It does not exercise native Electron APIs such as `uiohook-napi`.

To reset the preview data, open
`http://127.0.0.1:5173/?kemosika-browser-use-reset=1#/`.
