import { Router } from "express";
import { createCrudController, CrudControllerHandlers } from "./controllerFactory";
import { TableName } from "./crudFactory";

type CrudRouterConfig<TName extends TableName> = {
  table: TName;
  path: string;
  idParam?: string;
  controller?: CrudControllerHandlers;
};

export const createCrudRouter = <TName extends TableName>(
  config: CrudRouterConfig<TName>
) => {
  const paramName = config.idParam ?? "id";
  const controller =
    config.controller ??
    createCrudController({
      table: config.table,
      idParam: config.idParam
    });

  const router = Router();

  router.get("/", controller.list);
  router.get(`/:${paramName}`, controller.get);
  router.post("/", controller.create);
  router.put(`/:${paramName}`, controller.update);
  router.delete(`/:${paramName}`, controller.remove);

  return {
    path: config.path,
    router
  };
};
