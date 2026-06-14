import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "admin" | "customer";
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const S = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone:    { type: String, trim: true },
    role:     { type: String, enum: ["admin", "customer"], default: "customer" },
  },
  { timestamps: true }
);

S.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

S.methods.comparePassword = function (c: string) {
  return bcrypt.compare(c, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>("User", S);
