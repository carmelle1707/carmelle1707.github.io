import { Schema } from "mongoose";

export const mediaField = {
  type: new Schema(
    { url: { type: String, required: true }, pathname: { type: String, default: "" } },
    { _id: false },
  ),
  default: null,
};

/** Options communes : dates automatiques, pas de champ __v. */
export const baseOptions = { timestamps: true, versionKey: false } as const;
