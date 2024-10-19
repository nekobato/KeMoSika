import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Index",
    component: () => import("./pages/index.vue")
  },
  {
    path: "/edit/:layoutId",
    name: "Edit",
    component: () => import("./pages/edit.vue")
  },
  {
    path: "/image",
    name: "Image",
    component: () => import("./pages/image.vue")
  },
  {
    path: "/visualizer/:layoutId",
    name: "Visualizer",
    component: () => import("./pages/visualizer.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
