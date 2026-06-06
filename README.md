# ConnectaHQ — Adaptive Launchpad

Personalized, usage-prioritized post-login Launchpad for **ConnectaHQ**, an enterprise
Telecom SaaS platform with 15+ functional modules. Built as a take-home design + front-end
exercise.

**Live demo:** _(Vercel URL added on deploy)_

## What it does
Prevents cognitive overload by ranking modules on real usage instead of showing a static
grid. Three zones:
- **Priority Modules** — top 3 by a usage-based priority score (frequency + recency + urgency),
  each with a live "what needs you" preview and hover-revealed quick actions.
- **Global Module Directory** — the long tail, one search away.
- **System Alerts** — account-level events ranked by severity.

A subtle animated **network-constellation** background sets a telecom mood without hurting
legibility, with a WCAG-compliant **Pause motion** control.

## Tech & standards
- Plain **HTML + CSS + vanilla JS**, no build step. All CSS classes are **kebab-case**.
- **Design tokens** in [`css/tokens.css`](css/tokens.css) map 1:1 to Figma Local Variables
  (`category/item/state`, e.g. `color/surface/hover`).
- 1440px / **12-column grid** / 24px gutter / 8pt baseline.
- WCAG 2.1 AA: text contrast over the dark surface, visible focus, motion pause,
  state never conveyed by colour alone.

## Structure
```
index.html
css/tokens.css        design tokens (source of truth for code + Figma)
css/launchpad.css     layout + components
js/modules-data.js    module catalogue + usage-based priority sort
js/network-background.js  animated telco background (start/stop API)
js/launchpad.js       render + interaction wiring
logic.md              Phase 1: adaptive logic & data structures
```

## Run locally
```bash
npx serve .
```
