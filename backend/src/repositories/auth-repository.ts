import { AuthModel } from "../models/auth-model";

export const findByUsername = async (username: string) => {
  return AuthModel.findOne({ username: username.toLowerCase().trim() }).lean();
};

export const createAuth = async (username: string, hashedPassword: string) => {
  const auth = new AuthModel({ username, password: hashedPassword });
  await auth.save();
  return auth.toObject();
};

export const authExists = async (): Promise<boolean> => {
  const count = await AuthModel.countDocuments();
  return count > 0;
};
