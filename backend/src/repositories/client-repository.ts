import { ClientModel, Client } from "../models/client-model";
import { Types } from "mongoose";

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);


export const findAllClients = async (): Promise<Client[]> => {
  return ClientModel.find().lean().exec();
};

export const findClientById = async (id: string): Promise<Client | null> => {
  if (!isValidObjectId(id)) return null;

  return ClientModel.findById(id).lean().exec();
};

export const searchClients = async (query: string): Promise<Client[]> => {
  return ClientModel
    .find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ],
    })
    .lean()
    .exec();
};

export const findClientByPhone = async (phone: string): Promise<Client | null> => {
  return ClientModel.findOne({ phone }).lean().exec();
};

export const insertClient = async (client: Client): Promise<Client> => {
  const newClient = await ClientModel.create(client);
  return newClient.toObject();
};

export const deleteClient = async (id: string): Promise<boolean> => {
  if (!isValidObjectId(id)) return false;

  const result = await ClientModel.findByIdAndDelete(id).exec();
  return result !== null;
};
