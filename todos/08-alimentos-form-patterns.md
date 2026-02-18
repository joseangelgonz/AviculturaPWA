# Form Patterns & Shared Abstractions (Nice-to-Have)

From code review of PR #9 (feat/operario-frontend).

## Duplicated Form Boilerplate

All four operario forms (AlimentacionForm, ClasificacionForm, MortalidadForm, RecoleccionForm) share ~30 lines of identical boilerplate each:

- [ ] Extract shared loading spinner into a `FormShell` wrapper component that handles the galpon guard, loading states, and Paper container
- [ ] Extract shared `useFormSubmit()` hook encapsulating `loading`, `message`, and the try/catch/finally pattern
- [ ] Extract shared `SubmitButton` component with loading indicator pattern

## Numeric Input Upper Bounds

- [ ] Add reasonable `max` values to numeric inputs — currently no upper bound on mortality count, egg count, or feed amount. Consider validating mortality count against galpon's `saldo_aves`

## No Correction/Void Mechanism

- [ ] All forms warn "no podras modificar el registro" — consider adding a `voidEntry` or `addCorrection` service method for erroneous records, even if the underlying implementation appends a reversal rather than deleting

## Sources

- Architecture Strategist (finding R6)
- Code Simplicity Reviewer (findings #3, #8)
- Security Sentinel (finding #7)
- Agent-Native Reviewer (finding #7)
