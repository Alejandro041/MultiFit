import { Router } from "express";
import { usuarioOrganizationController } from "./controller";

const router = Router();

router.get("/", usuarioOrganizationController.list);
router.get("/:userId/:organizationId", usuarioOrganizationController.get);
router.post("/", usuarioOrganizationController.create);
router.put("/:userId/:organizationId", usuarioOrganizationController.update);
router.delete("/:userId/:organizationId", usuarioOrganizationController.remove);

export const usuarioOrganizationRouter = {
  path: "/usuario-organizations",
  router
};

export default usuarioOrganizationRouter;
