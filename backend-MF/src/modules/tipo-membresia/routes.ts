import { createCrudRouter } from "../common/routerFactory";
import { tipoMembresiaController } from "./controller";

export const tipoMembresiaRouter = createCrudRouter({
  table: "tipo_membresia",
  path: "/tipos-membresia",
  controller: tipoMembresiaController
});

export default tipoMembresiaRouter;
