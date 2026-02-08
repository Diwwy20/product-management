import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AppPath, UserRole } from "@/constants/constants";
import MainLayout from "@/layouts/MainLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: AppPath.HOME,
    component: MainLayout,
    children: [
      // --- Public Routes ---
      {
        path: "",
        name: "Home",
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "products/:id",
        name: "ProductDetail",
        component: () => import("@/views/products/ProductDetail.vue"),
      },

      // --- Auth Required Routes ---
      {
        path: AppPath.PROFILE.substring(1),
        name: "Profile",
        component: () => import("@/views/Profile.vue"),
        meta: { auth: true },
      },

      // --- Admin Only Routes ---
      {
        path: AppPath.MANAGE_PRODUCTS.substring(1),
        name: "ProductManage",
        component: () => import("@/views/products/ProductManage.vue"),
        meta: { auth: true, admin: true },
      },
      {
        path: AppPath.PRODUCT_CREATE.substring(1),
        name: "ProductCreate",
        component: () => import("@/views/products/ProductForm.vue"),
        meta: { auth: true, admin: true },
      },
      {
        path: AppPath.PRODUCT_EDIT.substring(1),
        name: "ProductEdit",
        component: () => import("@/views/products/ProductForm.vue"),
        meta: { auth: true, admin: true },
      },
      {
        path: AppPath.CATEGORIES.substring(1),
        name: "CategoryList",
        component: () => import("@/views/categories/CategoryList.vue"),
        meta: { auth: true, admin: true },
      },
    ],
  },

  // --- Guest Only Routes ---
  {
    path: AppPath.LOGIN,
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
    meta: { guest: true },
  },
  {
    path: AppPath.REGISTER,
    name: "Register",
    component: () => import("@/views/auth/Register.vue"),
    meta: { guest: true },
  },
  {
    path: AppPath.VERIFY_OTP,
    name: "VerifyOTP",
    component: () => import("@/views/auth/VerifyOTP.vue"),
  },
  {
    path: AppPath.FORGOT_PASSWORD,
    name: "ForgotPassword",
    component: () => import("@/views/auth/ForgotPassword.vue"),
  },

  // 404 Redirect
  {
    path: "/:pathMatch(.*)*",
    redirect: AppPath.HOME,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    try {
      await authStore.refresh();
    } catch {
      /* ignore */
    }
  }

  const isAuthenticated = authStore.isLoggedIn;
  const isAdmin = authStore.user?.role === UserRole.ADMIN;

  if (to.meta.auth && !isAuthenticated) {
    next({ name: "Login" });
  } else if (to.meta.guest && isAuthenticated) {
    next({ name: "Home" });
  } else if (to.meta.admin && !isAdmin) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
