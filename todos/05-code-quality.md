# Code Quality & Patterns (Low Priority)

## Navigation

- [x] Fix `<Link href="/signup">` in LoginScreen and `<Link href="/login">` in SignUpScreen to use React Router navigation (currently causes full page reload)

## Component Extraction

- [x] Extract shared `CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}` override into MuiCardContent theme override in theme.ts
- [x] Consider extracting `ChartCard` wrapper component for chart empty-state pattern
- [x] Remove dead `trend`/`trendLabel` props from KpiCard (never used by any caller)

## DashboardService Structure

- [x] Consider moving hooks out of services/ into hooks/ directory for SRP
- [x] Add JSDoc to DashboardService methods (matching AuthService convention)

## Type Safety

- [x] Generate Supabase types with `supabase gen types typescript` for end-to-end type safety (requires linking Supabase project locally)
- [x] Remove unnecessary `as const` on `textTransform: 'none'` in theme.ts

## Sidebar

- [x] Change NAV_ITEMS to store icon component references instead of JSX instances at module scope
- [x] Add guard to skip navigation when clicking the current route

## Sign-Out UX

- [x] Add loading state to sign-out button to prevent double-click

## Future: State Management

- [ ] Consider TanStack Query (React Query) when app needs shared data across routes, optimistic updates, or cache invalidation

## Sources

- Pattern Recognition review (multiple items)
- Code Simplicity review (#1, #10)
- Frontend Races review (P3, P4)
- Architecture Strategist review (R4, R8, R11)
