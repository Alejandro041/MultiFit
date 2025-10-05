import { createCrudRouter } from "../common/routerFactory";
import { organizationsController } from "./controller";

export const organizationsRouter = createCrudRouter({
  table: "organizations",
  path: "/organizations",
  controller: organizationsController
});

export default organizationsRouter;
