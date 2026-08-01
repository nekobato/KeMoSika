import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import ja from "element-plus/es/locale/lang/ja";
import "element-plus/dist/index.css";
import "./assets/styles/index.scss";
import App from "./App.vue";
import router from "./router";
import { initSentry } from "./utils/sentry";

const app = createApp(App);

initSentry(app);

app
  .use(createPinia())
  .use(router)
  .use(ElementPlus, { locale: ja })
  .mount("#app");
