/* ============================================================
   RESOLVED FIELD — procedural engine
   scatter → registration → axis → frame → line.
   Each <canvas class="field" data-phase=".."> is a frame from
   that transformation, caught at a different depth of focus.
   ------------------------------------------------------------
   data-phase     0..1   how far the field has resolved
   data-structure elevation | plan | grid   target geometry
   data-density   ~point count (default 1500)
   data-seed      integer
   ============================================================ */
(function () {
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var easeInOut = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  // ---- target geometries, normalized [0..1]x[0..1] (y down) ----
  function elevation() {
    var s = [], x0 = .30, x1 = .70, y0 = .12, y1 = .90, floors = 7, cols = 4, i, x, y;
    s.push([x0, y0, x1, y0, 0]); s.push([x0, y1, x1, y1, 1]);            // top, ground(emph)
    s.push([x0, y0, x0, y1, 0]); s.push([x1, y0, x1, y1, 0]);            // sides
    for (i = 1; i < floors; i++) { y = y0 + (y1 - y0) * i / floors; s.push([x0, y, x1, y, 0]); }
    for (i = 1; i < cols; i++) { x = x0 + (x1 - x0) * i / cols; s.push([x, y0, x, y1, 0]); }
    return { segs: s, axis: [x1, y1, x0, y0] };                          // brass diagonal
  }
  function gridPlan() {
    var s = [], i, n = 6, x0 = .26, x1 = .74, y0 = .16, y1 = .84, x, y;
    for (i = 0; i <= n; i++) { x = x0 + (x1 - x0) * i / n; s.push([x, y0, x, y1, 0]); }
    for (i = 0; i <= 4; i++) { y = y0 + (y1 - y0) * i / 4; s.push([x0, y, x1, y, 0]); }
    return { segs: s, axis: [x0, y1, x1, y0] };
  }
  var GEO = { elevation: elevation, plan: gridPlan, grid: gridPlan };

  function build(canvas) {
    var phase = parseFloat(canvas.dataset.phase || ".7");
    var density = parseInt(canvas.dataset.density || "1500", 10);
    var seed = parseInt(canvas.dataset.seed || "7", 10);
    var geo = (GEO[canvas.dataset.structure] || elevation)();
    var rand = rng(seed);

    // weight segment sampling by length
    var segs = geo.segs, total = 0, lens = segs.map(function (g) {
      var L = Math.hypot(g[2] - g[0], g[3] - g[1]); total += L; return L;
    });
    var ax = geo.axis, axLen = Math.hypot(ax[2] - ax[0], ax[3] - ax[1]);

    var pts = [];
    for (var i = 0; i < density; i++) {
      var brassPt = rand() < .12;                       // a minority carries the tension
      var tx, ty, emph = 0;
      if (brassPt) {
        var u = rand();
        tx = ax[0] + (ax[2] - ax[0]) * u; ty = ax[1] + (ax[3] - ax[1]) * u; emph = 1;
      } else {
        var r = rand() * total, k = 0;
        while (k < lens.length - 1 && r > lens[k]) { r -= lens[k]; k++; }
        var g = segs[k], t = rand();
        tx = g[0] + (g[2] - g[0]) * t; ty = g[1] + (g[3] - g[1]) * t; emph = g[4];
      }
      // scatter origin: drawn from the whole field, biased warm-dark
      var sx = .08 + rand() * .84, sy = .06 + rand() * .88;
      // residual jitter that survives until full resolution
      var jx = (rand() - .5), jy = (rand() - .5);
      pts.push({ tx: tx, ty: ty, sx: sx, sy: sy, jx: jx, jy: jy, brass: brassPt, emph: emph, sz: .6 + rand() * 1.1 });
    }
    // faint un-resolving background field (depth)
    var bg = [];
    for (var b = 0; b < Math.round(density * .35); b++) bg.push({ x: rand(), y: rand(), s: .4 + rand() * .7 });

    return { pts: pts, bg: bg, phase: phase, segs: segs, axis: ax };
  }

  function render(canvas, model, ph) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var e = easeInOut(Math.max(0, Math.min(1, ph)));
    var jitter = (1 - e);

    // background field — accumulation, never declared
    ctx.fillStyle = "rgba(135,124,107,0.10)";
    for (var b = 0; b < model.bg.length; b++) {
      var p = model.bg[b];
      ctx.fillRect(p.x * w, p.y * h, p.s, p.s);
    }

    // declared structure: at high focus, the line emerges
    if (e > .55) {
      var la = (e - .55) / .45;
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(189,148,87," + (la * .28).toFixed(3) + ")";
      ctx.beginPath();
      for (var s = 0; s < model.segs.length; s++) {
        var g = model.segs[s];
        ctx.moveTo(g[0] * w, g[1] * h); ctx.lineTo(g[2] * w, g[3] * h);
      }
      ctx.stroke();
      // the singular axis, brighter
      var ax = model.axis;
      ctx.strokeStyle = "rgba(219,181,113," + (la * .5).toFixed(3) + ")";
      ctx.beginPath(); ctx.moveTo(ax[0] * w, ax[1] * h); ctx.lineTo(ax[2] * w, ax[3] * h); ctx.stroke();
    }

    // the marks themselves
    for (var i = 0; i < model.pts.length; i++) {
      var pt = model.pts[i];
      var x = (pt.sx + (pt.tx - pt.sx) * e + pt.jx * jitter * .10) * w;
      var y = (pt.sy + (pt.ty - pt.sy) * e + pt.jy * jitter * .10) * h;
      var r = pt.sz;
      if (pt.brass) {
        ctx.fillStyle = "rgba(208,160,90," + (0.28 + e * 0.55).toFixed(3) + ")";
        r += pt.emph * .4 + e * .3;
      } else if (pt.emph) {
        ctx.fillStyle = "rgba(236,227,209," + (0.20 + e * 0.45).toFixed(3) + ")";
      } else {
        ctx.fillStyle = "rgba(236,227,209," + (0.12 + e * 0.30).toFixed(3) + ")";
      }
      ctx.fillRect(x, y, r, r);
    }
  }

  function mount(canvas) {
    var model = build(canvas);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var target = model.phase;
    if (reduce) { render(canvas, model, target); }
    else {
      var start = performance.now(), dur = 2200, from = Math.max(0, target - 0.55);
      (function frame(now) {
        var k = Math.min(1, (now - start) / dur);
        render(canvas, model, from + (target - from) * k);
        if (k < 1) requestAnimationFrame(frame);
      })(start);
    }
    var ro = new ResizeObserver(function () { render(canvas, model, target); });
    ro.observe(canvas);
    canvas._rf = { model: model, target: target };
  }

  function init() {
    var list = document.querySelectorAll("canvas.field");
    for (var i = 0; i < list.length; i++) mount(list[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.RESOLVED_FIELD = { init: init };
})();
