/* =========================================================
   BIMHub Demo — DXF → PDF
   Browser-only. No backend. ASCII DXF parsing + SVG render
   + real PDF export via jsPDF (CDN).
   ========================================================= */
(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fmt = (n, d=2) => Number(n).toFixed(d);

  /* ── DXF parser (subset: LINE, LWPOLYLINE, POLYLINE/VERTEX, CIRCLE, ARC, TEXT) ── */
  function parseDXF(text) {
    const lines = text.split(/\r?\n/);
    const pairs = [];
    for (let i = 0; i < lines.length - 1; i += 2) {
      const code = parseInt(lines[i].trim(), 10);
      const val  = lines[i + 1] !== undefined ? lines[i + 1].trim() : "";
      if (!Number.isNaN(code)) pairs.push({ code, val });
    }
    const entities = [];
    const layers = new Map();
    let inEntities = false;
    let cur = null;
    let polyVerts = null;

    const pushCur = () => {
      if (!cur) return;
      if (cur.type === "POLYLINE" && polyVerts) { cur.vertices = polyVerts; polyVerts = null; }
      entities.push(cur);
      layers.set(cur.layer || "0", (layers.get(cur.layer || "0") || 0) + 1);
      cur = null;
    };

    for (let i = 0; i < pairs.length; i++) {
      const { code, val } = pairs[i];
      if (code === 0) {
        if (val === "SECTION") {
          const next = pairs[i + 1];
          if (next && next.code === 2) inEntities = next.val === "ENTITIES";
          continue;
        }
        if (val === "ENDSEC" || val === "EOF") { pushCur(); inEntities = false; continue; }
        if (!inEntities) continue;
        if (val === "SEQEND") { pushCur(); continue; }
        if (val === "VERTEX") {
          if (cur?.type === "POLYLINE") {
            if (!polyVerts) polyVerts = [];
            polyVerts.push({ x: 0, y: 0 });
          }
          continue;
        }
        pushCur();
        if (["LINE","LWPOLYLINE","POLYLINE","CIRCLE","ARC","TEXT","MTEXT","SOLID"].includes(val)) {
          cur = { type: val, layer: "0" };
          if (val === "LWPOLYLINE") cur.vertices = [];
          if (val === "POLYLINE") polyVerts = [];
        }
        continue;
      }
      if (!cur) continue;

      switch (code) {
        case 8:  cur.layer = val; break;
        case 1:  cur.text = val; break;
        case 10:
          if (cur.type === "LWPOLYLINE") cur.vertices.push({ x: parseFloat(val), y: 0 });
          else if (cur.type === "POLYLINE" && polyVerts && polyVerts.length) polyVerts[polyVerts.length-1].x = parseFloat(val);
          else cur.x = parseFloat(val);
          break;
        case 20:
          if (cur.type === "LWPOLYLINE" && cur.vertices.length) cur.vertices[cur.vertices.length-1].y = parseFloat(val);
          else if (cur.type === "POLYLINE" && polyVerts && polyVerts.length) polyVerts[polyVerts.length-1].y = parseFloat(val);
          else cur.y = parseFloat(val);
          break;
        case 11: cur.x2 = parseFloat(val); break;
        case 21: cur.y2 = parseFloat(val); break;
        case 40: cur.r  = parseFloat(val); cur.height = parseFloat(val); break;
        case 50: cur.start = parseFloat(val); break;
        case 51: cur.end   = parseFloat(val); break;
        case 70: cur.flags = parseInt(val, 10); break;
        case 90: cur.vcount = parseInt(val, 10); break;
        case 62: cur.color = parseInt(val, 10); break;
      }
    }
    pushCur();
    return { entities, layers: [...layers.keys()] };
  }

  /* ── Bounds + scale ──────────────────────────────────── */
  function bounds(entities) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const pt = (x, y) => { if (Number.isFinite(x) && Number.isFinite(y)) { if (x<minX)minX=x; if (y<minY)minY=y; if (x>maxX)maxX=x; if (y>maxY)maxY=y; } };
    for (const e of entities) {
      if (e.type === "LINE")        { pt(e.x, e.y); pt(e.x2, e.y2); }
      else if (e.type === "LWPOLYLINE" || e.type === "POLYLINE") (e.vertices || []).forEach(v => pt(v.x, v.y));
      else if (e.type === "CIRCLE") { pt(e.x - e.r, e.y - e.r); pt(e.x + e.r, e.y + e.r); }
      else if (e.type === "ARC")    { pt(e.x - e.r, e.y - e.r); pt(e.x + e.r, e.y + e.r); }
      else if (e.type === "TEXT" || e.type === "MTEXT") { pt(e.x, e.y); pt(e.x + (e.text?.length||1)*(e.height||1), e.y + (e.height||1)); }
    }
    if (!Number.isFinite(minX)) return { minX:0, minY:0, maxX:1000, maxY:1000, w:1000, h:1000 };
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
  }

  /* ── Color per layer ─────────────────────────────────── */
  const LAYER_COLORS = ["#08080A","#6366F1","#B47B3E","#10B981","#EF4444","#06B6D4","#F59E0B","#8B5CF6"];
  function colorForLayer(name, layers) {
    if (name === "0") return "#08080A";
    const idx = layers.indexOf(name);
    return LAYER_COLORS[(idx + 1) % LAYER_COLORS.length];
  }

  /* ── SVG renderer ────────────────────────────────────── */
  function renderSVG(parsed, hiddenLayers) {
    const b = bounds(parsed.entities);
    const pad = Math.max(b.w, b.h) * 0.06 || 100;
    const vbX = b.minX - pad, vbY = b.minY - pad, vbW = b.w + pad*2, vbH = b.h + pad*2;
    const sw = Math.max(b.w, b.h) / 600 || 1; // stroke width auto-scaled

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet">
      <g transform="translate(0 ${b.minY*2 + b.h}) scale(1 -1)">`;

    for (const e of parsed.entities) {
      if (hiddenLayers && hiddenLayers.has(e.layer)) continue;
      const c = colorForLayer(e.layer, parsed.layers);
      if (e.type === "LINE") {
        svg += `<line x1="${e.x}" y1="${e.y}" x2="${e.x2}" y2="${e.y2}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
      } else if (e.type === "LWPOLYLINE" || e.type === "POLYLINE") {
        const closed = (e.flags & 1) === 1;
        const pts = (e.vertices || []).map(v => `${v.x},${v.y}`).join(" ");
        if (pts) svg += `<${closed ? "polygon" : "polyline"} points="${pts}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
      } else if (e.type === "CIRCLE") {
        svg += `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="none" stroke="${c}" stroke-width="${sw}"/>`;
      } else if (e.type === "ARC") {
        const rad = Math.PI / 180;
        const a1 = e.start * rad, a2 = e.end * rad;
        const x1 = e.x + e.r * Math.cos(a1), y1 = e.y + e.r * Math.sin(a1);
        const x2 = e.x + e.r * Math.cos(a2), y2 = e.y + e.r * Math.sin(a2);
        const large = ((e.end - e.start + 360) % 360) > 180 ? 1 : 0;
        svg += `<path d="M ${x1} ${y1} A ${e.r} ${e.r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${sw}"/>`;
      } else if (e.type === "TEXT" || e.type === "MTEXT") {
        svg += `<g transform="translate(${e.x} ${e.y}) scale(1 -1)"><text x="0" y="0" font-family="Geist Mono, monospace" font-size="${e.height||1}" fill="${c}">${(e.text||"").replace(/[<>&]/g,"")}</text></g>`;
      }
    }
    svg += `</g></svg>`;
    return { svg, bounds: b };
  }

  /* ── PDF export (jsPDF) ──────────────────────────────── */
  async function exportPDF(parsed, hiddenLayers, filename) {
    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "assets/js/jspdf.umd.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    const { jsPDF } = window.jspdf;
    const b = bounds(parsed.entities);
    const pad = Math.max(b.w, b.h) * 0.06 || 100;

    // A3 landscape, mm
    const pageW = 420, pageH = 297;
    const marginX = 40, marginY = 30;
    const drawW = pageW - marginX*2, drawH = pageH - marginY*2 - 18; // 18mm for title block
    const scale = Math.min(drawW / (b.w + pad*2), drawH / (b.h + pad*2));
    const dxfToMM = scale; // 1 dxf unit = scale mm

    const tx = (x) => marginX + (x - b.minX + pad) * dxfToMM;
    const ty = (y) => marginY + drawH - (y - b.minY + pad) * dxfToMM;

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    pdf.setLineCap("round"); pdf.setLineJoin("round");

    // Frame
    pdf.setDrawColor(8, 8, 10); pdf.setLineWidth(0.6);
    pdf.rect(marginX, marginY, drawW, drawH);

    // Entities
    for (const e of parsed.entities) {
      if (hiddenLayers && hiddenLayers.has(e.layer)) continue;
      const hex = colorForLayer(e.layer, parsed.layers);
      const rgb = hexToRgb(hex);
      pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
      pdf.setLineWidth(0.18);

      if (e.type === "LINE") {
        pdf.line(tx(e.x), ty(e.y), tx(e.x2), ty(e.y2));
      } else if (e.type === "LWPOLYLINE" || e.type === "POLYLINE") {
        const v = e.vertices || []; if (v.length < 2) continue;
        for (let i = 0; i < v.length - 1; i++) pdf.line(tx(v[i].x), ty(v[i].y), tx(v[i+1].x), ty(v[i+1].y));
        if ((e.flags & 1) === 1 && v.length > 2) pdf.line(tx(v[v.length-1].x), ty(v[v.length-1].y), tx(v[0].x), ty(v[0].y));
      } else if (e.type === "CIRCLE") {
        pdf.circle(tx(e.x), ty(e.y), e.r * dxfToMM, "S");
      } else if (e.type === "ARC") {
        // Approximate as polyline
        const seg = 24;
        const a1 = e.start * Math.PI / 180, a2 = e.end * Math.PI / 180;
        const delta = ((a2 - a1) + 2*Math.PI) % (2*Math.PI);
        let prevX = e.x + e.r * Math.cos(a1), prevY = e.y + e.r * Math.sin(a1);
        for (let i = 1; i <= seg; i++) {
          const t = a1 + (delta * i / seg);
          const x = e.x + e.r * Math.cos(t), y = e.y + e.r * Math.sin(t);
          pdf.line(tx(prevX), ty(prevY), tx(x), ty(y));
          prevX = x; prevY = y;
        }
      } else if (e.type === "TEXT" || e.type === "MTEXT") {
        pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        pdf.setFontSize(Math.max(6, (e.height || 1) * dxfToMM * 2.5));
        pdf.text(String(e.text || ""), tx(e.x), ty(e.y));
        pdf.setTextColor(8, 8, 10);
      }
    }

    // Title block
    const tbX = marginX, tbY = marginY + drawH + 4, tbW = drawW, tbH = 14;
    pdf.setDrawColor(8, 8, 10); pdf.setLineWidth(0.4);
    pdf.rect(tbX, tbY, tbW, tbH);
    pdf.line(tbX + tbW * 0.6, tbY, tbX + tbW * 0.6, tbY + tbH);
    pdf.line(tbX + tbW * 0.8, tbY, tbX + tbW * 0.8, tbY + tbH);

    pdf.setFontSize(8); pdf.setTextColor(134, 134, 126);
    pdf.text("PROJECT", tbX + 4, tbY + 5);
    pdf.text("FILE", tbX + tbW * 0.6 + 4, tbY + 5);
    pdf.text("SCALE · DATE", tbX + tbW * 0.8 + 4, tbY + 5);

    pdf.setFontSize(11); pdf.setTextColor(8, 8, 10);
    pdf.text(filename.replace(/\.[^.]+$/, ""), tbX + 4, tbY + 11);
    pdf.text(filename, tbX + tbW * 0.6 + 4, tbY + 11);
    const today = new Date().toISOString().slice(0, 10);
    pdf.text(`1:${Math.round(1000/dxfToMM)} · ${today}`, tbX + tbW * 0.8 + 4, tbY + 11);

    // BIMHub watermark (top right)
    pdf.setFontSize(7); pdf.setTextColor(180, 123, 62);
    pdf.text("CONVERTED BY BIMHUB · BIMHUB.APP", pageW - marginX, marginY - 4, { align: "right" });

    pdf.save(filename.replace(/\.(dxf|dwg)$/i, "") + "-bimhub.pdf");
  }

  function hexToRgb(hex) {
    const m = hex.replace("#", "");
    return { r: parseInt(m.slice(0,2),16), g: parseInt(m.slice(2,4),16), b: parseInt(m.slice(4,6),16) };
  }

  /* ── Sample DXF (small floor plan in mm) ──────────────── */
  const SAMPLE_DXF = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
ENTITIES
0
LWPOLYLINE
8
WALL
90
4
70
1
10
0
20
0
10
10000
20
0
10
10000
20
6000
10
0
20
6000
0
LINE
8
WALL
10
4000
20
0
11
4000
21
3500
0
LINE
8
WALL
10
4000
20
3500
11
10000
21
3500
0
LINE
8
WALL
10
6500
20
3500
11
6500
21
6000
0
LINE
8
DOOR
10
4000
20
1500
11
4000
21
2300
0
ARC
8
DOOR
10
4000
20
2300
40
800
50
180
51
270
0
LINE
8
DOOR
10
5500
20
3500
11
6300
21
3500
0
ARC
8
DOOR
10
6300
20
3500
40
800
50
90
51
180
0
LWPOLYLINE
8
WINDOW
90
2
10
500
20
0
10
1500
20
0
0
LWPOLYLINE
8
WINDOW
90
2
10
2500
20
0
10
3500
20
0
0
LWPOLYLINE
8
WINDOW
90
2
10
7000
20
0
10
9500
20
0
0
LWPOLYLINE
8
WINDOW
90
2
10
10000
20
2000
10
10000
20
4500
0
LWPOLYLINE
8
FURNITURE
90
5
70
1
10
500
20
500
10
1500
20
500
10
1500
20
1300
10
500
20
1300
10
500
20
500
0
LWPOLYLINE
8
FURNITURE
90
5
70
1
10
2000
20
500
10
3500
20
500
10
3500
20
1500
10
2000
20
1500
10
2000
20
500
0
CIRCLE
8
FURNITURE
10
7500
20
1200
40
600
0
LWPOLYLINE
8
FURNITURE
90
5
70
1
10
4500
20
4000
10
9500
20
4000
10
9500
20
5500
10
4500
20
5500
10
4500
20
4000
0
LINE
8
GRID
10
-500
20
0
11
-500
21
6000
0
LINE
8
GRID
10
-200
20
0
11
-800
21
0
0
LINE
8
GRID
10
-200
20
6000
11
-800
21
6000
0
TEXT
8
DIM
10
-1200
20
3000
40
250
1
6.00
0
TEXT
8
DIM
10
5000
20
-500
40
250
1
10.00
0
TEXT
8
DIM
10
1500
20
800
40
180
1
SALON
0
TEXT
8
DIM
10
7500
20
1200
40
180
1
MUTFAK
0
TEXT
8
DIM
10
7000
20
4750
40
180
1
YATAK ODASI
0
TEXT
8
DIM
10
2000
20
4750
40
180
1
KORIDOR
0
ENDSEC
0
EOF
`;

  /* ── App ─────────────────────────────────────────────── */
  const state = { parsed: null, filename: "demo.dxf", hidden: new Set() };

  function setFile(name) { state.filename = name; $("#filemeta").innerHTML = `<b>${name}</b> · ${state.parsed.entities.length} ${LL("entities")} · ${state.parsed.layers.length} ${LL("layers")}`; }
  function LL(k) {
    const lang = window.BIMHUB_CTX?.LANG?.() || "tr";
    const dict = {
      tr: { entities: "öğe", layers: "katman", drop: "DXF dosyanızı buraya bırakın", or: "veya", sample: "Örnek planı yükle", browse: "Dosya seç", download: "PDF olarak indir", info: "Tarayıcıda · sıfır backend · gerçek vektör PDF" },
      en: { entities: "entities", layers: "layers", drop: "Drop your DXF here", or: "or", sample: "Load sample plan", browse: "Browse file", download: "Download PDF", info: "In-browser · zero backend · real vector PDF" }
    };
    return dict[lang]?.[k] || k;
  }

  function load(text, filename) {
    state.parsed = parseDXF(text);
    state.hidden = new Set();
    state.filename = filename;
    $("#filemeta").innerHTML = `<b>${filename}</b> · ${state.parsed.entities.length} ${LL("entities")} · ${state.parsed.layers.length} ${LL("layers")}`;
    renderLayers();
    repaint();
    $("#stage").classList.add("has-file");
    $("#download").disabled = false;
  }

  function renderLayers() {
    const root = $("#layers");
    root.innerHTML = state.parsed.layers.map(l => {
      const c = colorForLayer(l, state.parsed.layers);
      return `<label class="layer"><input type="checkbox" data-layer="${l}" checked><span class="dot" style="background:${c}"></span><span class="name">${l}</span></label>`;
    }).join("");
    $$("#layers input").forEach(input => {
      input.addEventListener("change", () => {
        const lname = input.dataset.layer;
        if (input.checked) state.hidden.delete(lname); else state.hidden.add(lname);
        repaint();
      });
    });
  }

  function repaint() {
    const { svg } = renderSVG(state.parsed, state.hidden);
    $("#stage-canvas").innerHTML = svg;
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => load(e.target.result, file.name);
    reader.readAsText(file);
  }

  function bind() {
    const drop = $("#drop"), input = $("#file"), stage = $("#stage");
    drop.addEventListener("click", () => input.click());
    input.addEventListener("change", (e) => { if (e.target.files[0]) readFile(e.target.files[0]); });

    ["dragenter","dragover"].forEach(ev => stage.addEventListener(ev, e => { e.preventDefault(); stage.classList.add("is-drag"); }));
    ["dragleave","drop"].forEach(ev => stage.addEventListener(ev, e => { e.preventDefault(); stage.classList.remove("is-drag"); }));
    stage.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) readFile(f); });

    $("#sample").addEventListener("click", () => load(SAMPLE_DXF, "ornek-kat-plani.dxf"));
    $("#download").addEventListener("click", async () => {
      if (!state.parsed) return;
      $("#download").disabled = true;
      $("#download").textContent = LL("download") + "…";
      try { await exportPDF(state.parsed, state.hidden, state.filename); window.BIMHUB_TOAST?.("✓ PDF"); }
      catch (e) { console.error(e); alert("PDF export failed"); }
      finally { $("#download").disabled = false; $("#download").textContent = LL("download"); }
    });

    // Localize on language change
    const refresh = () => {
      $("#drop-title").textContent = LL("drop");
      $("#drop-or").textContent    = LL("or");
      $("#sample").textContent     = LL("sample");
      $("#browse").textContent     = LL("browse");
      $("#download").textContent   = LL("download");
      $("#tagline").textContent    = LL("info");
      if (state.parsed) $("#filemeta").innerHTML = `<b>${state.filename}</b> · ${state.parsed.entities.length} ${LL("entities")} · ${state.parsed.layers.length} ${LL("layers")}`;
    };
    refresh();
    window.BIMHUB_RENDER = refresh;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
