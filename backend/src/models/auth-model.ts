import { Schema, model, InferSchemaType } from "mongoose";

const authSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type Auth = InferSchemaType<typeof authSchema>;

export const AuthModel = model("Auth", authSchema);
