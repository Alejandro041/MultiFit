import { createCrudRouter } from "../common/routerFactory";
import { rutinaController } from "./controller";

export const rutinaRouter = createCrudRouter({
  table: "rutina",
  path: "/rutinas",
  controller: rutinaController
});

export default rutinaRouter;
