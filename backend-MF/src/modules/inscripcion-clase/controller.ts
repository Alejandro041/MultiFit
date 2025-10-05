import { createCrudController } from "../common/controllerFactory";
import { inscripcionClaseModel } from "./model";

export const inscripcionClaseController = createCrudController({
  table: "inscripcion_clase",
  model: inscripcionClaseModel
});
