import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  customer:    mongoose.Types.ObjectId | null;
  customerInfo: { name: string; email: string; phone: string };
  deliveryAddress: { street: string; city: string; zip: string; notes?: string };
  items: { product: string; name: string; image: string; price: number; quantity: number }[];
  subtotal:      number;
  deliveryFee:   number;
  total:         number;
  paymentMethod: "cash" | "etransfer" | "n/a";
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  statusNote?: string;
  statusHistory: { status: string; note?: string; at: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const S = new Schema<IOrder>(
  {
    orderNumber: {
      type: String, unique: true,
      default: () => "SB-" + Date.now().toString(36).toUpperCase(),
    },
    customer:    { type: Schema.Types.ObjectId, ref: "User", default: null },
    customerInfo: {
      name:  { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city:   { type: String, required: true },
      zip:    { type: String, required: true },
      notes:  String,
    },
    items: [{
      product:  String,
      name:     { type: String, required: true },
      image:    String,
      price:    { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    }],
    subtotal:      { type: Number, required: true },
    deliveryFee:   { type: Number, default: 5 },
    total:         { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "etransfer", "n/a"], default: "n/a" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    statusNote:    String,
    statusHistory: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", S);