import { Types } from "mongoose";
import type { Client } from "../models/client-model";
import * as ClientRepository from "../repositories/client-repository";
import * as AppointmentRepository from "../repositories/appointment-repository";
import * as httpResponse from "../utils/http-helper";

export const getAllClientsService = async () => {
  const clients = await ClientRepository.findAllClients();

  if (!clients.length) {
    return httpResponse.noContent();
  }

  return httpResponse.ok(clients);
};

export const getClientByIdService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    return httpResponse.badRequest({ message: "Invalid client id" });
  }

  const client = await ClientRepository.findClientById(id);

  if (!client) {
    return httpResponse.notFound({ message: "Client not found" });
  }

  return httpResponse.ok(client);
};

export const searchClientsService = async (query: string) => {
  if (!query?.trim()) {
    return httpResponse.badRequest({ message: "Search query is required" });
  }

  const clients = await ClientRepository.searchClients(query.trim());

  if (!clients.length) {
    return httpResponse.noContent();
  }

  return httpResponse.ok(clients);
};

export const createClientService = async (client: Client) => {
  if (!client?.name?.trim()) {
    return httpResponse.badRequest({ message: "Client name is required" });
  }

  if (!client?.phone?.trim()) {
    return httpResponse.badRequest({ message: "Client phone is required" });
  }

  const existing = await ClientRepository.findClientByPhone(client.phone.trim());

  if (existing) {
    return httpResponse.badRequest({ message: "A client with this phone number already exists" });
  }

  const newClient = await ClientRepository.insertClient(client);

  return httpResponse.created(newClient);
};

export const deleteClientService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    return httpResponse.badRequest({ message: "Invalid client id" });
  }

  const totalAppointments = await AppointmentRepository.countAppointmentsByClient(id);

  if (totalAppointments > 0) {
    return httpResponse.badRequest({
      message: "Cannot delete client with associated appointments",
    });
  }

  const deleted = await ClientRepository.deleteClient(id);

  if (!deleted) {
    return httpResponse.notFound({ message: "Client not found" });
  }

  return httpResponse.ok({ message: "Client deleted successfully" });
};
