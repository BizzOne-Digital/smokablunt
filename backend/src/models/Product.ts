import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: "Indica" | "Sativa" | "Hybrid";
  type: "flowers" | "edibles" | "concentrates" | "accessories";
  price: number;
  description: string;
  thc: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: { url: string; public_id: string }[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const S = new Schema<IProduct>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    category:    { type: String, enum: ["Indica", "Sativa", "Hybrid"], required: true },
    type:        { type: String, enum: ["flowers", "edibles", "concentrates", "accessories"], required: true },
    price:       { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    thc:         { type: Number, default: 0 },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    stock:       { type: Number, default: 0, min: 0 },
    images:      [{ url: String, public_id: String }],
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

S.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  next();
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", S);
