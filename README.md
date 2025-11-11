# FOSS – Next.js + Postgres starter

FOSS (Free/Open Systems for Self) is a focused personal ops hub: assets, obligations, reminders, journal entries and layout metadata live in Postgres, and the entire UI is powered by the Next.js App Router + Prisma.

## Quick start

```bash
npm install
cp .env.example .env.local           # set DATABASE_URL

npm run prisma:generate
npm run db:push                      # or: npm run db:migrate -- --name init
npm run db:seed                      # clears the database for a blank workspace

npm run dev
```

Visit `http://localhost:3000` for the dashboard. `npm run db:studio` opens Prisma Studio for CRUD.

## Data model highlights

| Table | Purpose | Notes |
| ----- | ------- | ----- |
| `users` | Future-proof multi-user support. | Default seed user `founder@foss.app`. |
| `assets` | Every liquid/illiquid holding. | `asset_type` enum, `is_liquid`, `current_value numeric(18,2)`, currency default `TRY`, optional acquisition date + notes. |
| `obligations` | Payments, legal duties, recurring responsibilities. | `category` + `frequency` enums, `next_due_date`, `end_date`, soft toggle `is_active`. |
| `reminders` | Personal tasks such as travel or health. | Drives the ÇOK ÖNEMLİ widget via `is_very_important`, optional link to an obligation. |
| `journal_entries` | Daily log / brain dump. | Optional relation to assets/obligations for context. |
| `page_layouts` | JSONB panel positions per page (`dashboard`, `assets`, `obligations`, `reminders`). | Unique per `(user_id, page_key)` so layouts are user-specific. |

Enums are defined in `prisma/schema.prisma`.

## Dashboard experience

- **Önemli Özet**: KPIs for total assets, active obligations, and “ÇOK ÖNEMLİ” reminders with lightbox details.
- **Zaman bazlı görünüm**: “Bu Hafta / Bu Ay / Bu Sene” buckets blend reminders and obligations by due date.
- **Drag & drop paneller**: Assets, obligations, reminders and journal widgets can be reordered, and the preference persists in `localStorage`.

All other routes (`/assets`, `/obligations`, `/reminders`, `/journal`, `/layouts`) read straight from Postgres via Prisma, so the UI reflects real data rather than mocks.

## Code structure

```
src/
 ├─ app/
 │   ├─ (app)/…            # Feature pages (dashboard/assets/…)
 │   └─ layout.tsx         # Fonts + metadata
 ├─ components/
 │   └─ dashboard/…        # Client widgets + summary KPIs
 ├─ lib/
 │   └─ prisma.ts          # Prisma client singleton
 └─ types/…                # (if you add more shared DTOs later)
prisma/
 ├─ schema.prisma          # Database schema
 └─ seed.ts                # Demo workspace seeder
```

Running the seed script now simply wipes every table so you can start from scratch; once `DATABASE_URL` points to a live Postgres instance, the UI is ready for your own data.
