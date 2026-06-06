/* ============================================================================
   ConnectaHQ Launchpad — module detail content
   Dummy-but-complete data backing the slide-in drawer for each module.
   Each quick action deep-links to a tab via its `action` id.
   Table cells may be a string, or { pill: "ok|warning|critical", text } for a
   status chip.
   ========================================================================== */

const MODULE_DETAIL = {
  "network-diagnostics": {
    title: "Network Diagnostics", category: "Network", icon: "network",
    stats: [
      { label: "Monitored Cells", value: "1,284" },
      { label: "Open Incidents", value: "2", state: "critical" },
      { label: "Avg Latency", value: "42 ms" }
    ],
    tabs: [
      {
        id: "incidents", label: "Incidents", action: "open-incident",
        blocks: [
          { type: "note", state: "critical", text: "2 active incidents in EU-West. Auto-mitigation is running on Cell-EU-114." },
          { type: "table",
            cols: ["Incident", "Cell", "Severity", "Status", "Opened"],
            rows: [
              ["INC-2291", "Cell-EU-114", { pill: "critical", text: "Critical" }, "Mitigating", "18m ago"],
              ["INC-2288", "Cell-EU-097", { pill: "warning", text: "Warning" }, "Investigating", "1h ago"],
              ["INC-2280", "Cell-AS-031", { pill: "ok", text: "Resolved" }, "Closed", "5h ago"],
              ["INC-2274", "Cell-NA-205", { pill: "ok", text: "Resolved" }, "Closed", "9h ago"]
            ]
          }
        ]
      },
      {
        id: "trace", label: "Path Trace", action: "run-trace",
        blocks: [
          { type: "form", submit: "Run Trace",
            fields: [
              { label: "Source node", value: "edge-fra-1" },
              { label: "Destination", value: "cell-eu-114" }
            ]
          },
          { type: "subhead", text: "Last trace · 4 hops · 41 ms total" },
          { type: "table",
            cols: ["Hop", "Node", "Region", "Latency"],
            rows: [
              ["1", "edge-fra-1", "eu-central", "6 ms"],
              ["2", "core-fra-3", "eu-central", "11 ms"],
              ["3", "core-ams-2", "eu-west", "19 ms"],
              ["4", "cell-eu-114", "eu-west", "41 ms"]
            ]
          }
        ]
      }
    ]
  },

  "sim-provisioning": {
    title: "SIM Provisioning", category: "Connectivity", icon: "sim",
    stats: [
      { label: "Active SIMs", value: "128,450" },
      { label: "Pending Batches", value: "3", state: "warning" },
      { label: "Rate Plans", value: "12" }
    ],
    tabs: [
      {
        id: "activate", label: "Activate Batch", action: "activate-batch",
        blocks: [
          { type: "note", text: "Provision a new batch of SIMs against a rate plan and region." },
          { type: "form", submit: "Activate New Batch",
            fields: [
              { label: "Batch size", value: "5,000 SIMs" },
              { label: "Rate plan", value: "IoT-EU Flex" },
              { label: "Region", value: "EU-West" },
              { label: "Activation date", value: "Immediate" }
            ]
          }
        ]
      },
      {
        id: "pending", label: "Pending Batches", action: "review-pending",
        blocks: [
          { type: "note", state: "warning", text: "3 batches awaiting action." },
          { type: "table",
            cols: ["Batch", "Size", "Rate Plan", "Status", "Created"],
            rows: [
              ["#4823", "5,000", "IoT-EU Flex", { pill: "warning", text: "Awaiting approval" }, "20m ago"],
              ["#4822", "2,500", "M2M-Global", { pill: "ok", text: "Provisioning" }, "45m ago"],
              ["#4820", "10,000", "IoT-EU Flex", { pill: "warning", text: "Awaiting approval" }, "2h ago"],
              ["#4818", "1,200", "Consumer-NA", { pill: "ok", text: "Activated" }, "4h ago"]
            ]
          }
        ]
      }
    ]
  },

  "bulk-billing": {
    title: "Bulk Billing", category: "Billing", icon: "billing",
    stats: [
      { label: "Billed This Cycle", value: "14,902" },
      { label: "Failed Runs", value: "1", state: "critical" },
      { label: "Cycle Revenue", value: "$1.24M" }
    ],
    tabs: [
      {
        id: "runs", label: "Billing Runs", action: "retry-run",
        blocks: [
          { type: "note", state: "critical", text: "Run BR-2026-06-A failed on a payment-gateway timeout. Safe to retry." },
          { type: "table",
            cols: ["Run", "Status", "Accounts", "Amount", "When"],
            rows: [
              ["BR-2026-06-A", { pill: "critical", text: "Failed" }, "312", "$48,210", "5h ago"],
              ["BR-2026-06", { pill: "ok", text: "Completed" }, "14,902", "$1,242,880", "5h ago"],
              ["BR-2026-05", { pill: "ok", text: "Completed" }, "14,756", "$1,198,400", "Jun 1"]
            ]
          },
          { type: "form", submit: "Retry Failed Run",
            fields: [{ label: "Run", value: "BR-2026-06-A" }, { label: "Accounts", value: "312 (failed only)" }] }
        ]
      },
      {
        id: "cycle", label: "June Cycle", action: "view-cycle",
        blocks: [
          { type: "subhead", text: "Cycle 2026-06 · invoiced 5h ago" },
          { type: "table",
            cols: ["Segment", "Accounts", "Amount", "Status"],
            rows: [
              ["Enterprise", "1,204", "$612,400", { pill: "ok", text: "Invoiced" }],
              ["SMB", "8,786", "$498,280", { pill: "ok", text: "Invoiced" }],
              ["Consumer", "4,912", "$132,200", { pill: "ok", text: "Invoiced" }],
              ["Gateway retries", "312", "$48,210", { pill: "critical", text: "Failed" }]
            ]
          }
        ]
      }
    ]
  },

  "api-management": {
    title: "API Management", category: "Platform", icon: "api",
    stats: [
      { label: "Active Keys", value: "312" },
      { label: "Uptime · 30d", value: "99.95%", state: "ok" },
      { label: "Requests · 24h", value: "1.2M" }
    ],
    tabs: [
      {
        id: "keys", label: "API Keys", action: "issue-key",
        blocks: [
          { type: "form", submit: "Issue New Key",
            fields: [
              { label: "Label", value: "FleetCo Integrations" },
              { label: "Scope", value: "read:devices, write:sims" },
              { label: "Expiry", value: "90 days" }
            ]
          },
          { type: "table",
            cols: ["Key", "Scope", "Created", "Status"],
            rows: [
              ["fc_live_…a91", "read:devices", "1d ago", { pill: "ok", text: "Active" }],
              ["ops_live_…7d2", "admin", "12d ago", { pill: "ok", text: "Active" }],
              ["legacy_…04c", "read:usage", "3mo ago", { pill: "warning", text: "Rotating" }]
            ]
          }
        ]
      },
      {
        id: "logs", label: "Request Logs", action: "view-logs",
        blocks: [
          { type: "subhead", text: "Live tail · last 24h · 1.2M requests · 0.4% errors" },
          { type: "table",
            cols: ["Time", "Method", "Endpoint", "Status", "ms"],
            rows: [
              ["09:11:02", "GET", "/v2/sims/128450", { pill: "ok", text: "200" }, "38"],
              ["09:10:54", "POST", "/v2/batches", { pill: "ok", text: "201" }, "112"],
              ["09:10:41", "GET", "/v2/devices?zone=west", { pill: "ok", text: "200" }, "47"],
              ["09:10:08", "POST", "/v2/keys", { pill: "warning", text: "429" }, "9"],
              ["09:09:50", "GET", "/v2/billing/runs", { pill: "critical", text: "500" }, "204"]
            ]
          }
        ]
      }
    ]
  }
};
