import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/styles/index.scss";
import App from "./App.vue";
import router from "./router";
import { initSentry } from "./utils/sentry";

initSentry();
createApp(App).use(router).use(createPinia()).mount("#app");
