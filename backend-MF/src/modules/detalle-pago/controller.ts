import { createCrudController } from "../common/controllerFactory";
import { detallePagoModel } from "./model";

export const detallePagoController = createCrudController({
  table: "detalle_pago",
  model: detallePagoModel
});
