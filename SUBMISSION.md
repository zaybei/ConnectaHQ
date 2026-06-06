# ConnectaHQ Launchpad — Submission Index

Take-home: **Telecom SaaS Adaptive Launchpad** · Designed by **Aftab**

## Deliverables

| # | Deliverable | Link |
|---|---|---|
| 1 | **Launchpad Workspace** (Figma — UI, Auto-Layout, Local Variables) | _Figma file: ConnectaHQ_ |
| 2 | **Logic Document** (Phase 1 — sorting rules + data structures) | [logic.md](logic.md) |
| 3 | **Execution Artifact** (responsive front-end, kebab-case CSS) | **https://connectahq-launchpad-seven.vercel.app** · source: [index.html](index.html) |
| 4 | **AI Workflow Summary** | [ai-workflow-summary.md](ai-workflow-summary.md) |

## SOP compliance checklist

- **Tokenization** — colours + typography mapped to Figma Local Variables / Text Styles using
  `category/item/state` naming (`color/surface/hover`, `text/heading/h2`). Same tokens drive
  the CSS via `var(--…)` custom properties (1:1 mapping, single source of truth).
- **Grid** — 1440px viewport, strict 12-column grid, 24px gutter, 8pt baseline, 48px margins.
- **Auto-Layout** — entire Figma layout is Auto-Layout; no fixed-position elements outside the
  master wrapper.
- **Asset handoff** — all CSS classes are kebab-case; module ids are kebab-case and reused as
  route + asset + analytics keys.
- **Adaptive logic** — usage-based priority (7-day frequency + recency + urgency), top-3 pinning,
  urgency override, cold-start fallback. See [logic.md](logic.md).
- **Atmosphere** — animated telco network-constellation background (nodes, links, data packets,
  signal pulses), subtle by design.
- **Accessibility (WCAG 2.1 AA)** — text contrast over the dark/animated surface, visible focus
  states, motion **Pause** control, state never conveyed by colour alone.

## Zones
- **Priority Modules** — top-3 by score, preview-rich, hover reveals quick actions.
- **Global Module Directory** — the long tail, searchable.
- **System Alerts** — account-level events ranked by severity.

## Run locally
```bash
npx serve .
```
