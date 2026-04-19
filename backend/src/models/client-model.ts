import { Schema, model, InferSchemaType } from "mongoose";
import { Types } from "mongoose";

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 20,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================
   INDEXES
========================= */

clientSchema.index({ name: 1 });
clientSchema.index({ phone: 1 }, { unique: true });

/* =========================
   TYPES
========================= */

export type Client = InferSchemaType<typeof clientSchema> & {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

/* =========================
   MODEL
========================= */

export const ClientModel = model("Client", clientSchema);
