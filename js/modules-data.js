/* ============================================================================
   ConnectaHQ Launchpad — module catalogue + usage-based priority logic
   Mirrors the data structure defined in logic.md (Phase 1).
   ========================================================================== */

/* Inline SVG icon set (kebab-case keys mirror icon/module/* tokens) */
const ICONS = {
  "network":  '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>',
  "sim":      '<rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M9 3v6h6" stroke="currentColor" stroke-width="1.6"/><rect x="9" y="12" width="6" height="5" rx="1" stroke="currentColor" stroke-width="1.6"/>',
  "billing":  '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M7 15h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  "api":      '<path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13 4l-2 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  "fleet":    '<path d="M3 13l2-5h11l3 3v4M3 13v3h2M19 16h2v-3M3 13h16" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7.5" cy="16.5" r="1.6" stroke="currentColor" stroke-width="1.6"/><circle cx="16.5" cy="16.5" r="1.6" stroke="currentColor" stroke-width="1.6"/>',
  "iam":      '<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  "default":  '<rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>'
};

/* The 5 fully-specified seed modules (see logic.md §5.1) */
const MODULES = [
  {
    moduleId: "network-diagnostics", displayName: "Network Diagnostics", category: "network",
    icon: "network", route: "/modules/network-diagnostics",
    usage: { visits7d: 58, lastAccessed: "2026-06-06T08:42:00Z", trendPct: 23 },
    priorityScore: 94.1, pinned: true,
    preview: {
      headlineMetric: { label: "Cells Degraded", value: 2, state: "critical" },
      recentActivity: "Latency spike cleared on Cell-EU-114, 18m ago",
      secondaryMetric: { label: "Monitored Cells", value: 1284 }
    },
    quickActions: [
      { id: "open-incident", label: "Open Incident View", intent: "primary" },
      { id: "run-trace", label: "Run Path Trace", intent: "secondary" }
    ],
    alert: { count: 2, severity: "critical" }
  },
  {
    moduleId: "sim-provisioning", displayName: "SIM Provisioning", category: "connectivity",
    icon: "sim", route: "/modules/sim-provisioning",
    usage: { visits7d: 42, lastAccessed: "2026-06-06T08:14:00Z", trendPct: 12 },
    priorityScore: 87.4, pinned: true,
    preview: {
      headlineMetric: { label: "Pending Batches", value: 3, state: "warning" },
      recentActivity: "Batch #4821 activated 2h ago",
      secondaryMetric: { label: "Active SIMs", value: 128450 }
    },
    quickActions: [
      { id: "activate-batch", label: "Activate New Batch", intent: "primary" },
      { id: "view-pending", label: "View 3 Pending", intent: "secondary" }
    ],
    alert: { count: 1, severity: "warning" }
  },
  {
    moduleId: "bulk-billing", displayName: "Bulk Billing", category: "billing",
    icon: "billing", route: "/modules/bulk-billing",
    usage: { visits7d: 37, lastAccessed: "2026-06-06T03:30:00Z", trendPct: -4 },
    priorityScore: 83.0, pinned: true,
    preview: {
      headlineMetric: { label: "Failed Runs", value: 1, state: "critical" },
      recentActivity: "June cycle invoiced 14,902 accounts, 5h ago",
      secondaryMetric: { label: "Billed This Cycle", value: 14902 }
    },
    quickActions: [
      { id: "retry-run", label: "Retry Failed Run", intent: "primary" },
      { id: "view-cycle", label: "View June Cycle", intent: "secondary" }
    ],
    alert: { count: 1, severity: "critical" }
  },
  {
    moduleId: "api-management", displayName: "API Management", category: "platform",
    icon: "api", route: "/modules/api-management",
    usage: { visits7d: 21, lastAccessed: "2026-06-05T16:05:00Z", trendPct: 8 },
    priorityScore: 61.2, pinned: false,
    preview: {
      headlineMetric: { label: "Uptime (30d)", value: "99.95%", state: "ok" },
      recentActivity: 'New key issued to "FleetCo Integrations", 1d ago',
      secondaryMetric: { label: "Active Keys", value: 312 }
    },
    quickActions: [
      { id: "issue-key", label: "Issue New Key", intent: "primary" },
      { id: "view-logs", label: "View Request Logs", intent: "secondary" }
    ],
    alert: null
  },
  {
    moduleId: "fleet-tracking", displayName: "Fleet Tracking", category: "connectivity",
    icon: "fleet", route: "/modules/fleet-tracking",
    usage: { visits7d: 14, lastAccessed: "2026-06-06T05:50:00Z", trendPct: 2 },
    priorityScore: 48.7, pinned: false,
    preview: {
      headlineMetric: { label: "Devices Online", value: 127, state: "ok" },
      recentActivity: "4 devices went offline in Zone-West, 3h ago",
      secondaryMetric: { label: "Fleet Size", value: 131 }
    },
    quickActions: [
      { id: "view-map", label: "Open Live Map", intent: "primary" },
      { id: "view-offline", label: "View 4 Offline", intent: "secondary" }
    ],
    alert: null
  }
];

