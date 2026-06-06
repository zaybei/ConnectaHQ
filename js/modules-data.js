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
  "analytics":'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  "number":   '<path d="M5 4h14v16l-7-3-7 3V4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 9h6M9 13h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  "rate":     '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  "roaming":  '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" stroke-width="1.6"/>',
  "audit":    '<path d="M6 3h9l4 4v14H6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  "webhook":  '<circle cx="12" cy="7" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="17" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="17" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M10.5 9.5L7.5 14.5M13.5 9.5l3 5M9 17h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  "pool":     '<ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" stroke-width="1.6"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" stroke="currentColor" stroke-width="1.6"/>',
  "rules":    '<path d="M5 4h14M5 9h14M5 14h9M5 19h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="18" cy="17" r="2.4" stroke="currentColor" stroke-width="1.6"/>',
  "ticket":   '<path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-4V7z" stroke="currentColor" stroke-width="1.6"/><path d="M13 6v12" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2"/>',
  "coverage": '<path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6"/>',
  "default":  '<rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>'
};

/* The 4 fully-specified priority candidates (see logic.md §5.1).
   roleRelevant = relevant to the signed-in user's role (NetOps Lead). */
const MODULES = [
  {
    moduleId: "network-diagnostics", displayName: "Network Diagnostics", category: "Network",
    icon: "network", route: "/modules/network-diagnostics", roleRelevant: true,
    usage: { visits7d: 58, lastAccessed: "2026-06-06T08:42:00Z", trendPct: 23 },
    reason: "High usage + critical alert",
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
    moduleId: "sim-provisioning", displayName: "SIM Provisioning", category: "Connectivity",
    icon: "sim", route: "/modules/sim-provisioning", roleRelevant: true,
    usage: { visits7d: 42, lastAccessed: "2026-06-06T08:14:00Z", trendPct: 12 },
    reason: "Frequent use + 3 pending batches",
    preview: {
      headlineMetric: { label: "Batches Pending", value: 3, state: "warning" },
      recentActivity: "Batch #4821 activated 2h ago",
      secondaryMetric: { label: "Active SIMs", value: 128450 }
    },
    quickActions: [
      { id: "activate-batch", label: "Activate New Batch", intent: "primary" },
      { id: "review-pending", label: "Review Pending", intent: "secondary" }
    ],
    alert: { count: 1, severity: "warning" }
  },
  {
    moduleId: "bulk-billing", displayName: "Bulk Billing", category: "Billing",
    icon: "billing", route: "/modules/bulk-billing", roleRelevant: false,
    usage: { visits7d: 37, lastAccessed: "2026-06-06T03:30:00Z", trendPct: -4 },
    reason: "Critical billing run failure",
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
    moduleId: "api-management", displayName: "API Management", category: "Platform",
    icon: "api", route: "/modules/api-management", roleRelevant: false,
    usage: { visits7d: 21, lastAccessed: "2026-06-05T16:05:00Z", trendPct: 8 },
    reason: "Steady platform usage",
    preview: {
      headlineMetric: { label: "Uptime · 30d", value: "99.95%", state: "ok" },
      recentActivity: 'New key issued to "FleetCo Integrations", 1d ago',
      secondaryMetric: { label: "Active Keys", value: 312 }
    },
    quickActions: [
      { id: "issue-key", label: "Issue New Key", intent: "primary" },
      { id: "view-logs", label: "View Request Logs", intent: "secondary" }
    ],
    alert: null
  }
];

/* Long-tail directory entries (logic.md §5.2). Catalogue total auto-counted. */
const DIRECTORY_EXTRAS = [
  { moduleId: "fleet-tracking",     displayName: "Fleet Tracking",     category: "Connectivity", icon: "fleet",     usage: { visits7d: 14 } },
  { moduleId: "user-iam",           displayName: "User IAM",           category: "Security",     icon: "iam",       usage: { visits7d: 9 } },
  { moduleId: "usage-analytics",    displayName: "Usage Analytics",    category: "Analytics",    icon: "analytics", usage: { visits7d: 7 } },
  { moduleId: "number-management",  displayName: "Number Management",  category: "Connectivity", icon: "number",    usage: { visits7d: 6 } },
  { moduleId: "rate-plans",         displayName: "Rate Plans",         category: "Billing",      icon: "rate",      usage: { visits7d: 5 } },
  { moduleId: "roaming-partners",   displayName: "Roaming Partners",   category: "Network",      icon: "roaming",   usage: { visits7d: 4 } },
  { moduleId: "audit-logs",         displayName: "Audit Logs",         category: "Security",     icon: "audit",     usage: { visits7d: 3 } },
  { moduleId: "webhooks",           displayName: "Webhooks",           category: "Platform",     icon: "webhook",   usage: { visits7d: 3 } },
  { moduleId: "data-pools",         displayName: "Data Pools",         category: "Connectivity", icon: "pool",      usage: { visits7d: 2 } },
  { moduleId: "provisioning-rules", displayName: "Provisioning Rules", category: "Connectivity", icon: "rules",     usage: { visits7d: 2 } },
  { moduleId: "support-tickets",    displayName: "Support Tickets",    category: "Platform",     icon: "ticket",    usage: { visits7d: 1 } },
  { moduleId: "coverage-maps",      displayName: "Coverage Maps",      category: "Network",      icon: "coverage",  usage: { visits7d: 1 } }
];

