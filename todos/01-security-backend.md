# Security & Backend (High Priority)

These items require Supabase dashboard configuration and SQL policies.

## RLS Policies (Critical)

- [ ] Implement Row-Level Security on `cortes` table — restrict SELECT to rows belonging to authenticated user's farm(s)
- [ ] Implement RLS on `produccion` table — scope by corte ownership chain (corte → galpon → finca → user)
- [ ] Implement RLS on `galpones`, `fincas`, `profiles` tables
- [ ] Verify RLS is enabled (not just policies created) on all tables

## Registration Controls (High)

- [ ] Disable open public signup in Supabase Auth settings, OR
- [ ] Implement invite-only registration flow (admin creates accounts for operators)
- [x] Add password strength validation on signup form

## Auth Hardening (Medium)

- [x] Replace `getSession()` with `getUser()` for initial auth check in App.tsx (getSession reads localStorage without server validation)
- [x] Map Supabase error messages to generic user-facing messages in LoginScreen/SignUpScreen (prevents email enumeration)
- [x] Verify composite database index exists on `produccion(corte_id, fecha)` — migration created in `db_migrations/05_add_index_and_rls_policies.sql`

## Sources

- Security Sentinel review (agent ab9d447)
- Performance Oracle review (agent aa994c0)
