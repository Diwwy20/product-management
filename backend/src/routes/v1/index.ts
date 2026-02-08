import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";

const v1Router = Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/categories", categoryRoutes);
v1Router.use("/products", productRoutes);

export default v1Router;
