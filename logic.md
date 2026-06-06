# ConnectaHQ Launchpad — Phase 1: Adaptive Logic & Architecture

**Author:** Aftab · **Module:** Post-login Launchpad · **Version:** 1.0 · **Viewport target:** 1440px / 12-col

---

## 1. Problem framing

ConnectaHQ exposes **15+ functional modules** (SIM Provisioning, Bulk Billing, API
Management, Network Diagnostics, Fleet Tracking, User IAM, and more). Showing all of
them with equal weight forces every user to re-scan the entire surface on every login —
the definition of cognitive overload.

The Launchpad solves this with **progressive disclosure driven by usage**: it promotes the
handful of modules a given user actually works in, previews the *one thing* inside each
that needs attention, and keeps the long tail one search away instead of one scan away.

**Design principle:** _Rank by behaviour, reveal by intent._

---

## 2. Usage-Based Priority — sorting rules

Each module is scored on every render. The score blends three signals so that a module
rises either because it is **used often**, **used recently**, or **needs action now**.

### 2.1 The priority score

```
priorityScore =
    (W_usage   × usageScore)      // how much they use it (7-day visits)
  + (W_recency × recencyScore)    // how recently they touched it
  + (W_urgency × urgencyScore)    // how badly it needs attention
  + (W_role    × roleScore)       // relevance to the signed-in user's role

Weights:  W_usage = 0.40   W_recency = 0.25   W_urgency = 0.20   W_role = 0.15
```

The blend is re-normalised against whichever signals are active, so the score always lands
on a 0–100 scale and the priority **lenses** can re-rank the set by a single signal on demand.

| Signal | Definition | Normalisation |
|---|---|---|
| `usageScore` | Visit count over the **7-day trailing window** (`visits7d`). | Min-max normalised 0–1 against the user's busiest module. |
| `recencyScore` | Time since `lastAccessed`. | Linear: `1.0` at access time, decaying to `0.0` at 14 days (`1 − ageDays / 14`). |
| `urgencyScore` | Derived from the module's open alert (SLA breaches, failed billing runs, batches awaiting activation). | `critical → 1.0`, `warning → 0.6`, none `→ 0.0`. |
| `roleScore` | Whether the module is relevant to the signed-in user's role (e.g. _NetOps Lead_). | `1.0` if role-relevant, else `0.0`. |

### 2.2 Ordering rules (applied in sequence)

- **Rule 1 — Pin the top 4.** The four highest `priorityScore` modules are pinned to the
  **Priority Modules** zone as large, preview-rich cards — the 7-day-trailing "what you live
  in" set. A single-select **lens** (All · 7-day usage · recent activity · operational
  urgency · role relevance) can re-rank or narrow this set to one signal at a time.
- **Rule 2 — Recency tie-break.** Equal scores resolve by most-recent `lastAccessed`.
- **Rule 3 — Urgency override.** A module carrying a `critical` alert is **floated into the
  top 4 even if its frequency is low** (e.g. a billing run failed overnight). It is badged
  so the promotion is explainable, never silent.
- **Rule 4 — Cold-start fallback.** A user with < 5 lifetime sessions has no reliable
  history, so the top 4 are seeded from a **role template** (e.g. _NetOps_ → Network
  Diagnostics, Fleet Tracking, SIM Provisioning, Bulk Billing). The system blends toward real usage as
  data accumulates.
- **Rule 5 — Anti-thrash.** Ranks are recomputed at most **once per session load** and a
  module must beat the card below it by **≥ 8%** to swap positions, so the layout doesn't
  reshuffle under the user between visits.

### 2.3 The two remaining zones

- **Global Module Directory** — all 15+ modules, searchable and filterable by category. The
  long tail lives here so infrequent tools are *findable* without competing for prime space.
- **System Alerts** — cross-module, account-level events (network incidents, quota limits,
  security notices), ranked by severity, independent of the usage score.

---

## 3. The preview — what makes a card worth clicking

A module card never shows a static label alone. It teases the **single most actionable
fact** inside that module so the user can decide to dive in:

1. **Headline metric** — the one number that signals "act now" (e.g. `3 Pending Batches`),
   carried with a state (`ok` / `warning` / `critical`) that drives colour.
2. **Recent activity line** — a human sentence of the last meaningful event
   (`Batch #4821 activated 2h ago`).
3. **Secondary metric** — context that reassures scale (`128,450 active SIMs`).
4. **Quick actions (hover-revealed)** — 1–2 deep-link buttons that skip the module's own
   landing page and drop the user straight onto the task (`Activate New Batch`).

This is the progressive-disclosure contract: **glanceable by default, actionable on hover,
deep on click.**

---

## 4. Data structure — `ModuleCard`

