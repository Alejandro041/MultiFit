import { createCrudRouter } from "../common/routerFactory";
import { detallePagoController } from "./controller";

export const detallePagoRouter = createCrudRouter({
  table: "detalle_pago",
  path: "/detalles-pago",
  controller: detallePagoController
});

export default detallePagoRouter;
