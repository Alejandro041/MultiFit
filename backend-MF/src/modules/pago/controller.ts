import { createCrudController } from "../common/controllerFactory";
import { pagoModel } from "./model";

export const pagoController = createCrudController({
  table: "pago",
  model: pagoModel
});
