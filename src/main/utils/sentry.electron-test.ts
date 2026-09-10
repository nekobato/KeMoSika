import assert from "node:assert/strict";
import { createServer } from "node:http";
import { app } from "electron";
import { captureEvent, captureException, flush, getClient } from "@sentry/electron/main";
import { getAppSettings, setErrorReportingEnabled } from "../settings";
import { initSentry, reportError } from "./sentry";

const received: string[] = [];
const server = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    received.push(body);
    res.writeHead(200);
    res.end("{}");
  });
});
const timeout = setTimeout(() => {
  console.error("Reporting test timed out");
  app.exit(1);
}, 20000);
async function main() {
  try {
    await app.whenReady();
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    assert(address && typeof address !== "string");
    process.env.SENTRY_DSN = `http://public@127.0.0.1:${address.port}/1`;
    assert.equal(getAppSettings().errorReportingEnabled, false);
    initSentry();
    reportError(new Error("qa-default-off"));
    assert.equal(getClient(), undefined);
    assert.equal(received.length, 0);
    setErrorReportingEnabled(true);
    initSentry();
    const client = getClient();
    assert(client);
    reportError(new Error("qa-opt-in"));
    await flush(3000);
    assert.equal(received.length, 1);
    const errorValues = () =>
      received.flatMap(
        (body) =>
          JSON.parse(body.split("\n")[2]).exception?.values.map(
            (value: { value: string }) => value.value,
          ) ?? [],
      );
    assert.deepEqual(errorValues(), ["qa-opt-in"]);
    setErrorReportingEnabled(false);
    reportError(new Error("qa-disabled"));
    captureException(new Error("qa-sdk-disabled"));
    await client.getTransport()!.send([
      { sent_at: new Date().toISOString() },
      [
        [
          { type: "session" },
          {
            sid: "qa-disabled",
            init: true,
            timestamp: new Date().toISOString(),
            started: new Date().toISOString(),
            status: "ok",
            errors: 0,
          },
        ],
      ],
    ]);
    await flush(3000);
    assert.equal(received.length, 1);
    setErrorReportingEnabled(true);
    initSentry();
    assert.equal(getClient(), client);
    reportError(new Error("qa-reenabled"));
    await flush(3000);
    assert.equal(received.length, 2);
    assert.deepEqual(errorValues(), ["qa-opt-in", "qa-reenabled"]);
    captureEvent({
      exception: { values: [{
        type: "Error",
        value: "open '/Users/qa-private/My Layout/private.png'",
        stacktrace: { frames: [{
          filename: "C:\\Users\\qa-private\\private.js",
          function: "loadLayout",
          lineno: 42,
          colno: 8,
          vars: { layout: "qa-private" },
        }] },
      }] },
      extra: { layout: "qa-private" },
      contexts: { vue: { propsData: "qa-private" } },
    }, { attachments: [{ filename: "private.txt", data: "qa-private" }] });
    await flush(3000);
    assert.equal(received.length, 3);
    assert.equal(received[2].includes("qa-private"), false);
    assert.equal(received[2].includes('"type":"attachment"'), false);
    const sanitized = JSON.parse(received[2].split("\n")[2]);
    assert.equal(sanitized.exception.values[0].value, "open '[local-path]'");
    assert.equal(sanitized.exception.values[0].stacktrace.frames[0].lineno, 42);
    assert.equal(sanitized.exception.values[0].stacktrace.frames[0].function, "loadLayout");
    setErrorReportingEnabled(false);
    console.log(
      "PASS: initial OFF, late opt-in, loopback delivery, opt-out, re-enable without replay, private paths/context/attachments removed, stack coordinates retained.",
    );
    clearTimeout(timeout);
    server.close();
    app.exit(0);
  } catch (error) {
    console.error(error);
    clearTimeout(timeout);
    server.close();
    app.exit(1);
  }
}
void main();
