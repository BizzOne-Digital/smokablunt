import nodemailer from "nodemailer";

// Log env status on startup for debugging
const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || "";
const ADMIN_EMAIL = process.env.CONTACT_RECIPIENT || GMAIL_USER;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.warn("⚠️  EMAIL: GMAIL_USER or GMAIL_APP_PASSWORD not set — emails will be skipped.");
} else {
  console.log(`✅ EMAIL: Configured as ${GMAIL_USER} → admin: ${ADMIN_EMAIL}`);
}

// Reuse single transporter instance
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

const FROM  = `"Smokablunt" <${GMAIL_USER}>`;

const wrap = (title: string, body: string) => `
<div style="font-family:Inter,sans-serif;background:#111;color:#f4f4f4;padding:40px;max-width:600px;margin:0 auto;border-radius:12px;">
  <div style="border-bottom:2px solid #10b981;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="margin:0;color:#10b981;font-size:26px;font-family:Montserrat,sans-serif;">Smokablunt</h1>
    <p style="margin:4px 0 0;color:#6b7b6e;font-size:13px;">Premium Online Dispensary</p>
  </div>
  <h2 style="font-size:18px;margin-bottom:20px;color:#f4f4f4;">${title}</h2>
  ${body}
  <p style="color:#6b7b6e;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #2a3a2e;">
    © 2025 Smokablunt · 19+ Only · Enjoy Responsibly
  </p>
</div>`;

const row = (l: string, v: string) =>
  `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #2a3a2e;color:#6b7b6e;font-size:12px;text-transform:uppercase;letter-spacing:.05em;width:110px;vertical-align:top;">${l}</td>
    <td style="padding:9px 0;border-bottom:1px solid #2a3a2e;color:#f4f4f4;font-size:14px;">${v}</td>
  </tr>`;

async function send(opts: nodemailer.SendMailOptions) {
  if (!GMAIL_USER || !GMAIL_PASS) {
    console.log("📧 EMAIL SKIPPED (no credentials):", opts.subject);
    return;
  }
  try {
    const info = await transporter.sendMail(opts);
    console.log(`✅ EMAIL SENT: ${opts.subject} → ${opts.to} [${info.messageId}]`);
  } catch (err: any) {
    console.error(`❌ EMAIL FAILED: ${opts.subject} → ${opts.to}`, err.message);
    // Rethrow so caller can handle
    throw err;
  }
}

// ── Order confirmed → customer ──────────────────────────────
export async function sendOrderConfirmation(o: {
  orderNumber: string; customerName: string; customerEmail: string;
  items: { name: string; qty: number; price: number; amount?: string }[];
  total: number; address: string; payment: string;
}) {
  const lines = o.items.map(i =>
    `<tr>
      <td style="padding:6px 0;color:#a3b3a8;font-size:13px;">${i.name}${i.amount ? ` (${i.amount})` : ""} ×${i.qty}</td>
      <td style="padding:6px 0;color:#10b981;font-size:13px;text-align:right;font-weight:700;">${(i.price * i.qty).toFixed(2)}</td>
    </tr>`
  ).join("");

  const body = `
  <p style="color:#a3b3a8;margin-bottom:20px;">Hi ${o.customerName}, your order is confirmed! 🌿</p>
  <table style="width:100%;border-collapse:collapse;">
    ${row("Order #", o.orderNumber)}${row("Deliver to", o.address)}${row("Payment", "N/A")}
  </table>
  <table style="width:100%;border-collapse:collapse;margin-top:16px;">${lines}</table>
  <div style="background:#1a1a1a;border-radius:8px;padding:14px;margin-top:12px;display:flex;justify-content:space-between;">
    <span style="color:#a3b3a8;">Total</span>
    <span style="color:#10b981;font-size:20px;font-weight:700;">${o.total.toFixed(2)}</span>
  </div>
  <div style="background:#0d2018;border:1px solid #065f46;border-radius:8px;padding:14px;margin-top:16px;">
    <p style="color:#a3b3a8;margin:0;font-size:13px;">🌿 Same day delivery. We will be in touch shortly.</p>
  </div>`;

  await send({
    from: FROM, to: o.customerEmail,
    subject: `✅ Order Confirmed #${o.orderNumber} — Smokablunt`,
    html: wrap("Your Order is Confirmed! 🌿", body),
  });
}

