import { createApp } from "vue";
import { createPinia } from "pinia";
import Toast, { POSITION, type PluginOptions } from "vue-toastification";
import i18n from "@/locales/i18n";
import router from "@/router";
import App from "./App.vue";

import "./style.css";
import "vue-toastification/dist/index.css";

const app = createApp(App);

const toastOptions: PluginOptions = {
  position: POSITION.TOP_CENTER,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__fade",
  maxToasts: 5,
  newestOnTop: true,
};

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Toast, toastOptions);

app.mount("#app");
