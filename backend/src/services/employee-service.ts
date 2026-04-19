import { Types } from "mongoose";
import type { Employee } from "../models/employee-model";
import * as EmployeeRepository from "../repositories/employee-repository";
import * as AppointmentRepository from "../repositories/appointment-repository";
import * as httpResponse from "../utils/http-helper";

export const getEmployeesService = async () => {
  const employees = await EmployeeRepository.findAllEmployees();

  if (!employees.length) {
    return httpResponse.noContent();
  }

  return httpResponse.ok(employees);
};

export const getEmployeeByIdService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    return httpResponse.badRequest({ message: "Invalid employee id" });
  }

  const employee = await EmployeeRepository.findEmployeeById(id);

  if (!employee) {
    return httpResponse.notFound({ message: "Employee not found" });
  }

  return httpResponse.ok(employee);
};

export const createEmployeeService = async (employee: Employee) => {
  if (!employee?.name?.trim()) {
    return httpResponse.badRequest({ message: "Employee name is required" });
  }

  if (!employee?.role?.trim()) {
    return httpResponse.badRequest({ message: "Employee role is required" });
  }

  if (
    employee.commission === undefined ||
    employee.commission < 0 ||
    employee.commission > 100
  ) {
    return httpResponse.badRequest({ message: "Commission must be between 0 and 100" });
  }

  const newEmployee = await EmployeeRepository.insertEmployee(employee);

  return httpResponse.created(newEmployee);
};

export const getEmployeeEarningsService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    return httpResponse.badRequest({ message: "Invalid employee id" });
  }

  const employee = await EmployeeRepository.findEmployeeById(id);

  if (!employee) {
    return httpResponse.notFound({ message: "Employee not found" });
  }

  const result = await AppointmentRepository.findAllEarningsByEmployee(id);

  const totalEarnings = result[0]?.totalEarnings ?? 0;
  const totalAppointments = result[0]?.totalAppointments ?? 0;

  return httpResponse.ok({
    employee: employee.name,
    totalAppointments,
    totalEarnings,
  });
};

export const getEmployeeEarningsByDateService = async (
  employeeId: string,
  startDate: string,
  endDate: string
) => {
  if (!Types.ObjectId.isValid(employeeId)) {
    return httpResponse.badRequest({ message: "Invalid employee id" });
  }

  if (!startDate || !endDate) {
    return httpResponse.badRequest({ message: "startDate and endDate are required" });
  }

  if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
    return httpResponse.badRequest({ message: "Invalid date format" });
  }

  const employee = await EmployeeRepository.findEmployeeById(employeeId);

  if (!employee) {
    return httpResponse.notFound({ message: "Employee not found" });
  }

  const result = await AppointmentRepository.findEarningsByEmployeeAndDate(
    employeeId,
    startDate,
    endDate
  );

  const totalEarnings = result[0]?.totalEarnings ?? 0;
  const totalAppointments = result[0]?.totalAppointments ?? 0;

  return httpResponse.ok({
    employee: employee.name,
    startDate,
    endDate,
    totalAppointments,
    totalEarnings,
  });
};

export const deleteEmployeeService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    return httpResponse.badRequest({ message: "Invalid employee id" });
  }

  const totalAppointments = await AppointmentRepository.countAppointmentsByEmployee(id);

  if (totalAppointments > 0) {
    return httpResponse.badRequest({
      message: "Cannot delete employee with associated appointments",
    });
  }

  const deleted = await EmployeeRepository.deleteEmployee(id);

  if (!deleted) {
    return httpResponse.notFound({ message: "Employee not found" });
  }

  return httpResponse.ok({ message: "Employee deleted successfully" });
};
