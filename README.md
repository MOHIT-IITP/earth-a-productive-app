# earth — web-app

This repository contains a Next.js (App Router) web application at `web-app/`. It uses Next.js 15, Prisma, Tailwind CSS and several UI components under `components/`.

## Requirements

- Node.js >= 18 (use the LTS recommended for Next.js 15)
- npm (or pnpm/yarn)
- A database supported by Prisma for local development (set `DATABASE_URL` in `.env.local`)

## Quick start

1. Change into the app folder:

```bash
cd web-app
```

2. Install dependencies:

```bash
npm install
```

Note: `postinstall` runs `npx prisma generate` which generates the Prisma client.

3. Create a local environment file (required for Prisma migrations and some runtime configs):

Create `web-app/.env.local` and add at least:

```
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB?schema=public"
NEXTAUTH_SECRET=some-long-secret
# other keys your environment needs (e.g. SUPABASE_URL, SUPABASE_KEY)
```

4. Run the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

6. Start a production server (after build):

```bash
npm run start
```

## Useful scripts (from `web-app/package.json`)

- `dev` — run Next.js in development: `next dev --turbopack`
- `build` — generates Prisma client, runs Prisma migrate (reading `web-app/.env.local`) then runs `next build`
- `postinstall` — runs `npx prisma generate`
- `start` — runs `next start`
- `migrate` — shortcut for `prisma generate` + `prisma migrate dev`

Important: The `build` and `migrate` scripts assume a `.env.local` file exists and are implemented by injecting the environment via `env $(cat .env.local | xargs)`. Ensure your `.env.local` has no spaces or complex shell-breaking characters or use an alternative way to provide env vars (CI secrets, export, etc.).

## Key folders

- `app/` — Next.js App Router routes and pages.
- `auth/` — authentication helpers (client & server code).
- `components/` — UI components used across the app.
- `db/` — Prisma schema and migrations (schema at `db/schema.prisma`).
- `public/` — static assets.
- `lib/` — app utilities.

## Prisma notes

- The project uses Prisma. After changing `schema.prisma` run:

```bash
npx prisma generate
npx prisma migrate dev
```

Make sure `DATABASE_URL` is set in `web-app/.env.local` before running migrations.

## Contributing

File a PR with a descriptive title and include steps to reproduce any bug. If you update Prisma schema include migration files.

## License

This repository does not include a LICENSE file. Add one if you intend to publish or share this project publicly.

---

If you'd like, I can also add a small `README` inside `web-app/` that shows only commands scoped to that folder, or create an `.env.example` template. Tell me which you'd prefer.
