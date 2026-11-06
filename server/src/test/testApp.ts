import express, { Router } from "express";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "../middleware/errorHandler";

/** Mounts one router in isolation with the same middleware index.ts uses, for request-level tests. */
export function buildTestApp(mountPath: string, router: Router) {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(mountPath, router);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
