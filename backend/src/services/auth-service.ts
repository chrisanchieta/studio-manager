import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as AuthRepository from "../repositories/auth-repository";
import * as httpResponse from "../utils/http-helper";

const JWT_SECRET = process.env.JWT_SECRET || "changeme_use_env_variable";
const JWT_EXPIRES_IN = "8h";

/* =========================
   LOGIN
========================= */

export const loginService = async (body: {
  username: string;
  password: string;
}) => {
  const { username, password } = body;

  if (!username?.trim() || !password?.trim()) {
    return httpResponse.badRequest({ message: "Username and password are required" });
  }

  const auth = await AuthRepository.findByUsername(username);

  if (!auth) {
    return httpResponse.badRequest({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, auth.password);

  if (!isValid) {
    return httpResponse.badRequest({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: auth._id, username: auth.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return httpResponse.ok({ token, username: auth.username });
};

/* =========================
   SEED (cria o admin inicial)
   Chame isso uma vez para criar o usuário
========================= */

export const seedAdminService = async (username: string, password: string) => {
  const exists = await AuthRepository.authExists();

  if (exists) {
    return httpResponse.badRequest({ message: "Admin already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const auth = await AuthRepository.createAuth(username, hashed);

  return httpResponse.created({ message: "Admin created", username: auth.username });
};
