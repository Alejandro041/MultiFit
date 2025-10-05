import { createCrudRouter } from "../common/routerFactory";
import { personaController } from "./controller";

export const personaRouter = createCrudRouter({
  table: "persona",
  path: "/personas",
  controller: personaController
});

export default personaRouter;
