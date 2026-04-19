import { Schema, model, InferSchemaType } from "mongoose";
import { Types } from "mongoose";

const appointmentSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    procedure: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 0.01,
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

appointmentSchema.index({ client: 1 });
appointmentSchema.index({ employee: 1 });
appointmentSchema.index({ employee: 1, createdAt: -1 });

/* =========================
   TYPES
========================= */

export type Appointment = InferSchemaType<typeof appointmentSchema> & {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

/* =========================
   MODEL
========================= */

export const AppointmentModel = model("Appointment", appointmentSchema);