/* Long-tail directory entries (logic.md §5.2) */
const DIRECTORY_EXTRAS = [
  { moduleId: "user-iam",          displayName: "User IAM",          category: "security",  icon: "iam",     usage: { visits7d: 9 } },
  { moduleId: "usage-analytics",   displayName: "Usage Analytics",   category: "platform",  icon: "default", usage: { visits7d: 7 } },
  { moduleId: "number-management", displayName: "Number Management", category: "connectivity", icon: "sim",  usage: { visits7d: 6 } },
  { moduleId: "rate-plans",        displayName: "Rate Plans",        category: "billing",   icon: "billing", usage: { visits7d: 5 } },
  { moduleId: "roaming-partners",  displayName: "Roaming Partners",  category: "network",   icon: "network", usage: { visits7d: 4 } },
  { moduleId: "audit-logs",        displayName: "Audit Logs",        category: "security",  icon: "default", usage: { visits7d: 3 } }
];

/* Account-level system alerts (independent of usage score) */
const SYSTEM_ALERTS = [
  { severity: "critical", title: "Bulk Billing run BR-2026-06-A failed", meta: "Payment gateway timeout · 5h ago" },
  { severity: "warning",  title: "Data pool 'EU-Roaming' at 87% capacity", meta: "Projected to exhaust in 6 days" },
  { severity: "warning",  title: "2 cells degraded in EU-West region", meta: "Auto-mitigation in progress · 18m ago" },
  { severity: "ok",       title: "Scheduled maintenance completed", meta: "API gateway · last night 02:00–02:40 UTC" }
];

/* ---- Usage-Based Priority sort (logic.md §2) --------------------------- */
const SEVERITY_RANK = { critical: 1.0, warning: 0.6, ok: 0.0 };

function computePriority(modules) {
  const maxVisits = Math.max(...modules.map(m => m.usage.visits7d), 1);
  const now = Date.now();
  return modules
    .map(m => {
      const frequencyScore = m.usage.visits7d / maxVisits;
      const ageDays = (now - new Date(m.usage.lastAccessed).getTime()) / 86400000;
      const recencyScore = Math.max(0, 1 - ageDays / 14);
      const urgencyScore = m.alert ? (SEVERITY_RANK[m.alert.severity] || 0) : 0;
      const score = 0.5 * frequencyScore + 0.3 * recencyScore + 0.2 * urgencyScore;
      return { ...m, _score: score };
    })
    .sort((a, b) => b._score - a._score);
}

/* Rule 1: pin top 3 by score (urgency override already folded into score) */
function getPriorityModules() { return computePriority(MODULES).slice(0, 3); }
function getDirectoryModules() {
  const tail = computePriority(MODULES).slice(3);
  return [...tail, ...DIRECTORY_EXTRAS];
}
