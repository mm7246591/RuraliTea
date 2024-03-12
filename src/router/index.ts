import { createRouter, createWebHistory } from "vue-router";
import type { App } from "vue";
import { useUserStore } from "@/stores/user";
import firebaseConfig from "@/config/firebaseConfig";
import { getDatabase, ref, update } from "firebase/database";
firebaseConfig;
const db = getDatabase();
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
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
    meta: {
      name: "聯絡我們",
    },
  },
  {
    path: "/checkout/step1",
    name: "CheckoutStepOne",
    meta: { name: "結帳", requiresAuth: true },
    component: () => import("../views/CheckoutStepOne.vue"),
  },
  {
    path: "/checkout/step2",
    name: "CheckoutStepTwo",
    meta: { name: "結帳", requiresAuth: true },
    component: () => import("../views/CheckoutStepTwo.vue"),
  },
  {
    path: "/checkout/step3",
    name: "CheckoutStepThree",
    meta: { name: "結帳", requiresAuth: true },
    component: () => import("../views/CheckoutStepThree.vue"),
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

const handlePath = async (to, from, next) => {
  const userStore = useUserStore();
  userStore.showCar = false
  if (to.meta.requiresAuth && !userStore.userName) {
    next("/");
  } else if (from.path === '/checkout/step3') {
    await update(ref(db, `users/${userStore.userName}/`), {
      info: null
    });
    next()
  } else {
    next();
  }
}

router.beforeEach((to, from, next) => {
  handlePath(to, from, next)
});

export const setupRouter = (app: App) => {
  app.use(router);
};