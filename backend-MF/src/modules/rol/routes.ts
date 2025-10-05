import { createCrudRouter } from "../common/routerFactory";
import { rolController } from "./controller";

export const rolRouter = createCrudRouter({
  table: "rol",
  path: "/roles",
  controller: rolController
});

export default rolRouter;
