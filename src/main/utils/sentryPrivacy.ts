import type { ElectronMainOptions } from "@sentry/electron/main";

type ErrorEvent = Parameters<NonNullable<ElectronMainOptions["beforeSend"]>>[0];
type Stacktrace = NonNullable<
  NonNullable<ErrorEvent["exception"]>["values"]
>[number]["stacktrace"];

// Redact the whole local path, including filenames and spaces. Prefer losing
// trailing prose to exposing a private filename in an unquoted error message.
export const redactLocalPaths = (value: string): string =>
  value
    .replace(/file:\/\/[^\r\n"'<>]*/gi, "[local-path]")
    .replace(/(?<!\w)(?:[A-Za-z]:[\\/]|\\\\)[^\r\n"'<>]*/g, "[local-path]")
    .replace(/(?<![\w:/])(?:~\/|\/)[^\r\n"'<>]*/g, "[local-path]");

const text = (value: unknown): string | undefined =>
  typeof value === "string" ? redactLocalPaths(value) : undefined;

const sanitizeStack = (stack: Stacktrace): Stacktrace =>
  stack && {
    frames: stack.frames?.map((frame) => ({
      filename: text(frame.filename),
      function: text(frame.function),
      module: text(frame.module),
      lineno: frame.lineno,
      colno: frame.colno,
      in_app: frame.in_app,
    })),
  };

// Explicit fields prevent props, layouts, input, local variables, source
// excerpts and arbitrary SDK context from being attached to an error.
// Renderer events pass through this main-process beforeSend as well.
export const sanitizeSentryEvent = (event: ErrorEvent): ErrorEvent => ({
  type: event.type,
  event_id: event.event_id,
  timestamp: event.timestamp,
  platform: event.platform,
  level: event.level,
  release: text(event.release),
  environment: event.environment,
  sdk: event.sdk,
  message: text(event.message),
  exception: event.exception && {
    values: event.exception.values?.map((exception) => ({
      type: text(exception.type),
      value: text(exception.value),
      stacktrace: sanitizeStack(exception.stacktrace),
      mechanism: exception.mechanism && {
        type: exception.mechanism.type,
        handled: exception.mechanism.handled,
      },
    })),
  },
  contexts: {
    os: event.contexts?.os && {
      name: text(event.contexts.os.name),
      version: text(event.contexts.os.version),
      build: text(event.contexts.os.build),
      kernel_version: text(event.contexts.os.kernel_version),
    },
    runtime: event.contexts?.runtime && {
      name: text(event.contexts.runtime.name),
      version: text(event.contexts.runtime.version),
    },
  },
  tags: {
    "event.process": ["browser", "main", "renderer", "utility"].includes(
      String(event.tags?.["event.process"]),
    )
      ? event.tags?.["event.process"]
      : undefined,
  },
});
