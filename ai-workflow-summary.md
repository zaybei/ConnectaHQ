# AI Workflow Summary

I used AI as an acceleration layer for the **mechanical, repeatable work** — design-token
creation, Figma variable plumbing, and front-end code — while keeping **every design
decision, the layout, and the enterprise judgment under my own control.**

**Phase 1 (Logic):** I used an AI assistant to rapidly draft the telecom modules and realistic
"recent activity" metadata. I then designed the sorting model myself into a defensible scoring
function — a weighted blend of **7-day usage, recency, urgency, and role-relevance**, with a
top-4 pin, an explicit urgency-override rule, a cold-start role-template fallback, and an
anti-thrash threshold so the layout doesn't reshuffle between logins. The AI's first pass
over-indexed on raw frequency; my correction added the recency decay, the role signal, and the
re-normalisation that lets each priority "lens" re-rank by a single signal.

**Phase 2 (Wireframe & Layout):** The wireframe, the three zones (Priority / Directory /
Alerts), and the entire information hierarchy are my design. I built the structure as
**Auto-Layout on a 1440 / 12-column / 24px-gutter / 8pt grid** with no fixed-position elements
outside the master wrapper. AI's role here was limited to scaffolding the Figma **variables and
tokens** that my layout would later bind to.

**Phase 3 (Hi-Fi & Interaction):** All of the high-fidelity design is mine — the module cards,
the hover-revealed quick actions (e.g. "Activate New Batch" + "3 batches pending"), the
telco network-constellation background, the visual hierarchy, and the accessibility calls
(WCAG 2.1 AA contrast over the motion, a Pause/Stop control, and state never carried by colour
alone). I delegated the **tokenization** to AI: converting the colour and type values I chose
into Figma **Local Variables and Text Styles** under the strict `category/item/state`
convention (e.g. `color/surface/hover`, `text/heading/h2`), and keeping those tokens in 1:1
sync with the CSS custom properties. I reviewed every variable and binding so the token
architecture matched my design intent.

**Phase 4 (Execution):** AI generated the responsive front-end artifact (plain HTML/CSS/JS with
**kebab-case** classes) and the Figma variable/component plumbing directly from my designs. I
directed the structure and corrected the output at each step — auto-layout hug/fill sizing,
variant structure, default container fills, and contrast — so both the live build and the
Figma file are something I can fully stand behind and hand off.

> Net: AI compressed the tokenization, the variable plumbing, and the first-draft code; the
> design, the procedural discipline, and the final judgment are mine.
