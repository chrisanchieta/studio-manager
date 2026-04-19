import { AppointmentModel, Appointment } from "../models/appointment-model";
import { Types } from "mongoose";

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

const clientPopulate = { path: "client", select: "name phone" };
const employeePopulate = { path: "employee", select: "name role" };


export const findAllAppointments = async (): Promise<Appointment[]> => {
  return AppointmentModel
    .find()
    .populate(clientPopulate)
    .populate(employeePopulate)
    .lean()
    .exec();
};

export const findAppointmentById = async (id: string): Promise<Appointment | null> => {
  if (!isValidObjectId(id)) return null;

  return AppointmentModel
    .findById(id)
    .populate(clientPopulate)
    .populate(employeePopulate)
    .lean()
    .exec();
};

export const findAppointmentsByClient = async (clientId: string): Promise<Appointment[]> => {
  if (!isValidObjectId(clientId)) return [];

  return AppointmentModel
    .find({ client: clientId })
    .populate(employeePopulate)
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

export const findAppointmentsByEmployee = async (employeeId: string): Promise<Appointment[]> => {
  if (!isValidObjectId(employeeId)) return [];

  return AppointmentModel
    .find({ employee: employeeId })
    .populate(clientPopulate)
    .sort({ createdAt: -1 })
    .lean()
    .exec();
};

export const countAppointmentsByClient = async (clientId: string): Promise<number> => {
  if (!isValidObjectId(clientId)) return 0;
  return AppointmentModel.countDocuments({ client: clientId });
};

export const countAppointmentsByEmployee = async (employeeId: string): Promise<number> => {
  if (!isValidObjectId(employeeId)) return 0;
  return AppointmentModel.countDocuments({ employee: employeeId });
};

export const findEarningsByEmployeeAndDate = async (
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<{ totalEarnings: number; totalAppointments: number }[]> => {
  if (!isValidObjectId(employeeId)) return [];

  return AppointmentModel.aggregate([
    {
      $match: {
        employee: new Types.ObjectId(employeeId),
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate.split("T")[0] + "T23:59:59.999Z"),
        },
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employeeData",
      },
    },
    { $unwind: "$employeeData" },
    {
      $project: {
        earnings: {
          $multiply: [
            "$amountPaid",
            { $divide: ["$employeeData.commission", 100] },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$earnings" },
        totalAppointments: { $sum: 1 },
      },
    },
  ]).exec();
};

export const findAllEarningsByEmployee = async (
  employeeId: string
): Promise<{ totalEarnings: number; totalAppointments: number }[]> => {
  if (!isValidObjectId(employeeId)) return [];

  return AppointmentModel.aggregate([
    {
      $match: { employee: new Types.ObjectId(employeeId) },
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employeeData",
      },
    },
    { $unwind: "$employeeData" },
    {
      $project: {
        earnings: {
          $multiply: [
            "$amountPaid",
            { $divide: ["$employeeData.commission", 100] },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$earnings" },
        totalAppointments: { $sum: 1 },
      },
    },
  ]).exec();
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
  if (!isValidObjectId(id)) return false;

  const result = await AppointmentModel.findByIdAndDelete(id).exec();
  return result !== null;
};
