import { createCrudRouter } from "../common/routerFactory";
import { inscripcionClaseController } from "./controller";

export const inscripcionClaseRouter = createCrudRouter({
  table: "inscripcion_clase",
  path: "/inscripciones-clase",
  controller: inscripcionClaseController
});

export default inscripcionClaseRouter;
