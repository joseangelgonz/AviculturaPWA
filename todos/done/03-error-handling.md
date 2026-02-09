# Error Handling & Resilience (Medium Priority)

## Error Boundaries

- [x] Add top-level React Error Boundary around `<Routes>` in App.tsx to prevent white-screen crashes
- [x] Add per-section error boundary around chart components (most likely to throw from data shape mismatches)

## Auth Error Handling

- [x] Fix `catch (err: any)` in LoginScreen.tsx and SignUpScreen.tsx — use `catch (err: unknown)` with proper narrowing
- [x] Remove `console.error` in DashboardLayout signOut handler (or replace with telemetry service)

## Sources

- Architecture Strategist review (R1, R2)
- TypeScript Reviewer (NB5)
- Pattern Recognition (5.1)
