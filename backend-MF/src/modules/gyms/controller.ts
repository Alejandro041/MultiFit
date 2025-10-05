import { createCrudController } from "../common/controllerFactory";
import { gymsModel } from "./model";

export const gymsController = createCrudController({
  table: "gyms",
  model: gymsModel
});
