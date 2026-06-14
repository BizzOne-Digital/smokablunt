# Smokablunt – Vercel Deployment Guide

## Project Structure

```
smokablunt/
├── backend/     → Deploy as separate Vercel project
└── frontend/    → Deploy as separate Vercel project
```

---

## STEP 1 – Deploy Backend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo (or upload the `backend/` folder)
3. Set **Root Directory** to `backend`
4. Add these **Environment Variables** in Vercel dashboard:

| Variable | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://bizzone:bizzone@cluster0.bwpdzae.mongodb.net/smokabluntt?retryWrites=true&w=majority` |
| `JWT_SECRET` | your secret key |
| `GMAIL_USER` | `smokablunt4you@gmail.com` |
| `GMAIL_APP_PASSWORD` | your Gmail app password |
| `CONTACT_RECIPIENT` | `smokablunt4you@gmail.com` |
| `CLOUDINARY_CLOUD_NAME` | your cloudinary name |
| `CLOUDINARY_API_KEY` | your cloudinary key |
| `CLOUDINARY_API_SECRET` | your cloudinary secret |
| `ADMIN_EMAIL` | `smokablunt4you@gmail.com` |
| `ADMIN_PASSWORD` | `Admin@1234` |
| `FRONTEND_URL` | (add after frontend deployed, e.g. `https://smokablunt.vercel.app`) |

5. Deploy → You'll get a URL like `https://smokablunt-api.vercel.app`

---

## STEP 2 – Deploy Frontend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Set **Root Directory** to `frontend`
3. Add this **Environment Variable**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://smokablunt-api.vercel.app/api` ← your backend URL from Step 1 |

4. Deploy → You'll get frontend URL

---

## STEP 3 – Final Step

Go back to your **Backend** project in Vercel → Settings → Environment Variables → Update `FRONTEND_URL` to your frontend URL → **Redeploy**.

---

## Notes
- Auth uses `Bearer` token stored in `localStorage` (works cross-domain on Vercel)
- MongoDB Atlas: make sure IP `0.0.0.0/0` is whitelisted in Network Access
- Cloudinary: set up your account at cloudinary.com for product image uploads
