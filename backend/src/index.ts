import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { config } from "./config/env";
import { HttpCode } from "./constants/httpCodes";
import { connectDB } from "./database/db";
import { errorHandler } from "./middlewares/errorHandler";

import v1Router from "./routes/v1";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

connectDB();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(morgan(config.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(`${config.API_PREFIX}/v1`, v1Router);

app.get("/health", (_, res) => {
  res.status(HttpCode.OK).json({ status: "UP", timestamp: new Date() });
});

app.use(errorHandler);

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});
