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
    <article class="module-card${lead}" tabindex="0" data-module="${m.moduleId}"
             aria-label="Rank ${m.rank}. ${m.displayName}. ${p.headlineMetric.label}: ${fmt(p.headlineMetric.value)}, ${p.headlineMetric.state}. Priority score ${m.displayScore}. Press Enter to open.">
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

  /* ---- priority lens tabs (single-select, like the directory filters) - */
  let activeLens = "all";

  function renderSortedBy() {
    const wrap = document.getElementById("sorted-by");
    const label = `<span class="sorted-by__label">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M3 6h13M3 12h9M3 18h5M17 8v9m0 0l3-3m-3 3l-3-3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Prioritized by</span>`;
    const chips = PRIORITY_LENSES.map(s => {
      const on = activeLens === s.key;
      return `<button type="button" class="sorted-chip ${on ? "sorted-chip--active" : ""}"
        data-lens="${s.key}" role="tab" aria-selected="${on}" title="Show priority modules by ${s.label}">${s.label}</button>`;
    }).join("");
    wrap.innerHTML = label + chips;
  }

  function renderPriority() {
    document.getElementById("priority-grid").innerHTML =
      getPriorityModules(activeLens).map(priorityCard).join("");
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

  /* lens tab select → re-filter the priority set */
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".sorted-chip");
    if (!chip) return;
    if (chip.dataset.lens === activeLens) return; // already active
    activeLens = chip.dataset.lens;
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

  /* ---- module detail drawer ------------------------------------------ */
  const drawerState = { moduleId: null };

  const pillTag = (s, t) => `<span class="state-pill state-pill--${s}"><span class="state-pill__dot"></span>${t}</span>`;

  function renderBlock(b) {
    if (b.type === "note") return `<p class="dt-note dt-note--${b.state || "info"}">${b.text}</p>`;
    if (b.type === "subhead") return `<p class="dt-subhead">${b.text}</p>`;
    if (b.type === "form") return `<form class="dt-form" onsubmit="return false">
      ${b.fields.map(f => `<label class="dt-field"><span>${f.label}</span><input value="${f.value}" readonly></label>`).join("")}
      <button type="submit" class="quick-action-btn quick-action-btn--primary dt-submit" data-dt-submit>${b.submit}</button>
    </form>`;
    if (b.type === "table") return `<div class="dt-tablewrap"><table class="dt-table">
      <thead><tr>${b.cols.map(c => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${(c && typeof c === "object" && c.pill) ? pillTag(c.pill, c.text) : c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
    return "";
  }

  function drawerHTML(mod, activeTabId) {
    const tab = mod.tabs.find(t => t.id === activeTabId) || mod.tabs[0];
    return `
    <div class="drawer-backdrop" data-close></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-label="${mod.title}">
      <header class="drawer__head">
        <span class="card-icon drawer__icon">${svgIcon(mod.icon)}</span>
        <div class="drawer__id">
          <span class="drawer__crumb">Module workspace</span>
          <h2 class="drawer__title">${mod.title}</h2>
          <span class="drawer__cat">${mod.category}</span>
        </div>
        <button class="drawer__close" data-close aria-label="Close">✕</button>
      </header>
      <div class="drawer__stats">
        ${mod.stats.map(s => `<div class="drawer-stat${s.state ? " drawer-stat--" + s.state : ""}">
          <span class="drawer-stat__value">${s.value}</span>
          <span class="drawer-stat__label">${s.label}</span></div>`).join("")}
      </div>
      <div class="drawer__tabs" role="tablist">
        ${mod.tabs.map(t => `<button class="drawer-tab${t.id === tab.id ? " drawer-tab--active" : ""}" data-tab="${t.id}" role="tab" aria-selected="${t.id === tab.id}">${t.label}</button>`).join("")}
      </div>
      <div class="drawer__body">${tab.blocks.map(renderBlock).join("")}</div>
    </aside>`;
  }

  function openDrawer(moduleId, tabId) {
    const mod = MODULE_DETAIL[moduleId];
    if (!mod) return;
    drawerState.moduleId = moduleId;
    const root = document.getElementById("drawer-root");
    root.innerHTML = drawerHTML(mod, tabId);
    requestAnimationFrame(() => root.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  }
  function setDrawerTab(tabId) {
    const mod = MODULE_DETAIL[drawerState.moduleId];
    if (mod) document.getElementById("drawer-root").innerHTML = drawerHTML(mod, tabId);
  }
  function closeDrawer() {
    const root = document.getElementById("drawer-root");
    root.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { if (!root.classList.contains("is-open")) root.innerHTML = ""; }, 320);
  }

  /* clicks: quick actions → specific tab, card body → first tab, drawer controls */
  document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) { closeDrawer(); return; }
    const tabBtn = e.target.closest(".drawer-tab");
    if (tabBtn) { setDrawerTab(tabBtn.dataset.tab); return; }
    const submit = e.target.closest("[data-dt-submit]");
    if (submit) { e.preventDefault(); const o = submit.textContent; submit.textContent = "✓ Submitted"; submit.disabled = true; setTimeout(() => { submit.textContent = o; submit.disabled = false; }, 1500); return; }

    const action = e.target.closest(".quick-action-btn");
    if (action) {
      e.stopPropagation();
      const moduleId = action.dataset.module;
      const mod = MODULE_DETAIL[moduleId];
      const tab = mod && mod.tabs.find(t => t.action === action.dataset.action);
      openDrawer(moduleId, tab ? tab.id : undefined);
      return;
    }
    const card = e.target.closest(".priority-grid .module-card");
    if (card && card.dataset.module) openDrawer(card.dataset.module);
  });

  /* keyboard: Enter opens focused card, Esc closes drawer */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return closeDrawer();
    if (e.key === "Enter") {
      const card = document.activeElement;
      if (card && card.classList && card.classList.contains("module-card") && card.dataset.module) {
        e.preventDefault();
        openDrawer(card.dataset.module);
      }
    }
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
