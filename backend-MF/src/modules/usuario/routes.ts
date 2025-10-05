import { createCrudRouter } from "../common/routerFactory";
import { usuarioController } from "./controller";

export const usuarioRouter = createCrudRouter({
  table: "usuario",
  path: "/usuarios",
  controller: usuarioController
});

export default usuarioRouter;
