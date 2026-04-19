import { EmployeeModel, Employee } from "../models/employee-model";
import { Types } from "mongoose";

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

export const findAllEmployees = async (): Promise<Employee[]> => {
  return EmployeeModel.find().lean().exec();
};

export const findEmployeeById = async (id: string): Promise<Employee | null> => {
  if (!isValidObjectId(id)) return null;

  return EmployeeModel.findById(id).lean().exec();
};

export const insertEmployee = async (employee: Employee): Promise<Employee> => {
  const newEmployee = await EmployeeModel.create(employee);
  return newEmployee.toObject();
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  if (!isValidObjectId(id)) return false;

  const result = await EmployeeModel.findByIdAndDelete(id).exec();
  return result !== null;
};
