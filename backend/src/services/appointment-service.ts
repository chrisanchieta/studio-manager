import { Types } from "mongoose";
import { AppointmentModel } from "../models/appointment-model";
import * as AppointmentRepository from "../repositories/appointment-repository";
import * as ClientRepository from "../repositories/client-repository";
import * as EmployeeRepository from "../repositories/employee-repository";
import * as httpResponse from "../utils/http-helper";

export const getAllAppointmentsService = async () => {
  const appointments = await AppointmentRepository.findAllAppointments();
  if (!appointments.length) return httpResponse.noContent();
  return httpResponse.ok(appointments);
};

export const getAppointmentByIdService = async (id: string) => {
  if (!Types.ObjectId.isValid(id))
    return httpResponse.badRequest({ message: "Invalid appointment id" });

  const appointment = await AppointmentRepository.findAppointmentById(id);
  if (!appointment)
    return httpResponse.notFound({ message: "Appointment not found" });

  return httpResponse.ok(appointment);
};

export const getAppointmentsByClientService = async (clientId: string) => {
  if (!Types.ObjectId.isValid(clientId))
    return httpResponse.badRequest({ message: "Invalid client id" });

  const client = await ClientRepository.findClientById(clientId);
  if (!client)
    return httpResponse.notFound({ message: "Client not found" });

  const appointments = await AppointmentRepository.findAppointmentsByClient(clientId);

  return httpResponse.ok({
    client: { name: client.name, phone: client.phone },
    totalAppointments: appointments.length,
    appointments,
  });
};

export const getAppointmentsByEmployeeService = async (employeeId: string) => {
  if (!Types.ObjectId.isValid(employeeId))
    return httpResponse.badRequest({ message: "Invalid employee id" });

  const employee = await EmployeeRepository.findEmployeeById(employeeId);
  if (!employee)
    return httpResponse.notFound({ message: "Employee not found" });

  const appointments = await AppointmentRepository.findAppointmentsByEmployee(employeeId);

  return httpResponse.ok({
    employee: { name: employee.name, role: employee.role },
    totalAppointments: appointments.length,
    appointments,
  });
};

export const createAppointmentService = async (body: {
  clientId: string;
  employeeId: string;
  procedure: string;
  amountPaid: number;
}) => {
  const { clientId, employeeId, procedure, amountPaid } = body;

  if (!clientId || !Types.ObjectId.isValid(clientId))
    return httpResponse.badRequest({ message: "Invalid client id" });

  if (!employeeId || !Types.ObjectId.isValid(employeeId))
    return httpResponse.badRequest({ message: "Invalid employee id" });

  if (!procedure?.trim())
    return httpResponse.badRequest({ message: "Procedure is required" });

  if (!amountPaid || amountPaid <= 0)
    return httpResponse.badRequest({ message: "amountPaid must be greater than zero" });

  const client = await ClientRepository.findClientById(clientId);
  if (!client)
    return httpResponse.notFound({ message: "Client not found" });

  const employee = await EmployeeRepository.findEmployeeById(employeeId);
  if (!employee)
    return httpResponse.notFound({ message: "Employee not found" });

  const newAppointment = await AppointmentModel.create({
    client: clientId,
    employee: employeeId,
    procedure: procedure.trim(),
    amountPaid,
  });

  return httpResponse.created(newAppointment.toObject());
};

export const deleteAppointmentService = async (id: string) => {
  if (!Types.ObjectId.isValid(id))
    return httpResponse.badRequest({ message: "Invalid appointment id" });

  const deleted = await AppointmentRepository.deleteAppointment(id);
  if (!deleted)
    return httpResponse.notFound({ message: "Appointment not found" });

  return httpResponse.ok({ message: "Appointment deleted successfully" });
};
