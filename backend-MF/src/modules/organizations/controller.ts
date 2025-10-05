import { createCrudController } from "../common/controllerFactory";
import { organizationsModel } from "./model";

export const organizationsController = createCrudController({
  table: "organizations",
  model: organizationsModel
});
