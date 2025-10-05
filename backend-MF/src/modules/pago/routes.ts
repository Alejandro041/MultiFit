import { createCrudRouter } from "../common/routerFactory";
import { pagoController } from "./controller";

export const pagoRouter = createCrudRouter({
  table: "pago",
  path: "/pagos",
  controller: pagoController
});

export default pagoRouter;
