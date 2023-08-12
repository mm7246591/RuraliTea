import { createRouter, createWebHistory } from "vue-router";
import type { App } from "vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: {
      name: "首頁",
    },
  },
  {
    path: "/all-tea",
    name: "AllTea",
    component: () => import("../views/AllTea.vue"),
    meta: {
      name: "所有商品",
    },
  },
  {
    path: "/all-tea/:id",
    name: "AllTeaItem",
    component: () => import("../components/Item.vue"),
  },
  {
    path: "/gift-box",
    name: "GiftBox",
    component: () => import("../views/GiftBox.vue"),
    meta: {
      name: "茶葉禮盒",
    },
  },
  {
    path: "/season-limited",
    name: "SeasonLimited",
    component: () => import("../views/SeasonLimited.vue"),
    meta: {
      name: "季節限定",
    },
  },
  {
    path: "/mountain-tea",
    name: "MountainTea",
    component: () => import("../views/MountainTea.vue"),
    meta: {
      name: "高山茶",
    },
  },
  {
    path: "/black-tea",
    name: "BlackTea",
    component: () => import("../views/BlackTea.vue"),
    meta: {
      name: "紅茶",
    },
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("../views/Contact.vue"),
    meta: {
      name: "聯絡我們",
    },
  },

  {
    path: "/:path(.*)*",
    name: "error-page",
    redirect: "/",
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
});

export const setupRouter = (app: App) => {
  app.use(router);
};
