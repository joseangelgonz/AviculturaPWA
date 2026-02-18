# Form Patterns & Shared Abstractions (Nice-to-Have)

From code review of PR #9 (feat/operario-frontend).

## Duplicated Form Boilerplate

All four operario forms (AlimentacionForm, ClasificacionForm, MortalidadForm, RecoleccionForm) share ~30 lines of identical boilerplate each:

- [x] Extract shared loading spinner into a `FormShell` wrapper component that handles the galpon guard, loading states, and Paper container
- [x] Extract shared `useFormSubmit()` hook encapsulating `loading`, `message`, and the try/catch/finally pattern
- [x] Extract shared `SubmitButton` component with loading indicator pattern

## Numeric Input Upper Bounds

- [x] Add reasonable `max` values to numeric inputs — mortality (10,000), egg count (100,000), feed amount (9,999 bultos)

## No Correction/Void Mechanism

- [ ] All forms warn "no podras modificar el registro" — consider adding a `voidEntry` or `addCorrection` service method for erroneous records, even if the underlying implementation appends a reversal rather than deleting

## Sources

- Architecture Strategist (finding R6)
- Code Simplicity Reviewer (findings #3, #8)
- Security Sentinel (finding #7)
- Agent-Native Reviewer (finding #7)
