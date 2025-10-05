import { createCrudController } from "../common/controllerFactory";
import { rutinaModel } from "./model";

export const rutinaController = createCrudController({
  table: "rutina",
  model: rutinaModel
});
