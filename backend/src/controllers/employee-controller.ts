import { Request, Response, NextFunction } from "express";
import * as service from "../services/employee-service";

export const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getEmployeesService();
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getEmployeeByIdService(req.params.id);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.createEmployeeService(req.body);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeEarnings = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getEmployeeEarningsService(req.params.id);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeEarningsByDate = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: "startDate and endDate are required" });
      return;
    }

    const httpResponse = await service.getEmployeeEarningsByDateService(
      req.params.id,
      startDate as string,
      endDate as string
    );

    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.deleteEmployeeService(req.params.id);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};
