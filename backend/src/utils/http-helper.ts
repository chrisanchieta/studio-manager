import { HttpResponse } from "../models/http-model";

export const ok = (data: unknown): HttpResponse => ({
  statusCode: 200,
  body: data,
});

export const created = (data: unknown): HttpResponse => ({
  statusCode: 201,
  body: data,
});

export const noContent = (): HttpResponse => ({
  statusCode: 204,
  body: null,
});

export const badRequest = (data: { message: string }): HttpResponse => ({
  statusCode: 400,
  body: data,
});

export const notFound = (data: { message: string }): HttpResponse => ({
  statusCode: 404,
  body: data,
});

export const internalError = (data: { message: string }): HttpResponse => ({
  statusCode: 500,
  body: data,
});

export { HttpResponse };
