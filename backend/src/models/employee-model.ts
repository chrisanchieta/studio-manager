import { Schema, model, InferSchemaType } from "mongoose";
import { Types } from "mongoose";

const employeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    commission: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      set: (value: number) => {
        const parsed = Number(value);
        return isNaN(parsed) ? 0 : Number(parsed.toFixed(2));
      },
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

employeeSchema.index({ name: 1 });

/* =========================
   TYPES
========================= */

export type Employee = InferSchemaType<typeof employeeSchema> & {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

/* =========================
   MODEL
========================= */

export const EmployeeModel = model("Employee", employeeSchema);
