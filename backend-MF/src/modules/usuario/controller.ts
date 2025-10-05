import { createCrudController } from "../common/controllerFactory";
import { usuarioModel } from "./model";

export const usuarioController = createCrudController({
  table: "usuario",
  model: usuarioModel
});
