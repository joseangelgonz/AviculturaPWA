# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AviculturaPWA is a poultry farm management PWA migrated from a native Android app. It tracks farms (fincas), poultry houses (galpones), production batches (cortes), and daily egg production records (produccion). The UI and codebase are in Spanish.

## Commands

- `npm run dev` — Start dev server (Vite, exposed on 0.0.0.0)
- `npm run build` — Type-check with `tsc -b` then build with Vite
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview production build locally

## Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **MUI (Material-UI v7)** with dark theme, using `@emotion/react` / `@emotion/styled`
- **Supabase** for auth and PostgreSQL database (client in `src/services/supabaseClient.ts`)
- **React Router v7** (BrowserRouter in `main.tsx`, routes in `App.tsx`)
- Deployed on **Vercel** with SPA fallback rewrites (`vercel.json`)

## Architecture

### Routing & Auth Flow
`App.tsx` is the routing root. It fetches the Supabase session on mount and subscribes to auth state changes. Routes are protected: unauthenticated users are redirected to `/login`, authenticated users are redirected away from `/login` and `/signup` to `/`.

### Key Directories
- `src/models/` — TypeScript interfaces mirroring Supabase tables (Finca, Galpon, Corte, Produccion, Usuario)
- `src/screens/` — Page-level components (LoginScreen, SignUpScreen, HomeScreen)
- `src/services/` — Backend integration: `supabaseClient.ts` (singleton client), `AuthService.ts` (auth methods)

### Data Model (Supabase PostgreSQL)
Hierarchy: **Finca** → **Galpon** → **Corte** → **Produccion** (each level references the parent via foreign key). The `profiles` table extends `auth.users` with a `role` field (`'administrador'` | `'operario'`). The `operario_galpones` join table assigns galpones to operarios. All tables have Row Level Security (RLS) — admins have full access, operarios only see/manage their assigned galpones. Full schema is in `database_schema.md`.

### Produccion Fields
Daily production tracks eggs by classification: `huevos_y`, `huevos_aaa`, `huevos_aa`, `huevos_a`, `huevos_b`, `huevos_c`, `huevos_blancos`, plus `alimento` (feed in kg) and `muertes` (deaths).

## Environment Variables

Supabase credentials are in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Vite prefix required for client-side access).

## Conventions

- UI text and code comments are in **Spanish**
- MUI components are used throughout — follow existing patterns when adding new screens
- Auth is handled through `AuthService` (not direct Supabase calls from components)
- Data interfaces in `src/models/` use `snake_case` field names matching Supabase column names
