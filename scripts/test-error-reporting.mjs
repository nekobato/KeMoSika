import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import electron from "electron";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
await mkdir(join(root, "output"), { recursive: true });
const temp = await mkdtemp(join(root, "output/reporting-test-"));
try {
  await build({
    root,
    configFile: false,
    envDir: false,
    define: {
      "import.meta.env.PROD": "true",
      "import.meta.env.VITE_SENTRY_DSN": '""',
    },
    build: {
      ssr: true,
      outDir: join(temp, "bundle"),
      rolldownOptions: {
        input: join(root, "src/main/utils/sentry.electron-test.ts"),
        output: { entryFileNames: "reporting.mjs" },
      },
    },
  });
  const env = {
    ...process.env,
    KEMOSIKA_CONFIG_DIR: join(temp, "config"),
    SENTRY_DSN: "",
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const result = spawnSync(electron, [join(temp, "bundle/reporting.mjs")], {
    cwd: root,
    env,
    stdio: "inherit",
    timeout: 30000,
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(temp, { recursive: true, force: true });
}
