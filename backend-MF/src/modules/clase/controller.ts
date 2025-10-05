import { createCrudController } from "../common/controllerFactory";
import { claseModel } from "./model";

export const claseController = createCrudController({
  table: "clase",
  model: claseModel
});
