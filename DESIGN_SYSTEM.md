# Avicultura UI Design System

This design system is intentionally simple: one brand accent, warm neutrals, and semantic states for feedback and risk.

## 1) Principles

- Keep one brand accent (`primary`) for identity and positive navigation emphasis.
- Keep `error` as semantic destructive intent (never as a second brand accent).
- Prefer compact-balanced density: fast scanning, no visual noise.
- Use semantic intent for status (`success`, `warning`, `error`, `info`), not arbitrary colors.

## 2) Core Tokens

Defined in `/Users/sebastiangr/AviculturaPWA/src/theme.ts` and exposed as CSS vars in `MuiCssBaseline`.

- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32` px
- Radius scale (reduced for better fit at full width, avoids overflow):
- `--ds-radius-sm`: `6px`
- `--ds-radius-md`: `8px`
- `--ds-radius-lg`: `10px`

## 3) Action Tokens

- `--ds-action-hover`
- `--ds-action-selected`
- `--ds-action-pressed`
- `--ds-action-focus-ring`
- `--ds-action-disabled-bg`

Usage:

- Hover: subtle feedback only, no layout shift.
- Selected: persistent active state (nav items, toggles).
- Pressed: stronger than selected for active interactions.
- Focus ring: always visible for keyboard navigation.
- Disabled: use disabled background/text tokens, never low-contrast hacks.

## 4) Semantic Intents

Semantic color families are mapped to `palette.success`, `palette.warning`, `palette.error`, `palette.info`.

- `success`: positive confirmations
- `warning`: caution, partial risk
- `error` (destructive): delete, irreversible actions, failures
- `info`: neutral guidance

Each intent has:

- Main text/icon color
- Surface background token
- Border token

## 5) Action Hierarchy

Use this order for decisions and CTA prominence:

1. `Primary` (`contained`, `color="primary"`)
2. `Secondary` (`outlined`, usually neutral actions)
3. `Tertiary` (`text`, low-emphasis actions)
4. `Destructive` (`color="error"` with `contained|outlined|text` as needed)

Rules:

- Only one primary CTA per section/card.
- If an action can cause data loss, use `color="error"`.
- Never style destructive actions with `primary`.

## 6) Component Rules

- Buttons: keep consistent sizes and use default theme overrides.
- Inputs: outlined + focus ring from action tokens.
- Alerts: use semantic outlined variants (already themed).
- Cards/Papers: neutral surfaces with subtle border/elevation.
- Nav items: selected/hover/focus from action tokens.

## 7) Quick Implementation Checklist

- Does this screen have exactly one clear primary action?
- Are destructive actions explicitly `error`?
- Are keyboard focus states visible?
- Are status colors semantic (success/warning/error/info)?
- Are spacing and radii from token scale only?

If all are true, the screen is design-system compliant.
