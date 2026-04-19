import { Request, Response, NextFunction } from "express";
import * as service from "../services/client-service";

export const getAllClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getAllClientsService();
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getClientByIdService(req.params.id);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const searchClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ message: "Query param 'q' is required" });
      return;
    }

    const httpResponse = await service.searchClientsService(q as string);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.createClientService(req.body);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.deleteClientService(req.params.id);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};
