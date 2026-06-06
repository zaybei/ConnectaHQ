/* ============================================================================
   ConnectaHQ Launchpad — render + interaction wiring
   ========================================================================== */

(function () {
  const svgIcon = (key, size) =>
    `<svg viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" fill="none" aria-hidden="true">${ICONS[key] || ICONS.default}</svg>`;

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
    return `<span class="usage-badge usage-badge--${dir}">${arrow} ${Math.abs(pct)}%</span>`;
  };

  const scoreRing = (score) => `
    <span class="score-ring" style="--score:${score}" title="Priority score ${score} / 100">
      <span class="score-ring__inner"><b>${score}</b><i>score</i></span>
    </span>`;

  const reasonIcon = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.6.6 1 1.4 1 2.2V16h6v-.3c0-.8.4-1.6 1-2.2A6 6 0 0012 3z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const activityIcon = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 4v4h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---- priority card (modern, hover-revealed quick actions) ----------- */
  function priorityCard(m) {
    const p = m.preview;
    const lead = m.rank === 1 ? " module-card--lead" : "";
    return `
    <article class="module-card${lead}" tabindex="0"
             aria-label="Rank ${m.rank}. ${m.displayName}. ${p.headlineMetric.label}: ${fmt(p.headlineMetric.value)}, ${p.headlineMetric.state}. Priority score ${m.displayScore}.">
      <div class="card-top">
        <span class="card-icon">${svgIcon(m.icon)}</span>
        ${scoreRing(m.displayScore)}
      </div>

      <div class="card-id">
        <div class="card-id__row">
          <span class="rank-badge rank-badge--${m.rank}">Rank ${m.rank}</span>
          ${trend(m.usage.trendPct)}
        </div>
        <h3 class="card-title">${m.displayName}</h3>
        <span class="card-category">${m.category}</span>
      </div>

      <div class="metric-block">
        <div class="metric-block__top">
          <span class="headline-metric__value">${fmt(p.headlineMetric.value)}</span>
          ${statePill(p.headlineMetric.state)}
        </div>
        <span class="headline-metric__label">${p.headlineMetric.label}</span>
      </div>

      <p class="card-reason">
        <span class="card-reason__icon" aria-hidden="true">${reasonIcon}</span>
        Surfaced because <strong>${m.reason}</strong>
      </p>

      <p class="recent-activity">
        <span class="recent-activity__icon" aria-hidden="true">${activityIcon}</span>
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
    <article class="module-card module-card--compact" tabindex="0" data-category="${m.category}" aria-label="${m.displayName}, ${m.category}">
      <span class="card-icon">${svgIcon(m.icon, 20)}</span>
      <span class="compact-body">
        <h3 class="card-title">${m.displayName}</h3>
        <span class="compact-meta">${m.category}${visits ? " · " + visits : ""}</span>
      </span>
      <span class="compact-open" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
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

  /* ---- pulse stat ---------------------------------------------------- */
  function pulseStat(s) {
    return `
    <div class="pulse-stat pulse-stat--${s.state}">
      <span class="pulse-stat__value">${s.value}</span>
      <span class="pulse-stat__label">${s.label}</span>
      <span class="pulse-stat__trend">${s.trend}</span>
    </div>`;
  }

  /* ---- adaptive ranking signals (clickable chips) -------------------- */
  const activeSignals = { usage: true, recency: true, urgency: true, role: true };

  function renderSortedBy() {
    const wrap = document.getElementById("sorted-by");
    const label = `<span class="sorted-by__label">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M3 6h13M3 12h9M3 18h5M17 8v9m0 0l3-3m-3 3l-3-3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Sorted by</span>`;
    const chips = SORT_SIGNALS.map(s => {
      const on = activeSignals[s.key];
      return `<button type="button" class="sorted-chip ${on ? "sorted-chip--active" : "sorted-chip--off"}"
        data-signal="${s.key}" aria-pressed="${on}" title="Toggle ${s.label} as a ranking signal">${s.label}</button>`;
    }).join("");
    wrap.innerHTML = label + chips;
  }

  function renderPriority() {
    document.getElementById("priority-grid").innerHTML =
      getPriorityModules(activeSignals).map(priorityCard).join("");
  }

  /* ---- mount --------------------------------------------------------- */
  function render() {
    renderSortedBy();
    renderPriority();
    document.getElementById("directory-grid").innerHTML =
      getDirectoryModules().map(compactCard).join("");
    document.getElementById("alerts-list").innerHTML =
      SYSTEM_ALERTS.map(alertItem).join("");
    document.getElementById("pulse-grid").innerHTML =
      OPERATIONAL_PULSE.map(pulseStat).join("");
    document.getElementById("directory-count").textContent =
      `${getTotalModuleCount()} modules available`;
    document.getElementById("alerts-badge").textContent =
      `${SYSTEM_ALERTS.filter(a => a.severity !== "ok").length} active`;

    const fwrap = document.getElementById("directory-filters");
    fwrap.innerHTML = DIRECTORY_FILTERS.map((f, i) =>
      `<button class="filter-chip${i === 0 ? " filter-chip--active" : ""}" role="tab" aria-selected="${i === 0}" data-filter="${f}">${f}</button>`
    ).join("");
  }

  /* signal-chip toggle → live re-rank */
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".sorted-chip");
    if (!chip) return;
    const key = chip.dataset.signal;
    const activeCount = Object.values(activeSignals).filter(Boolean).length;
    if (activeSignals[key] && activeCount === 1) return; // keep at least one signal
    activeSignals[key] = !activeSignals[key];
    renderSortedBy();
    renderPriority();
  });

  /* directory filtering */
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    document.querySelectorAll(".filter-chip").forEach(c => {
      c.classList.remove("filter-chip--active");
      c.setAttribute("aria-selected", "false");
    });
    chip.classList.add("filter-chip--active");
    chip.setAttribute("aria-selected", "true");
    const f = chip.dataset.filter;
    document.querySelectorAll("#directory-grid .module-card--compact").forEach(card => {
      const show = f === "All" || card.dataset.category === f;
      card.style.display = show ? "" : "none";
    });
  });

  /* quick-action clicks (demo: surface intent without navigating away) */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-action-btn");
    if (!btn) return;
    e.stopPropagation();
    const original = btn.textContent;
    btn.textContent = "✓ Done";
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1400);
  });

  /* ---- motion toggle: WCAG 2.2.2 pause/play -------------------------- */
  function wireMotionToggle() {
    const toggle = document.getElementById("motion-toggle");
    const label = toggle.querySelector(".motion-toggle__label");
    const hint = document.getElementById("motion-hint");
    const bg = window.NetworkBackground;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setState(playing) {
      if (playing) {
        bg.start();
        label.textContent = "Pause motion";
        toggle.setAttribute("aria-pressed", "false");
        toggle.classList.remove("motion-toggle--paused");
        hint.textContent = "";
      } else {
        bg.stop();
        label.textContent = "Play motion";
        toggle.setAttribute("aria-pressed", "true");
        toggle.classList.add("motion-toggle--paused");
        hint.textContent = "Motion paused for accessibility";
      }
    }
    setState(!prefersReduced);
    toggle.addEventListener("click", () => setState(!bg.isRunning()));
  }

  render();
  wireMotionToggle();
})();
