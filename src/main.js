import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import VeeValidatePlugin from "./plugins/validation";
import { auth } from "./plugins/firebase";
import Icon from "./directives/icon";
import i18n from "./plugins/i18n";
import { registerSW } from "virtual:pwa-register";
import GlobalComponents from "./plugins/_globals";
import progressBar from "./plugins/progress-bar";
import "./assets/main.css";
import "nprogress/nprogress.css";
registerSW({
  immediate: true,
});
progressBar(router);
let app;
auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App);

    app.use(createPinia());
    app.use(router);
    app.use(VeeValidatePlugin, { foo: 100 });
    app.use(i18n);
    app.use(GlobalComponents);
    app.directive("icon", Icon);
    app.mount("#app");
  }
});
