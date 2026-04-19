import { Request, Response, NextFunction } from "express";
import * as service from "../services/appointment-service";

export const getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getAllAppointmentsService();
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getAppointmentByIdService(req.params.id);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByClient = async (req: Request<{ clientId: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getAppointmentsByClientService(req.params.clientId);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByEmployee = async (req: Request<{ employeeId: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.getAppointmentsByEmployeeService(req.params.employeeId);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.createAppointmentService(req.body);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const httpResponse = await service.deleteAppointmentService(req.params.id);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (error) {
    next(error);
  }
};
