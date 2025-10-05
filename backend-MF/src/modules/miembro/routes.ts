import { createCrudRouter } from "../common/routerFactory";
import { miembroController } from "./controller";

export const miembroRouter = createCrudRouter({
  table: "miembro",
  path: "/miembros",
  controller: miembroController
});

export default miembroRouter;
