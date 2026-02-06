# Role-Based Access Control (High Priority)

Currently both `administrador` and `operario` see the same dashboard and routes.

## Route Guards

- [ ] Create a `RoleGuard` component that checks `auth.role` and redirects unauthorized users
- [ ] Apply role guard to admin-only routes (`/fincas`, `/reportes`, etc.)
- [ ] Conditionally render sidebar navigation items based on role

## Auth Context Improvements

- [ ] Expose `signOut` through AuthContext instead of importing AuthService directly in DashboardLayout
- [ ] Consider throwing from `useAuth()` when used outside provider (instead of silent fallback to loading)

## Sources

- Security Sentinel review (H2, H3)
- Architecture Strategist review (R6, R10)