// ── New order → admin ───────────────────────────────────────
export async function sendAdminOrderAlert(o: {
  orderNumber: string; customerName: string; customerEmail: string;
  customerPhone: string; items: { name: string; qty: number; price: number; amount?: string }[];
  total: number; address: string; payment: string; notes?: string;
}) {
  const lines = o.items.map(i =>
    `<tr>
      <td style="padding:6px 0;color:#a3b3a8;font-size:13px;border-bottom:1px solid #2a3a2e;">${i.name}${i.amount ? ` (${i.amount})` : ""} ×${i.qty}</td>
      <td style="padding:6px 0;color:#10b981;font-size:13px;text-align:right;border-bottom:1px solid #2a3a2e;">${(i.price * i.qty).toFixed(2)}</td>
    </tr>`
  ).join("");

  const body = `
  <div style="background:#10b981;color:#003824;padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:20px;font-weight:700;">
    🛒 New Order — ${o.total.toFixed(2)}
  </div>
  <table style="width:100%;border-collapse:collapse;">
    ${row("Order #",  o.orderNumber)}
    ${row("Customer", o.customerName)}
    ${row("Phone",    `<a href="tel:${o.customerPhone}" style="color:#10b981;">${o.customerPhone}</a>`)}
    ${row("Email",    o.customerEmail)}
    ${row("Address",  o.address)}
    ${row("Payment",  "N/A")}
    ${o.notes ? row("Notes", o.notes) : ""}
  </table>
  <table style="width:100%;border-collapse:collapse;margin-top:16px;">${lines}</table>
  <div style="text-align:right;margin-top:12px;">
    <span style="color:#10b981;font-size:22px;font-weight:700;">Total: ${o.total.toFixed(2)}</span>
  </div>`;

  await send({
    from: FROM, to: ADMIN_EMAIL,
    subject: `🛒 NEW ORDER #${o.orderNumber} — ${o.customerName} — ${o.total.toFixed(2)}`,
    html: wrap("New Order Received", body),
  });
}

// ── Status update → customer ────────────────────────────────
export async function sendStatusUpdate(o: {
  orderNumber: string; customerName: string; customerEmail: string;
  status: string; note?: string;
}) {
  const map: Record<string, { e: string; m: string; c: string }> = {
    confirmed:        { e: "✅", m: "Your order is confirmed and being prepared.", c: "#10b981" },
    preparing:        { e: "🌿", m: "We are carefully preparing your order right now.", c: "#10b981" },
    out_for_delivery: { e: "🚗", m: "Your order is on the way! Have your ID ready.", c: "#f59e0b" },
    delivered:        { e: "🎉", m: "Your order has been delivered. Enjoy responsibly!", c: "#10b981" },
    cancelled:        { e: "❌", m: "Your order has been cancelled. Contact us for help.", c: "#ef4444" },
  };
  const s = map[o.status] || { e: "📦", m: `Status updated to: ${o.status}`, c: "#10b981" };

  const body = `
  <p style="color:#a3b3a8;">Hi ${o.customerName},</p>
  <div style="background:#1a1a1a;border:2px solid ${s.c};border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
    <div style="font-size:48px;margin-bottom:10px;">${s.e}</div>
    <h3 style="color:${s.c};margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em;">${o.status.replace(/_/g, " ")}</h3>
    <p style="color:#f4f4f4;margin:0;">${s.m}</p>
    ${o.note ? `<p style="color:#a3b3a8;margin:12px 0 0;font-size:13px;font-style:italic;">${o.note}</p>` : ""}
  </div>
  <table style="width:100%;border-collapse:collapse;">${row("Order #", o.orderNumber)}</table>`;

  await send({
    from: FROM, to: o.customerEmail,
    subject: `${s.e} Order #${o.orderNumber} — ${o.status.replace(/_/g, " ")}`,
    html: wrap("Order Status Update", body),
  });
}

// ── Contact form → admin ─────────────────────────────────────
export async function sendContactEmail(d: {
  name: string; email: string; phone?: string; message: string;
}) {
  const body = `
  <table style="width:100%;border-collapse:collapse;">
    ${row("Name", d.name)}
    ${row("Email", `<a href="mailto:${d.email}" style="color:#10b981;">${d.email}</a>`)}
    ${d.phone ? row("Phone", `<a href="tel:${d.phone}" style="color:#10b981;">${d.phone}</a>`) : ""}
    ${row("Message", d.message.replace(/\n/g, "<br>"))}
  </table>
  <div style="margin-top:20px;padding:14px;background:#1a1a1a;border-left:4px solid #10b981;border-radius:4px;">
    <p style="color:#6b7b6e;font-size:12px;margin:0;">Reply to this email to respond to ${d.name} directly.</p>
  </div>`;

  await send({
    from: FROM, to: ADMIN_EMAIL, replyTo: d.email,
    subject: `📬 Contact from ${d.name} — Smokablunt`,
    html: wrap("New Contact Message", body),
  });
}