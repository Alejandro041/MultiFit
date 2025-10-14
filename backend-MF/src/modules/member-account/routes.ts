import { Router } from "express";
import { memberAccountController } from "./controller";

const router = Router();

router.post("/", memberAccountController.invite);

export const memberAccountRouter = {
  path: "/member-accounts",
  router
};

export default memberAccountRouter;