```jsonc
{
  "moduleId": "sim-provisioning",          // stable kebab-case id (also the asset/route key)
  "displayName": "SIM Provisioning",
  "category": "connectivity",              // connectivity | billing | platform | network | security
  "iconToken": "icon/module/sim",          // references a design token, never a raw asset path
  "route": "/modules/sim-provisioning",
  "roleRelevant": true,                     // relevant to the signed-in user's role (NetOps Lead)

  "usage": {
    "visits7d": 42,                         // raw count in trailing 7 days
    "lastAccessed": "2026-06-06T08:14:00Z", // ISO-8601 UTC
    "trendPct": 12                          // % change vs previous 7-day window (for sparkline/arrow)
  },

  "priorityScore": 81.0,                    // computed live from the weighted blend; drives ordering
  "pinned": true,                           // true => Priority zone (top 4), false => Directory
  "reason": "Frequent use + 3 pending batches", // human-readable "why this surfaced" label

  "preview": {
    "headlineMetric": { "label": "Pending Batches", "value": 3, "state": "warning" },
    "recentActivity": "Batch #4821 activated 2h ago",
    "secondaryMetric": { "label": "Active SIMs", "value": 128450 }
  },

  "quickActions": [
    { "id": "activate-batch", "label": "Activate New Batch", "intent": "primary",   "route": "/modules/sim-provisioning/batches/new" },
    { "id": "view-pending",   "label": "View 3 Pending",     "intent": "secondary", "route": "/modules/sim-provisioning/batches?status=pending" }
  ],

  "alert": { "count": 1, "severity": "warning" } // null when clear
}
```

**Notes on enterprise discipline**
- `moduleId` is the single kebab-case key reused as the route segment, the asset key, and
  the analytics event name — one identifier, no drift.
- Visual properties (`iconToken`, metric `state`) reference **design tokens**, not raw
  colours or file paths, so the data layer stays presentation-agnostic.
- `priorityScore` is computed server-side from the `usage` block; the client only renders.

---

## 5. Seed modules with realistic recent-activity metadata

The **top 4 by `priorityScore`** pin to the Priority zone; the rest (Fleet Tracking and the
wider catalogue) live in the searchable Global Module Directory. Scores below are the live
weighted blend for the _NetOps Lead_ profile at the reference time — they recompute each
session as recency and usage shift, so the exact value is less important than the ordering.

| Rank | Module | `moduleId` | Category | visits7d | Role-relevant | Headline metric | Recent activity | Score |
|---|---|---|---|---|---|---|---|---|
| 1 | **Network Diagnostics** | `network-diagnostics` | network | 58 | yes | `2 Cells Degraded` · critical | Latency spike cleared on Cell-EU-114, 18m ago | 100 |
| 2 | **SIM Provisioning** | `sim-provisioning` | connectivity | 42 | yes | `3 Batches Pending` · warning | Batch #4821 activated 2h ago | 81 |
| 3 | **Bulk Billing** | `bulk-billing` | billing | 37 | no | `1 Run Failed` · critical | June cycle invoiced 14,902 accounts, 5h ago | 70 |
| 4 | **API Management** | `api-management` | platform | 21 | no | `99.95% Uptime` · ok | New key issued to "FleetCo Integrations", 1d ago | 38 |
| — | Fleet Tracking _(directory)_ | `fleet-tracking` | connectivity | 14 | no | `127 Devices Online` · ok | 4 devices went offline in Zone-West, 3h ago | — |

### 5.1 Full seed records (drives both the code artifact and the Figma content)

