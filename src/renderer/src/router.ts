import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Index",
    component: () => import("./pages/index.vue")
  },
  {
    path: "/config",
    name: "Config",
    component: () => import("./pages/config.vue")
  },
  {
    path: "/visualizer",
    name: "Visualizer",
    component: () => import("./pages/visualizer.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
