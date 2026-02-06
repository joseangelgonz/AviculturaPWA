# Performance & Bundle Optimization (Low Priority)

## Code Splitting

- [ ] Lazy-load chart components with `React.lazy()` — moves ~40-80KB of @mui/x-charts out of initial bundle
- [ ] Add route-level code splitting for future screens (Produccion, Galpones, etc.)

## Font Loading

- [ ] Self-host Inter font via `@fontsource/inter` — eliminates external Google Fonts request, enables offline PWA support

## Component Optimization

- [ ] Add `React.memo` to ProductionChart and EggClassificationChart to prevent unnecessary SVG recalculations
- [ ] Add `useMemo` for chart data transformations (low priority — negligible at current data scale)

## Database

- [ ] Verify composite index on `produccion(corte_id, fecha)` exists — prevents sequential scan as table grows
- [ ] Monitor `.in('corte_id', corteIds)` URL length — will hit limits at ~100+ active cortes

## Sources

- Performance Oracle review (OPT-2, OPT-3, OPT-4, OPT-5, OPT-6)
- Architecture Strategist review (R9)
