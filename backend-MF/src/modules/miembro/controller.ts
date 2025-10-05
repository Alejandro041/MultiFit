import { createCrudController } from "../common/controllerFactory";
import { miembroModel } from "./model";

export const miembroController = createCrudController({
  table: "miembro",
  model: miembroModel
});
