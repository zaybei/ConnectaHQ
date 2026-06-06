/* ============================================================================
   ConnectaHQ Launchpad — animated telco background
   Network constellation: drifting nodes, distance-faded links, traveling data
   packets, and signal pulses from hub nodes. Tuned for subtlety so it never
   competes with foreground text. Exposes start/stop for the WCAG pause control.
   ========================================================================== */

(function () {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  /* read brand tokens so the canvas stays in sync with the design system */
  const css = getComputedStyle(document.documentElement);
  const PRIMARY = (css.getPropertyValue("--color-brand-primary") || "#6d7bff").trim();
  const SECONDARY = (css.getPropertyValue("--color-brand-secondary") || "#2fd4c4").trim();

  let width, height, dpr;
  let nodes = [];
  let pulses = [];
  let packets = [];
  let rafId = null;
  let running = false;

  const LINK_DISTANCE = 170;
  const NODE_COUNT_DIVISOR = 16000; // density relative to viewport area

  function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth = window.innerWidth;
    height = canvas.clientHeight = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes();
  }

  function seedNodes() {
    const target = Math.round((width * height) / NODE_COUNT_DIVISOR);
    const count = Math.max(28, Math.min(72, target));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 1.0,
      hub: Math.random() < 0.12 // ~12% of nodes act as signal hubs
    }));
  }

  function spawnPulse() {
    const hubs = nodes.filter(n => n.hub);
    if (!hubs.length) return;
    const h = hubs[Math.floor(Math.random() * hubs.length)];
    pulses.push({ x: h.x, y: h.y, r: 2, max: 130 + Math.random() * 60, alpha: 0.5 });
  }

  function spawnPacket() {
    if (nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const candidates = nodes.filter(n => n !== a && dist(a, n) < LINK_DISTANCE);
    if (!candidates.length) return;
    const b = candidates[Math.floor(Math.random() * candidates.length)];
    packets.push({ a, b, t: 0, speed: 0.006 + Math.random() * 0.006 });
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function step() {
    ctx.clearRect(0, 0, width, height);

    /* move + draw nodes */
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    /* links */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = dist(nodes[i], nodes[j]);
        if (d < LINK_DISTANCE) {
          const a = (1 - d / LINK_DISTANCE) * 0.16;
          ctx.strokeStyle = hexToRgba(PRIMARY, a);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    /* nodes on top of links */
    for (const n of nodes) {
      ctx.fillStyle = n.hub ? hexToRgba(SECONDARY, 0.9) : hexToRgba(PRIMARY, 0.7);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* signal pulses */
    pulses = pulses.filter(p => p.alpha > 0.01);
    for (const p of pulses) {
      p.r += 0.9; p.alpha *= 0.972;
      ctx.strokeStyle = hexToRgba(SECONDARY, p.alpha * 0.5);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* data packets traveling along links */
    packets = packets.filter(p => p.t < 1);
    for (const p of packets) {
      p.t += p.speed;
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = hexToRgba(SECONDARY, 0.95);
      ctx.shadowColor = SECONDARY;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (Math.random() < 0.03) spawnPulse();
    if (Math.random() < 0.08 && packets.length < 18) spawnPacket();

    rafId = requestAnimationFrame(step);
  }

  /* ---- public controls (used by the motion toggle) -------------------- */
  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }
  function isRunning() { return running; }

  window.addEventListener("resize", resize);
  resize();

  /* paint one static frame so paused state still looks intentional */
  step(); stop();

  window.NetworkBackground = { start, stop, isRunning };
})();
