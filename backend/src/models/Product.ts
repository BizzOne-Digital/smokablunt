import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  type: string;
  price: number;
  description: string;
  thc: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: { url: string; public_id: string }[];
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  salePrice: number;
  amounts: { label: string; price: number }[];
  createdAt: Date;
  updatedAt: Date;
}

// All types and categories accepted — no enum restriction

const S = new Schema<IProduct>(
  {
    name:        { type: String, default: "" },
    slug:        { type: String, unique: true, sparse: true, lowercase: true },
    category:    { type: String, default: "Other" },
    type:        { type: String, default: "flowers" },
    price:       { type: Number, default: 0 },
    description: { type: String, default: "" },
    thc:         { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    stock:       { type: Number, default: 0 },
    images:      [{ url: String, public_id: String }],
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    onSale:      { type: Boolean, default: false },
    salePrice:   { type: Number, default: 0 },
    amounts:     [{ label: { type: String }, price: { type: Number, default: 0 } }],
  },
  { timestamps: true }
);

S.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  next();
});

// Clear model cache so changes apply on hot reload
if (mongoose.models.Product) delete (mongoose.models as any).Product;
export default mongoose.model<IProduct>("Product", S);