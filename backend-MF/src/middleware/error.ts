import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { AppError, isAppError } from "../utils/errors";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: "Resource not found" });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (isAppError(err)) {
    logger.warn({ err }, "Handled application error");
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  logger.error({ err }, "Unhandled error");
  return res.status(500).json({ message: "Internal server error" });
};

export const createNotFoundError = (entity: string): AppError => {
  return new AppError(`${entity} not found`, 404);
};
