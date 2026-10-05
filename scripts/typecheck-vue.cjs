const { run } = require("vue-tsc");

// vue-tsc 3 needs the JavaScript compiler API absent from TypeScript 7.
// Keep the native TypeScript 7 check and run Vue's full check with TypeScript 6.
run(require.resolve("typescript-vue/lib/tsc"));
