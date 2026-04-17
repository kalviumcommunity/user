# CorpAuth — Auth Response Challenge: Solution

## What This Is
The reference solution for the CorpAuth auth response challenge. This repo shows the fixed implementation: all auth endpoints trimmed to minimum necessary data, JWT payload minimal, response mappers applied consistently.

## What Was Fixed
- **Signup:** `RETURNING *` still used in the query, but `toAuthUser` strips all sensitive fields before the response is sent.
- **Login:** JWT now contains only `userId` and `role`. `toAuthUser` applied to response body.
- **Profile:** `toProfileUser` applied. Includes plan and timestamps; excludes all sensitive fields.

## Key Files
- `mappers/response-mappers.js` — all safe user shapes defined here
- `Changes.md` — field-by-field audit of every removal, written before code changes
- `routes/auth.js` — all three auth routes using mappers

## Getting Started
```bash
npm install
cp .env.example .env
# Add DATABASE_URL, JWT_SECRET, PORT to .env
psql -d your_db -f db/schema.sql
psql -d your_db -f db/seed.sql
npm start
```

## Test Credentials
- **Admin:** `admin@corpauth.dev` / `password123`
- **Manager:** `manager@corpauth.dev` / `password123`
- **User:** `user@corpauth.dev` / `password123`

## Live Deployment
`[Add your deployed URL here]`

## The Core Principle
A response mapper is a contract. If a field is not in the mapper, it cannot leave the server — regardless of what columns are added to the DB in the future. This is safer than trying to exclude fields one by one. Inclusive by intent, not exclusive by luck.
# user
