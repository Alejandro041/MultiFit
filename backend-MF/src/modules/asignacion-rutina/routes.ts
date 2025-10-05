import { createCrudRouter } from "../common/routerFactory";
import { asignacionRutinaController } from "./controller";

export const asignacionRutinaRouter = createCrudRouter({
  table: "asignacion_rutina",
  path: "/asignaciones-rutina",
  controller: asignacionRutinaController
});

export default asignacionRutinaRouter;
