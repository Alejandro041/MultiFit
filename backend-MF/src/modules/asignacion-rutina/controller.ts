import { createCrudController } from "../common/controllerFactory";
import { asignacionRutinaModel } from "./model";

export const asignacionRutinaController = createCrudController({
  table: "asignacion_rutina",
  model: asignacionRutinaModel
});