```json
[
  {
    "moduleId": "network-diagnostics",
    "displayName": "Network Diagnostics",
    "category": "network",
    "iconToken": "icon/module/network",
    "route": "/modules/network-diagnostics",
    "roleRelevant": true,
    "usage": { "visits7d": 58, "lastAccessed": "2026-06-06T08:42:00Z", "trendPct": 23 },
    "priorityScore": 100.0,
    "pinned": true,
    "preview": {
      "headlineMetric": { "label": "Cells Degraded", "value": 2, "state": "critical" },
      "recentActivity": "Latency spike cleared on Cell-EU-114, 18m ago",
      "secondaryMetric": { "label": "Monitored Cells", "value": 1284 }
    },
    "quickActions": [
      { "id": "open-incident", "label": "Open Incident View", "intent": "primary", "route": "/modules/network-diagnostics/incidents" },
      { "id": "run-trace", "label": "Run Path Trace", "intent": "secondary", "route": "/modules/network-diagnostics/trace" }
    ],
    "alert": { "count": 2, "severity": "critical" }
  },
  {
    "moduleId": "sim-provisioning",
    "displayName": "SIM Provisioning",
    "category": "connectivity",
    "iconToken": "icon/module/sim",
    "route": "/modules/sim-provisioning",
    "roleRelevant": true,
    "usage": { "visits7d": 42, "lastAccessed": "2026-06-06T08:14:00Z", "trendPct": 12 },
    "priorityScore": 81.0,
    "pinned": true,
    "preview": {
      "headlineMetric": { "label": "Pending Batches", "value": 3, "state": "warning" },
      "recentActivity": "Batch #4821 activated 2h ago",
      "secondaryMetric": { "label": "Active SIMs", "value": 128450 }
    },
    "quickActions": [
      { "id": "activate-batch", "label": "Activate New Batch", "intent": "primary", "route": "/modules/sim-provisioning/batches/new" },
      { "id": "view-pending", "label": "View 3 Pending", "intent": "secondary", "route": "/modules/sim-provisioning/batches?status=pending" }
    ],
    "alert": { "count": 1, "severity": "warning" }
  },
  {
    "moduleId": "bulk-billing",
    "displayName": "Bulk Billing",
    "category": "billing",
    "iconToken": "icon/module/billing",
    "route": "/modules/bulk-billing",
    "roleRelevant": false,
    "usage": { "visits7d": 37, "lastAccessed": "2026-06-06T03:30:00Z", "trendPct": -4 },
    "priorityScore": 70.0,
    "pinned": true,
    "preview": {
      "headlineMetric": { "label": "Failed Runs", "value": 1, "state": "critical" },
      "recentActivity": "June cycle invoiced 14,902 accounts, 5h ago",
      "secondaryMetric": { "label": "Billed This Cycle", "value": 14902 }
    },
    "quickActions": [
      { "id": "retry-run", "label": "Retry Failed Run", "intent": "primary", "route": "/modules/bulk-billing/runs?status=failed" },
      { "id": "view-cycle", "label": "View June Cycle", "intent": "secondary", "route": "/modules/bulk-billing/cycles/2026-06" }
    ],
    "alert": { "count": 1, "severity": "critical" }
  },
  {
    "moduleId": "api-management",
    "displayName": "API Management",
    "category": "platform",
    "iconToken": "icon/module/api",
    "route": "/modules/api-management",
    "roleRelevant": false,
    "usage": { "visits7d": 21, "lastAccessed": "2026-06-05T16:05:00Z", "trendPct": 8 },
    "priorityScore": 38.0,
    "pinned": true,
    "preview": {
      "headlineMetric": { "label": "Uptime (30d)", "value": "99.95%", "state": "ok" },
      "recentActivity": "New key issued to \"FleetCo Integrations\", 1d ago",
      "secondaryMetric": { "label": "Active Keys", "value": 312 }
    },
    "quickActions": [
      { "id": "issue-key", "label": "Issue New Key", "intent": "primary", "route": "/modules/api-management/keys/new" },
      { "id": "view-logs", "label": "View Request Logs", "intent": "secondary", "route": "/modules/api-management/logs" }
    ],
    "alert": null
  },
  {
    "moduleId": "fleet-tracking",
    "displayName": "Fleet Tracking",
    "category": "connectivity",
    "iconToken": "icon/module/fleet",
    "route": "/modules/fleet-tracking",
    "roleRelevant": false,
    "usage": { "visits7d": 14, "lastAccessed": "2026-06-06T05:50:00Z", "trendPct": 2 },
    "priorityScore": 48.7,
    "pinned": false,
    "preview": {
      "headlineMetric": { "label": "Devices Online", "value": 127, "state": "ok" },
      "recentActivity": "4 devices went offline in Zone-West, 3h ago",
      "secondaryMetric": { "label": "Fleet Size", "value": 131 }
    },
    "quickActions": [
      { "id": "view-map", "label": "Open Live Map", "intent": "primary", "route": "/modules/fleet-tracking/map" },
      { "id": "view-offline", "label": "View 4 Offline", "intent": "secondary", "route": "/modules/fleet-tracking/devices?status=offline" }
    ],
    "alert": null
  }
]
```

### 5.2 Long-tail directory (remaining catalogue, shown in Global Directory)

`user-iam` · `number-management` · `roaming-partners` · `usage-analytics` ·
`rate-plans` · `provisioning-rules` · `webhooks` · `support-tickets` ·
`audit-logs` · `data-pools` — each carries the same `ModuleCard` shape with `pinned: false`.

---

## 6. How this maps forward

- **Phase 2/3 (Figma + code):** the `state` enum (`ok`/`warning`/`critical`) binds to
  `color/state/*` tokens; `pinned` selects the card component variant (Priority vs Compact).
- **Accessibility:** urgency is never colour-only — every `critical`/`warning` carries a
  text label and icon, satisfying WCAG 1.4.1 (Use of Colour).
- **Telemetry loop:** each card click emits `launchpad.module.open` with `moduleId` and
  `rank`, feeding the next session's `usageScore` — the system learns from itself.
