# AI Workflow Summary

I used AI as an acceleration layer across all four phases while keeping the design
decisions, tokenization, and enterprise SOPs under my own control.

**Phase 1 (Logic):** I used an AI assistant (Claude / Claude Code) to rapidly draft the
five telecom modules and realistic "recent activity" metadata, then I rewrote the sorting
model myself into a defensible scoring function — a weighted blend of 7-day frequency,
recency, and urgency, with an explicit urgency-override rule and a cold-start role-template
fallback. The AI's first pass over-indexed on raw frequency; my correction added the
recency decay and the anti-thrash threshold so the layout doesn't reshuffle between logins.

**Phase 2–3 (Layout & Hi-Fi):** I prompted the AI to generate a card-based SaaS workspace
concept, then drove it toward the enterprise standards the brief requires. The key
corrections I enforced: every colour and type value had to become a **Local Variable /
Text Style** using the strict `category/item/state` convention (e.g. `color/surface/hover`,
`text/heading/h2`) instead of raw hex; the whole layout had to be **Auto-Layout** on a
**1440px / 12-column / 24px-gutter / 8pt** grid with no fixed-position elements; and the
animated telco background needed a **WCAG pause control** plus contrast that holds against
the motion. I also made state non-colour-dependent (every critical/warning carries a label).

**Phase 4 (Execution):** I used the AI to build the responsive front-end artifact in plain
HTML/CSS/JS with **kebab-case** classes, where the CSS custom properties are the single
source of truth and map 1:1 to the Figma variables. I then used the Figma MCP integration to
generate the tokenized, componentized Figma file directly — variables first, then the
Module Card component with Default/Hover variants, then Auto-Layout assembly — reviewing and
correcting each step (e.g. fixing default container fills, hug/fill sizing, and variant
structure) so the file is something I can fully stand behind and hand off.

> Net: AI compressed the boilerplate and first drafts; the procedural discipline,
> token architecture, accessibility, and final judgment are mine.
