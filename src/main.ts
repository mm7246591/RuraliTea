import { createApp } from "vue";
import App from "@/App.vue";
import { setupRouter } from "@/router";
import { setupStore } from "@/stores";

import "@/assets/css/style.css";
import "@/assets/css/normalize.css";
import "@/assets/css/tailwind.css";
import "vant/lib/index.css";

const Bootstrap = async () => {
  const app = createApp(App);
  setupRouter(app);
  setupStore(app);
  setupStore(app);
  app.mount("#app");
};

Bootstrap();
