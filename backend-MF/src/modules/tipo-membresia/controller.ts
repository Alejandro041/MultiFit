import { createCrudController } from "../common/controllerFactory";
import { tipoMembresiaModel } from "./model";

export const tipoMembresiaController = createCrudController({
  table: "tipo_membresia",
  model: tipoMembresiaModel
});
