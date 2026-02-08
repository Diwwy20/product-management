export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AppPath = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  PROFILE: "/profile",

  PRODUCTS: "/products",
  CATEGORIES: "/admin/categories",

  MANAGE_PRODUCTS: "/admin/products",
  PRODUCT_CREATE: "/admin/products/create",
  PRODUCT_EDIT: "/admin/products/edit/:id",
} as const;
export type AppPath = (typeof AppPath)[keyof typeof AppPath];

export const DeleteMode = {
  SOFT: "soft",
  HARD: "hard",
} as const;
export type DeleteMode = (typeof DeleteMode)[keyof typeof DeleteMode];
