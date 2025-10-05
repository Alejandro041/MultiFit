import { createCrudController } from "../common/controllerFactory";
import { personaModel } from "./model";

export const personaController = createCrudController({
  table: "persona",
  model: personaModel
});
