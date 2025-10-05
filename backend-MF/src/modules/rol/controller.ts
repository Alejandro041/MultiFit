import { createCrudController } from "../common/controllerFactory";
import { rolModel } from "./model";

export const rolController = createCrudController({
  table: "rol",
  model: rolModel
});
