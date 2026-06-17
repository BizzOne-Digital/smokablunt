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
  amounts: { label: string; price: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const TYPES      = ["flowers","pre-rolls","concentrates","edibles","accessories","sale","promo"];
const CATEGORIES = [
  // flowers / pre-rolls
  "Indica","Sativa","Hybrid","Mixed",
  // concentrates
  "Shatter","Wax","Live Resin","Hash","Distillate",
  // edibles
  "Gummies","Chocolate","Beverage","Capsule",
  // accessories
  "Vaporizer","Pipe","Papers","Grinder",
  // generic
  "Other",
];

const S = new Schema<IProduct>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    category:    { type: String, enum: CATEGORIES, required: true },
    type:        { type: String, enum: TYPES, required: true },
    price:       { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    thc:         { type: Number, default: 0 },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    stock:       { type: Number, default: 0, min: 0 },
    images:      [{ url: String, public_id: String }],
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    onSale:      { type: Boolean, default: false },
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