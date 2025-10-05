import express from "express";
import cors from "cors";
import { requireAuth } from "./middleware/auth";
import { modules } from "./modules";
import { notFoundHandler, errorHandler } from "./middleware/error";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(requireAuth);

  modules.forEach((module) => {
    app.use(`/api${module.path}`, module.router);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
