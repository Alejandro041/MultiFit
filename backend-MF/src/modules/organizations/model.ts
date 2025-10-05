import { createCrudModel } from "../common/crudFactory";

export const organizationsModel = createCrudModel({
  table: "organizations"
});
