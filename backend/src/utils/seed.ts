import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const URI = process.env.MONGODB_URI;
if (!URI) { console.error("❌ MONGODB_URI not set in .env"); process.exit(1); }

// Inline schemas to avoid circular deps
const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: "customer" } }, { timestamps: true });
const ProdSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, category: String, type: String, price: Number, description: String, thc: Number, rating: Number, reviewCount: Number, stock: Number, images: [{ url: String, public_id: String }], isActive: { type: Boolean, default: true }, isFeatured: { type: Boolean, default: false } }, { timestamps: true });

const User    = mongoose.model("User",    UserSchema);
const Product = mongoose.model("Product", ProdSchema);

const PRODUCTS = [
  { name: "Ghost OG",              slug: "ghost-og",          category: "Indica", type: "flowers",      price: 45, thc: 28, rating: 4.9, stock: 50, reviewCount: 180, isFeatured: true,  description: "Strong citrus notes with long-lasting physical relaxation. Perfect evening strain.",  images: [{ url: "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&q=80", public_id: "" }] },
  { name: "Durban Poison",         slug: "durban-poison",     category: "Sativa", type: "flowers",      price: 52, thc: 22, rating: 4.7, stock: 40, reviewCount: 142, isFeatured: true,  description: "Pure Sativa energy. Perfect for daytime focus and creative breakthroughs.",          images: [{ url: "https://images.unsplash.com/photo-1498019559366-a1cbd07b5160?w=600&q=80", public_id: "" }] },
  { name: "Gelato 41",             slug: "gelato-41",         category: "Hybrid", type: "flowers",      price: 60, thc: 26, rating: 5.0, stock: 30, reviewCount: 220, isFeatured: true,  description: "Dessert-like aroma with a balanced high that hits both mind and body.",              images: [{ url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80", public_id: "" }] },
  { name: "Purple Punch",          slug: "purple-punch",      category: "Indica", type: "flowers",      price: 48, thc: 24, rating: 4.8, stock: 35, reviewCount: 165, isFeatured: false, description: "Heavy sedating effects with grape and berry notes. The ultimate nightcap.",            images: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", public_id: "" }] },
  { name: "Jack Herer",            slug: "jack-herer",        category: "Sativa", type: "flowers",      price: 42, thc: 20, rating: 4.6, stock: 45, reviewCount: 130, isFeatured: false, description: "A legend. Uplifting, cerebral, and famously pine-scented.",                          images: [{ url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&q=80", public_id: "" }] },
  { name: "Wedding Cake",          slug: "wedding-cake",      category: "Hybrid", type: "flowers",      price: 55, thc: 30, rating: 4.9, stock: 28, reviewCount: 195, isFeatured: false, description: "Sweet and tangy with high THC potency. Excellent for relaxation and relief.",         images: [{ url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80", public_id: "" }] },
  { name: "Mango Gummies 100mg",   slug: "mango-gummies",     category: "Hybrid", type: "edibles",      price: 35, thc: 10, rating: 4.7, stock: 60, reviewCount: 110, isFeatured: false, description: "Tropical mango flavor with smooth long-lasting euphoria. 10 gummies per pack.",      images: [{ url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&q=80", public_id: "" }] },
  { name: "Dark Chocolate Bar",    slug: "dark-choc",         category: "Indica", type: "edibles",      price: 28, thc: 5,  rating: 4.8, stock: 80, reviewCount: 88,  isFeatured: false, description: "72% dark chocolate infused with premium cannabis extract. Perfect for evenings.",    images: [{ url: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&q=80", public_id: "" }] },
  { name: "Lemon Drop Mints",      slug: "lemon-mints",       category: "Sativa", type: "edibles",      price: 22, thc: 2.5,rating: 4.5, stock: 100,reviewCount: 72,  isFeatured: false, description: "Refreshing citrus mints with a subtle clear-headed lift. Discreet dosing.",          images: [{ url: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600&q=80", public_id: "" }] },
  { name: "Blue Dream Wax",        slug: "blue-dream-wax",    category: "Sativa", type: "concentrates", price: 80, thc: 75, rating: 4.8, stock: 20, reviewCount: 95,  isFeatured: false, description: "High-purity Blue Dream wax. Smooth vapour with sweet berry undertones.",            images: [{ url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", public_id: "" }] },
  { name: "OG Kush Shatter",       slug: "og-kush-shatter",   category: "Indica", type: "concentrates", price: 90, thc: 82, rating: 4.9, stock: 15, reviewCount: 118, isFeatured: false, description: "Crystal-clear full-spectrum shatter preserving all original terpenes.",              images: [{ url: "https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=600&q=80", public_id: "" }] },
  { name: "Gelato Live Resin Cart",slug: "gelato-live-resin", category: "Hybrid", type: "concentrates", price: 70, thc: 88, rating: 4.7, stock: 25, reviewCount: 84,  isFeatured: false, description: "Premium live resin vape cartridge. Exceptional flavor and potency.",               images: [{ url: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=600&q=80", public_id: "" }] },
];

async function seed() {
  console.log("\n🌱 Connecting to MongoDB...");
  await mongoose.connect(URI as string);
  console.log("✅ Connected!\n");

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || "smokablunt4you@gmail.com";
  const adminPass  = process.env.ADMIN_PASSWORD || "Admin@1234";
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    await User.create({ name: "Admin", email: adminEmail, password: await bcrypt.hash(adminPass, 12), role: "admin" });
    console.log(`✅ Admin created\n   Email:    ${adminEmail}\n   Password: ${adminPass}`);
  } else {
    await User.updateOne({ email: adminEmail }, { role: "admin" });
    console.log(`✅ Admin confirmed: ${adminEmail}`);
  }

  // Seed products
  let created = 0, skipped = 0;
  for (const p of PRODUCTS) {
    if (!await Product.findOne({ slug: p.slug })) { await Product.create(p); created++; }
    else skipped++;
  }
  console.log(`✅ Products: ${created} created, ${skipped} already existed`);
  console.log(`\n🎉 Seed complete!`);
  console.log(`   Frontend: http://localhost:3000`);
  console.log(`   Admin:    http://localhost:3000/admin/login`);
  console.log(`   API:      http://localhost:5000/api/health\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error("❌ Seed error:", e); process.exit(1); });
