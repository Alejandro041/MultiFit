import { Router } from "express";
import { bootstrapController } from "./controller";

const router = Router();

router.post("/", bootstrapController.ensureUserProfile);

export const bootstrapRouter = {
  path: "/bootstrap",
  router
};

export default bootstrapRouter;
