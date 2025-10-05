import { createCrudRouter } from "../common/routerFactory";
import { claseController } from "./controller";

export const claseRouter = createCrudRouter({
  table: "clase",
  path: "/clases",
  controller: claseController
});

export default claseRouter;
