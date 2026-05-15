import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import AuraEP from "./theme/aura-ep";
import "primeflex/primeflex.css";
import "./assets/styles/index.scss";
import App from "./App.vue";
import router from "./router";
import { initSentry } from "./utils/sentry";

initSentry();
createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: AuraEP
    }
  })
  .use(ToastService)
  .mount("#app");
