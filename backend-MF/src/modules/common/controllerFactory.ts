import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { createCrudModel, CrudModel, ensureClient, TableName } from "./crudFactory";

const ensureBodyObject = (body: unknown) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Request body must be an object", 400);
  }

  return body as Record<string, unknown>;
};

type CrudControllerConfig<TName extends TableName> = {
  table: TName;
  idParam?: string;
  model?: CrudModel<TName>;
};

export type CrudControllerHandlers = {
  list: RequestHandler;
  get: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
};

export const createCrudController = <TName extends TableName>(
  config: CrudControllerConfig<TName>
): CrudControllerHandlers => {
  const model = config.model ?? createCrudModel({ table: config.table });
  const idParam = config.idParam ?? "id";

  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const client = ensureClient(req.supabase);
      const data = await model.list(client);
      res.json(data);
    }),

    get: asyncHandler(async (req: Request, res: Response) => {
      const client = ensureClient(req.supabase);
      const id = req.params[idParam];

      if (!id) {
        throw new AppError(`Missing path parameter: ${idParam}`, 400);
      }

      const item = await model.getById(client, id);
      res.json(item);
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      const client = ensureClient(req.supabase);
      const payload = ensureBodyObject(req.body);

      const created = await model.create(client, payload as never);
      res.status(201).json(created);
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      const client = ensureClient(req.supabase);
      const id = req.params[idParam];

      if (!id) {
        throw new AppError(`Missing path parameter: ${idParam}`, 400);
      }

      const payload = ensureBodyObject(req.body);

      const updated = await model.update(client, id, payload as never);
      res.json(updated);
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      const client = ensureClient(req.supabase);
      const id = req.params[idParam];

      if (!id) {
        throw new AppError(`Missing path parameter: ${idParam}`, 400);
      }

      await model.remove(client, id);
      res.status(204).send();
    })
  };
};