const DIRECTORY_FILTERS = ["All", "Connectivity", "Network", "Billing", "Security", "Analytics", "Platform"];

/* Priority lenses — single-select tabs (mirrors the Global Module Directory's
   filter tabs). "All" pins the top set by combined priority score; each signal
   tab narrows to just the modules that signal surfaces, ranked by that signal,
   so the user can ask "what's most-used / most-recent / most-urgent" directly. */
const PRIORITY_LENSES = [
  { key: "all",     label: "All" },
  { key: "usage",   label: "7-day usage" },
  { key: "recency", label: "recent activity" },
  { key: "urgency", label: "operational urgency" },
  { key: "role",    label: "role relevance" }
];
const SIGNAL_WEIGHTS = { usage: 0.40, recency: 0.25, urgency: 0.20, role: 0.15 };

/* Today's operational pulse — cross-module KPIs */
const OPERATIONAL_PULSE = [
  { label: "Active SIMs",     value: "128,450", state: "ok",       trend: "+1.2%" },
  { label: "Network Uptime",  value: "99.95%",  state: "ok",       trend: "30d" },
  { label: "Open Incidents",  value: "2",       state: "critical", trend: "EU-West" },
  { label: "Pending Batches", value: "3",       state: "warning",  trend: "awaiting" }
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

/* Per-module signal parts, each normalised 0–1 (logic.md §2.1). */
function signalParts(m, maxVisits, now) {
  const ageDays = (now - new Date(m.usage.lastAccessed).getTime()) / 86400000;
  return {
    usage:   m.usage.visits7d / maxVisits,
    recency: Math.max(0, 1 - ageDays / 14),
    urgency: m.alert ? (SEVERITY_RANK[m.alert.severity] || 0) : 0,
    role:    m.roleRelevant ? 1 : 0
  };
}

/* Combined priority score (0–100) per module, sorted high→low (logic.md §2). */
function scoredModules() {
  const maxVisits = Math.max(...MODULES.map(m => m.usage.visits7d), 1);
  const now = Date.now();
  return MODULES
    .map(m => {
      const parts = signalParts(m, maxVisits, now);
      const score = SIGNAL_WEIGHTS.usage * parts.usage + SIGNAL_WEIGHTS.recency * parts.recency
                  + SIGNAL_WEIGHTS.urgency * parts.urgency + SIGNAL_WEIGHTS.role * parts.role;
      return { ...m, displayScore: Math.round(score * 100) };
    })
    .sort((a, b) => b.displayScore - a.displayScore);
}

/* Apply a lens (single-select tab): "all" pins the top set by combined score;
   each signal tab filters to the modules it surfaces, ordered by that signal. */
function getPriorityModules(lens) {
  let list = scoredModules();
  switch (lens) {
    case "usage":   // most-used: only the heavy-use modules, busiest first
      list = list.filter(m => m.usage.visits7d >= 40)
                 .sort((a, b) => b.usage.visits7d - a.usage.visits7d); break;
    case "recency": // what you just touched: single most-recent module
      list = list.slice()
                 .sort((a, b) => new Date(b.usage.lastAccessed) - new Date(a.usage.lastAccessed))
                 .slice(0, 1); break;
    case "urgency": // needs action: only modules carrying an alert, worst first
      list = list.filter(m => m.alert)
                 .sort((a, b) => (SEVERITY_RANK[b.alert.severity] || 0) - (SEVERITY_RANK[a.alert.severity] || 0)); break;
    case "role":    // for your role: only role-relevant modules
      list = list.filter(m => m.roleRelevant); break;
    default:        // "all": top set by combined priority score
      list = list.slice(0, 4);
  }
  return list.map((m, i) => ({ ...m, rank: i + 1 }));
}
function getDirectoryModules() { return DIRECTORY_EXTRAS; }
function getTotalModuleCount() { return MODULES.length + DIRECTORY_EXTRAS.length; }
