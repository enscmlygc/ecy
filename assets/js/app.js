/* =========================================================
   BIMHub — Application (v2)
   Header/footer/drawer · i18n · counters · toast · magnetic
   waitlist form · faq · reveal · cmdk
   ========================================================= */
(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const STORAGE_LANG = "bimhub.lang";
  const STORAGE_WL   = "bimhub.waitlist";

  /* ── Language ─────────────────────────────────────────── */
  function detectLang() {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved === "tr" || saved === "en") return saved;
    const url = new URL(location.href);
    const qp = url.searchParams.get("lang");
    if (qp === "tr" || qp === "en") return qp;
    const nav = (navigator.language || "tr").toLowerCase();
    return nav.startsWith("tr") ? "tr" : "en";
  }

  let LANG = detectLang();
  document.documentElement.lang = LANG;

  const T = (key) => {
    const dict = window.BIMHUB_I18N?.[LANG] || {};
    return dict[key] ?? window.BIMHUB_I18N?.tr?.[key] ?? key;
  };

  function applyI18n(root = document) {
    $$("[data-i18n]", root).forEach(el => {
      const key = el.getAttribute("data-i18n");
      const attr = el.getAttribute("data-i18n-attr");
      const val = T(key);
      if (attr) el.setAttribute(attr, val);
      else el.innerHTML = val;
    });
  }

  function setLang(lang) {
    LANG = lang;
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_LANG, lang);
    applyI18n();
    $$(".lang-toggle button").forEach(b => b.classList.toggle("is-active", b.dataset.lang === lang));
    if (typeof window.BIMHUB_RENDER === "function") window.BIMHUB_RENDER();
    const meta = document.querySelector('meta[name="description"]');
    if (meta && meta.dataset.i18n) meta.setAttribute("content", T(meta.dataset.i18n));
  }
  window.BIMHUB_SET_LANG = setLang;

  /* ── Logo SVG (shared) ──────────────────────────────── */
  const MARK = `<svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" stroke-linecap="round">
      <path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"/>
      <path d="M20 4 L20 20 L6 28 M20 20 L34 12"/>
    </g>
    <circle cx="20" cy="20" r="2.6" fill="#6366F1"/>
  </svg>`;

  /* ── Status bar ───────────────────────────────────────── */
  function injectStatusBar() {
    const host = $("#site-statusbar");
    if (!host) return;
    host.innerHTML = `
      <div class="statusbar">
        <div class="wrap">
          <div class="statusbar__track">
            <span><span class="statusbar__dot"></span><span data-i18n="sb.status">${T("sb.status")}</span></span>
            <span>·</span>
            <span><b data-counter data-target="4213" class="tabular">4,213</b> <span data-i18n="sb.waitlist">${T("sb.waitlist")}</span></span>
            <span>·</span>
            <span><span data-i18n="sb.changelog">${T("sb.changelog")}</span> <a href="changelog.html" data-i18n="sb.cta">${T("sb.cta")}</a></span>
          </div>
        </div>
      </div>
    `;
  }

  /* ── Header ───────────────────────────────────────────── */
  function injectHeader() {
    const host = $("#site-header");
    if (!host) return;
    const path = location.pathname.split("/").pop() || "index.html";
    const link = (href, key) => `<a href="${href}" data-i18n="${key}" class="${path === href ? 'is-active' : ''}">${T(key)}</a>`;

    host.innerHTML = `
      <header class="site-header">
        <div class="wrap site-header__inner">
          <a href="index.html" class="brand" aria-label="BIMHub">
            ${MARK}<span class="brand__name">BIM<i>hub</i></span>
          </a>
          <nav class="nav" aria-label="Primary">
            <div class="nav__links">
              ${link("tools.html",     "nav.tools")}
              ${link("pricing.html",   "nav.pricing")}
              ${link("roadmap.html",   "nav.roadmap")}
              ${link("about.html",     "nav.about")}
              ${link("changelog.html", "nav.changelog")}
            </div>
            <div class="nav__cta">
              <button class="cmdk" type="button" data-cmdk aria-label="Search">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                <span data-i18n="nav.search">${T("nav.search")}</span>
                <kbd>⌘K</kbd>
              </button>
              <div class="lang-toggle" role="group" aria-label="Language">
                <button type="button" data-lang="tr" class="${LANG === 'tr' ? 'is-active' : ''}">TR</button>
                <button type="button" data-lang="en" class="${LANG === 'en' ? 'is-active' : ''}">EN</button>
              </div>
              <a href="#waitlist" class="btn btn--sm" data-i18n="nav.start">${T("nav.start")}</a>
              <button class="mob-toggle" aria-label="Menu" type="button">
                <svg viewBox="0 0 24 24"><path d="M3 7h18M3 17h18"/></svg>
              </button>
            </div>
          </nav>
        </div>
      </header>
    `;

    $$(".lang-toggle button", host).forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
    $(".mob-toggle", host)?.addEventListener("click", openDrawer);
    $("[data-cmdk]", host)?.addEventListener("click", openCmdk);

    const headerEl = $(".site-header", host);
    const onScroll = () => headerEl.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Drawer (mobile menu) ─────────────────────────────── */
  function injectDrawer() {
    const host = $("#site-drawer");
    if (!host) return;
    host.innerHTML = `
      <div class="drawer" id="drawer">
        <div class="drawer__panel">
          <div class="drawer__head">
            <a href="index.html" class="brand">${MARK}<span class="brand__name">BIM<i>hub</i></span></a>
            <button class="drawer__close" aria-label="Close" type="button">
              <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>
            </button>
          </div>
          <nav class="drawer__links" aria-label="Mobile">
            <a href="tools.html"     data-i18n="nav.tools">${T("nav.tools")}</a>
            <a href="pricing.html"   data-i18n="nav.pricing">${T("nav.pricing")}</a>
            <a href="roadmap.html"   data-i18n="nav.roadmap">${T("nav.roadmap")}</a>
            <a href="about.html"     data-i18n="nav.about">${T("nav.about")}</a>
            <a href="changelog.html" data-i18n="nav.changelog">${T("nav.changelog")}</a>
          </nav>
          <div class="drawer__foot">
            <div class="lang-toggle" role="group">
              <button type="button" data-lang="tr" class="${LANG === 'tr' ? 'is-active' : ''}">TR</button>
              <button type="button" data-lang="en" class="${LANG === 'en' ? 'is-active' : ''}">EN</button>
            </div>
            <a href="#waitlist" class="btn" data-i18n="nav.start">${T("nav.start")}</a>
          </div>
        </div>
      </div>
    `;
    const drawer = $("#drawer", host);
    $(".drawer__close", host).addEventListener("click", closeDrawer);
    drawer.addEventListener("click", e => { if (e.target === drawer) closeDrawer(); });
    $$(".drawer__panel a", host).forEach(a => a.addEventListener("click", closeDrawer));
    $$(".lang-toggle button", host).forEach(b => b.addEventListener("click", () => { setLang(b.dataset.lang); closeDrawer(); }));
  }
  function openDrawer()  { $("#drawer")?.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeDrawer() { $("#drawer")?.classList.remove("is-open"); document.body.style.overflow = ""; }

  /* ── Footer ───────────────────────────────────────────── */
  function injectFooter() {
    const host = $("#site-footer");
    if (!host) return;
    host.innerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="site-footer__grid">
            <div class="site-footer__brand">
              <a href="index.html" class="brand" aria-label="BIMHub">${MARK}<span class="brand__name">BIM<i>hub</i></span></a>
              <p data-i18n="footer.tag">${T("footer.tag")}</p>
              <span class="site-footer__status" data-i18n="footer.status">${T("footer.status")}</span>
            </div>
            <div class="site-footer__col">
              <h5 data-i18n="footer.product">${T("footer.product")}</h5>
              <a href="tools.html"     data-i18n="footer.tools">${T("footer.tools")}</a>
              <a href="pricing.html"   data-i18n="footer.pricing">${T("footer.pricing")}</a>
              <a href="roadmap.html"   data-i18n="footer.roadmap">${T("footer.roadmap")}</a>
              <a href="changelog.html" data-i18n="footer.changelog">${T("footer.changelog")}</a>
            </div>
            <div class="site-footer__col">
              <h5 data-i18n="footer.company">${T("footer.company")}</h5>
              <a href="about.html" data-i18n="footer.about">${T("footer.about")}</a>
              <a href="#" data-i18n="footer.blog">${T("footer.blog")}</a>
              <a href="#" data-i18n="footer.contact">${T("footer.contact")}</a>
              <a href="#" data-i18n="footer.careers">${T("footer.careers")}</a>
            </div>
            <div class="site-footer__col">
              <h5 data-i18n="footer.legal">${T("footer.legal")}</h5>
              <a href="#" data-i18n="footer.privacy">${T("footer.privacy")}</a>
              <a href="#" data-i18n="footer.terms">${T("footer.terms")}</a>
              <a href="#" data-i18n="footer.security">${T("footer.security")}</a>
              <a href="#" data-i18n="footer.dpa">${T("footer.dpa")}</a>
            </div>
          </div>
          <div class="site-footer__bottom">
            <span data-i18n="footer.copy">${T("footer.copy")}</span>
            <div class="socials">
              <a href="#" aria-label="LinkedIn">LINKEDIN</a>
              <a href="#" aria-label="X">X</a>
              <a href="#" aria-label="GitHub">GITHUB</a>
              <a href="#" aria-label="Instagram">INSTAGRAM</a>
            </div>
            <span data-i18n="footer.built">${T("footer.built")}</span>
          </div>
        </div>
      </footer>
    `;
  }

  /* ── Tool grid rendering ──────────────────────────────── */
  function chipFor(status) {
    if (status === "live") return `<span class="tool__chip tool__chip--live" data-i18n="chip.live">${T("chip.live")}</span>`;
    if (status === "beta") return `<span class="tool__chip tool__chip--beta" data-i18n="chip.beta">${T("chip.beta")}</span>`;
    return `<span class="tool__chip tool__chip--soon" data-i18n="chip.soon">${T("chip.soon")}</span>`;
  }
  const catLabel = (cat) => {
    const map = { viz: "tools.filter.viz", doc: "tools.filter.doc", anl: "tools.filter.anl", ofc: "tools.filter.ofc", gen: "tools.filter.gen" };
    return T(map[cat] || "tools.filter.all");
  };

  window.renderTools = function (selector, list) {
    const root = $(selector);
    if (!root) return;
    root.innerHTML = list.map(t => `
      <article class="tool" data-cat="${t.cat}" data-id="${t.id}">
        <div class="tool__head">
          <div class="tool__icon"><svg viewBox="0 0 24 24">${t.icon}</svg></div>
          ${chipFor(t.status)}
        </div>
        <div>
          <div class="tool__cat">${catLabel(t.cat)}</div>
          <h3>${t.name[LANG] || t.name.tr}</h3>
        </div>
        <p>${t.desc[LANG] || t.desc.tr}</p>
        <div class="tool__foot">
          <span class="mono">${t.io.in} → ${t.io.out}</span>
          <a href="#waitlist" class="arrow" aria-label="open">→</a>
        </div>
      </article>
    `).join("");
  };

  /* ── Tools page filter + search ───────────────────────── */
  function applyToolsFilter() {
    const cat = $(".tools-bar button.is-active")?.dataset.filter || "all";
    const q   = ($(".tools-search input")?.value || "").trim().toLowerCase();
    let list = cat === "all" ? window.BIMHUB_TOOLS : window.BIMHUB_TOOLS.filter(t => t.cat === cat);
    if (q) {
      list = list.filter(t =>
        (t.name[LANG] || t.name.tr).toLowerCase().includes(q) ||
        (t.desc[LANG] || t.desc.tr).toLowerCase().includes(q) ||
        t.id.includes(q)
      );
    }
    window.renderTools("#tools-grid", list);
    observeReveals();
  }
  function bindToolsFilter() {
    const bar = $(".tools-bar");
    if (bar) {
      bar.addEventListener("click", e => {
        const btn = e.target.closest("button[data-filter]");
        if (!btn) return;
        $$("button", bar).forEach(b => b.classList.toggle("is-active", b === btn));
        applyToolsFilter();
      });
    }
    const search = $(".tools-search input");
    search?.addEventListener("input", () => applyToolsFilter());
  }

  /* ── Waitlist form ────────────────────────────────────── */
  function bindWaitlistForms() {
    $$("form[data-waitlist]").forEach(form => {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const input = form.querySelector("input[type=email]");
        const msg   = form.parentElement.querySelector(".signup__msg") || form.querySelector(".signup__msg");
        const email = (input.value || "").trim();
        if (!email || !/.+@.+\..+/.test(email)) {
          if (msg) msg.textContent = LANG === "tr" ? "Geçerli bir e-posta giriniz." : "Please enter a valid email.";
          input.focus();
          return;
        }
        const list = JSON.parse(localStorage.getItem(STORAGE_WL) || "[]");
        if (!list.includes(email)) list.push(email);
        localStorage.setItem(STORAGE_WL, JSON.stringify(list));
        if (msg) msg.textContent = "✓ " + T("cta.success");
        input.value = "";
        showToast(T("cta.success"));
        if (form.dataset.redirect === "true") {
          setTimeout(() => location.href = "waitlist.html?email=" + encodeURIComponent(email), 700);
        }
      });
    });
  }

  /* ── FAQ ──────────────────────────────────────────────── */
  function bindFaq() {
    $$(".faq__item").forEach(item => {
      const q = item.querySelector(".faq__q");
      q?.addEventListener("click", () => item.classList.toggle("is-open"));
    });
  }

  /* ── Reveal on scroll ─────────────────────────────────── */
  let io;
  function observeReveals() {
    io?.disconnect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      $$(".reveal").forEach(el => el.classList.add("is-in"));
      return;
    }
    io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    $$(".reveal:not(.is-in)").forEach(el => io.observe(el));
    setTimeout(() => $$(".reveal:not(.is-in)").forEach(el => el.classList.add("is-in")), 2000);
  }

  /* ── Animated counters ────────────────────────────────── */
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseFloat(el.dataset.target) || 0;
    const decimals = (el.dataset.decimals|0);
    const dur = 1400;
    const start = performance.now();
    const fmt = LANG === "tr" ? "tr-TR" : "en-US";
    const formatter = new Intl.NumberFormat(fmt, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatter.format(target * eased);
      if (t < 1) requestAnimationFrame(step); else el.textContent = formatter.format(target);
    };
    requestAnimationFrame(step);
  }
  function bindCounters() {
    if (!("IntersectionObserver" in window)) {
      $$("[data-counter]").forEach(animateCounter);
      return;
    }
    const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); o.unobserve(e.target); } }), { threshold: .4 });
    $$("[data-counter]").forEach(el => o.observe(el));
  }

  /* ── Billing toggle ───────────────────────────────────── */
  function bindBillingToggle() {
    const wrap = $(".billing-toggle");
    if (!wrap) return;
    wrap.addEventListener("click", e => {
      const btn = e.target.closest("button[data-bill]");
      if (!btn) return;
      $$("button", wrap).forEach(b => b.classList.toggle("is-active", b === btn));
      const yearly = btn.dataset.bill === "yearly";
      $$("[data-price-monthly]").forEach(el => el.style.display = yearly ? "none" : "");
      $$("[data-price-yearly]").forEach(el  => el.style.display = yearly ? "" : "none");
    });
  }

  /* ── Toast ────────────────────────────────────────────── */
  function ensureToastHost() {
    let t = $("#bimhub-toast");
    if (t) return t;
    t = document.createElement("div");
    t.id = "bimhub-toast"; t.className = "toast";
    t.innerHTML = `<span class="toast__icon"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-11"/></svg></span><span class="toast__msg"></span>`;
    document.body.appendChild(t);
    return t;
  }
  function showToast(msg) {
    const t = ensureToastHost();
    $(".toast__msg", t).textContent = msg;
    t.classList.add("is-show");
    clearTimeout(t._hide);
    t._hide = setTimeout(() => t.classList.remove("is-show"), 2600);
  }
  window.BIMHUB_TOAST = showToast;

  /* ── Magnetic CTA buttons ─────────────────────────────── */
  function bindMagnetic() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    $$(".btn, .tool, .bento__card").forEach(el => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translateY(-1px) translate(${x * 3}px, ${y * 3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ── Cmd+K modal (placeholder) ────────────────────────── */
  function openCmdk() {
    showToast(LANG === "tr" ? "Arama yakında — şimdilik Araçlar sayfası" : "Search coming soon — go to Tools");
    setTimeout(() => location.href = "tools.html", 800);
  }
  function bindCmdK() {
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCmdk();
      }
    });
  }

  /* ── Bootstrap ────────────────────────────────────────── */
  function boot() {
    document.documentElement.classList.add("js");
    injectStatusBar();
    injectHeader();
    injectFooter();
    injectDrawer();
    applyI18n();
    bindWaitlistForms();
    bindFaq();
    bindToolsFilter();
    bindBillingToggle();
    bindCmdK();
    bindMagnetic();

    window.BIMHUB_CTX = { T, LANG: () => LANG, tools: window.BIMHUB_TOOLS };
    if (typeof window.BIMHUB_PAGE === "function") window.BIMHUB_PAGE(window.BIMHUB_CTX);
    if (typeof window.BIMHUB_RENDER === "function") window.BIMHUB_RENDER();

    observeReveals();
    bindCounters();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
