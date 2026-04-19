import { Request, Response, NextFunction } from "express";
import * as service from "../services/auth-service";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.loginService(req.body);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const seedAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const httpResponse = await service.seedAdminService(username, password);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};
