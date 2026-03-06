import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  ErrorRequestHandler,
  Express,
  NextFunction,
  Request,
  Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";

import path from "path";
import { startCronJobs } from "./jobs";
import { isMaintenanceMode } from "./middlewares/ensure-not-in-maintenance";
import routes from "./routes";
import { cleanupUploadedFiles } from "./utils/file-cleanup";

const whitelist = process.env.CORS_ORIGINS?.split(",") || [];
const corsOptions = {
  origin: function (
    origin: any,
    callback: (error: Error | null, origin?: boolean) => void
  ) {
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export const app: Express = express();

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cookieParser())
  .use(cors(corsOptions))
  .use(helmet())
  .use(compression());

app.use(
  "/post",
  express.static("uploads/images/post", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/post", express.static(path.resolve("uploads/images/post")));

app.use(
  "/product",
  express.static("uploads/images/product", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/product", express.static(path.resolve("uploads/images/product")));

app.use(
  "/order",
  express.static("uploads/images/order", {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/order", express.static(path.resolve("uploads/images/order")));

app.use(isMaintenanceMode).use(routes);

const errorHandler: ErrorRequestHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Clean up uploaded files if any error occurs
  await cleanupUploadedFiles(req as any);

  const status = error.status;
  const message = error.message ?? "Server Error";
  const errorCode = error.code ?? "Error_Code";

  res.status(status).json({ message, error: errorCode });
};

app.use(errorHandler);

startCronJobs();
