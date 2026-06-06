/* ============================================================================
   ConnectaHQ Launchpad — render + interaction wiring
   ========================================================================== */

(function () {
  const svgIcon = (key) =>
    `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">${ICONS[key] || ICONS.default}</svg>`;

  const fmt = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : v);

  const statePill = (state) => {
    const labels = { ok: "Healthy", warning: "Attention", critical: "Critical" };
    return `<span class="state-pill state-pill--${state}">
      <span class="state-pill__dot"></span>${labels[state] || state}</span>`;
  };

  const trend = (pct) => {
    if (pct === undefined) return "";
    const dir = pct >= 0 ? "up" : "down";
    const arrow = pct >= 0 ? "▲" : "▼";
    return `<span class="usage-badge">
      <span class="usage-badge__trend--${dir}">${arrow} ${Math.abs(pct)}%</span></span>`;
  };

  /* ---- priority card (rich, hover-revealed quick actions) ------------- */
  function priorityCard(m) {
    const p = m.preview;
    return `
    <article class="module-card" tabindex="0"
             aria-label="${m.displayName}. ${p.headlineMetric.label}: ${fmt(p.headlineMetric.value)}, ${p.headlineMetric.state}.">
      <header class="card-header">
        <span class="card-icon">${svgIcon(m.icon)}</span>
        <span class="card-title-group">
          <h3 class="card-title">${m.displayName}</h3>
          <span class="card-category">${m.category}</span>
        </span>
        ${trend(m.usage.trendPct)}
      </header>

      <div class="headline-metric">
        <span class="headline-metric__value">${fmt(p.headlineMetric.value)}</span>
        <span class="headline-metric__label">${p.headlineMetric.label}</span>
        ${statePill(p.headlineMetric.state)}
      </div>

      <p class="recent-activity">
        <span class="recent-activity__icon" aria-hidden="true">↻</span>
        ${p.recentActivity}
      </p>
      <p class="secondary-metric"><strong>${fmt(p.secondaryMetric.value)}</strong> ${p.secondaryMetric.label}</p>

      <div class="quick-actions">
        <div class="quick-actions__inner">
          ${m.quickActions.map(a =>
            `<button class="quick-action-btn quick-action-btn--${a.intent}" data-module="${m.moduleId}" data-action="${a.id}">${a.label}</button>`
          ).join("")}
        </div>
      </div>
    </article>`;
  }

  /* ---- compact directory card ---------------------------------------- */
  function compactCard(m) {
    const visits = m.usage && m.usage.visits7d != null ? `${m.usage.visits7d} visits · 7d` : "";
    return `
    <article class="module-card module-card--compact" tabindex="0" aria-label="${m.displayName}, ${m.category}">
      <span class="card-icon">${svgIcon(m.icon)}</span>
      <span class="compact-body">
        <h3 class="card-title">${m.displayName}</h3>
        <span class="compact-meta">${m.category}${visits ? " · " + visits : ""}</span>
      </span>
      <span class="compact-open" aria-hidden="true">→</span>
    </article>`;
  }

  /* ---- system alert item --------------------------------------------- */
  function alertItem(a) {
    const glyph = { critical: "!", warning: "!", ok: "✓" };
    return `
    <div class="alert-item alert-item--${a.severity}" role="listitem">
      <span class="alert-item__icon" aria-hidden="true">${glyph[a.severity] || "•"}</span>
      <div>
        <p class="alert-item__title">${a.title}</p>
        <p class="alert-item__meta">${a.meta}</p>
      </div>
    </div>`;
  }

  /* ---- mount --------------------------------------------------------- */
  function render() {
    document.getElementById("priority-grid").innerHTML =
      getPriorityModules().map(priorityCard).join("");
    document.getElementById("directory-grid").innerHTML =
      getDirectoryModules().map(compactCard).join("");
    document.getElementById("alerts-list").innerHTML =
      SYSTEM_ALERTS.map(alertItem).join("");
  }

  /* quick-action clicks (demo: surface intent without navigating away) */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-action-btn");
    if (!btn) return;
    e.stopPropagation();
    btn.textContent = "✓ " + btn.textContent;
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; }, 1400);
  });

  /* ---- motion toggle: WCAG 2.2.2 pause/play -------------------------- */
  function wireMotionToggle() {
    const toggle = document.getElementById("motion-toggle");
    const label = toggle.querySelector(".motion-toggle__label");
    const bg = window.NetworkBackground;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setState(playing) {
      if (playing) { bg.start(); label.textContent = "Pause motion"; toggle.setAttribute("aria-pressed", "false"); }
      else         { bg.stop();  label.textContent = "Play motion";  toggle.setAttribute("aria-pressed", "true"); }
    }
    /* honour OS preference: start paused if the user asked for reduced motion */
    setState(!prefersReduced);

    toggle.addEventListener("click", () => setState(!bg.isRunning()));
  }

  render();
  wireMotionToggle();
})();
