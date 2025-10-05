import { createCrudRouter } from "../common/routerFactory";
import { gymsController } from "./controller";

export const gymsRouter = createCrudRouter({
  table: "gyms",
  path: "/gyms",
  controller: gymsController
});

export default gymsRouter;
