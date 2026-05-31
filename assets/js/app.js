/* =========================================================
   BIMHub — Application
   Header/footer injection · i18n · mobile drawer · waitlist
   form · tool grid render · faq accordion · reveal animation
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
    return dict[key] || window.BIMHUB_I18N?.tr?.[key] || key;
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
    // Re-render dynamic content
    if (typeof window.BIMHUB_RENDER === "function") window.BIMHUB_RENDER();
    // Update meta description if present
    const meta = document.querySelector('meta[name="description"]');
    if (meta && meta.dataset.i18n) meta.setAttribute("content", T(meta.dataset.i18n));
  }
  window.BIMHUB_SET_LANG = setLang;

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
            <svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
              <g stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" stroke-linecap="round">
                <path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"/>
                <path d="M20 4 L20 20 L6 28 M20 20 L34 12"/>
              </g>
              <circle cx="20" cy="20" r="2.4" fill="#B47B3E"/>
            </svg>
            <span class="brand__name"><b>BIM</b>hub</span>
          </a>
          <nav class="nav" aria-label="Primary">
            <div class="nav__links">
              ${link("tools.html",   "nav.tools")}
              ${link("pricing.html", "nav.pricing")}
              ${link("about.html",   "nav.about")}
            </div>
            <div class="nav__cta">
              <div class="lang-toggle" role="group" aria-label="Language">
                <button type="button" data-lang="tr" class="${LANG === 'tr' ? 'is-active' : ''}">TR</button>
                <button type="button" data-lang="en" class="${LANG === 'en' ? 'is-active' : ''}">EN</button>
              </div>
              <a href="#waitlist" class="btn btn--sm" data-i18n="nav.start">${T("nav.start")}</a>
              <button class="mob-toggle" aria-label="Menu" type="button">
                <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              </button>
            </div>
          </nav>
        </div>
      </header>
    `;

    // Lang buttons
    $$(".lang-toggle button", host).forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
    // Mobile drawer
    $(".mob-toggle", host)?.addEventListener("click", openDrawer);

    // Sticky shadow on scroll
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
            <a href="index.html" class="brand">
              <svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
                <g stroke="currentColor" stroke-width="1.4" fill="none"><path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"/><path d="M20 4 L20 20 L6 28 M20 20 L34 12"/></g>
                <circle cx="20" cy="20" r="2.4" fill="#B47B3E"/>
              </svg>
              <span class="brand__name"><b>BIM</b>hub</span>
            </a>
            <button class="drawer__close" aria-label="Close" type="button">
              <svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20"/></svg>
            </button>
          </div>
          <nav class="drawer__links" aria-label="Mobile">
            <a href="tools.html"    data-i18n="nav.tools">${T("nav.tools")}</a>
            <a href="pricing.html"  data-i18n="nav.pricing">${T("nav.pricing")}</a>
            <a href="about.html"    data-i18n="nav.about">${T("nav.about")}</a>
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
              <a href="index.html" class="brand" aria-label="BIMHub">
                <svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true" style="width:32px;height:32px">
                  <g stroke="currentColor" stroke-width="1.4" fill="none"><path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"/><path d="M20 4 L20 20 L6 28 M20 20 L34 12"/></g>
                  <circle cx="20" cy="20" r="2.4" fill="#B47B3E"/>
                </svg>
                <span class="brand__name"><b>BIM</b>hub</span>
              </a>
              <p data-i18n="footer.tag">${T("footer.tag")}</p>
            </div>
            <div class="site-footer__col">
              <h5 data-i18n="footer.product">${T("footer.product")}</h5>
              <a href="tools.html"   data-i18n="footer.tools">${T("footer.tools")}</a>
              <a href="pricing.html" data-i18n="footer.pricing">${T("footer.pricing")}</a>
              <a href="#"            data-i18n="footer.roadmap">${T("footer.roadmap")}</a>
              <a href="#"            data-i18n="footer.changelog">${T("footer.changelog")}</a>
            </div>
            <div class="site-footer__col">
              <h5 data-i18n="footer.company">${T("footer.company")}</h5>
              <a href="about.html"   data-i18n="footer.about">${T("footer.about")}</a>
              <a href="#"            data-i18n="footer.blog">${T("footer.blog")}</a>
              <a href="#"            data-i18n="footer.contact">${T("footer.contact")}</a>
              <a href="#"            data-i18n="footer.careers">${T("footer.careers")}</a>
            </div>
            <div class="site-footer__col">
              <h5 data-i18n="footer.legal">${T("footer.legal")}</h5>
              <a href="#" data-i18n="footer.privacy">${T("footer.privacy")}</a>
              <a href="#" data-i18n="footer.terms">${T("footer.terms")}</a>
              <a href="#" data-i18n="footer.security">${T("footer.security")}</a>
            </div>
          </div>
          <div class="site-footer__bottom">
            <span data-i18n="footer.copy">${T("footer.copy")}</span>
            <div class="socials">
              <a href="#" aria-label="LinkedIn">LINKEDIN</a>
              <a href="#" aria-label="X / Twitter">X</a>
              <a href="#" aria-label="Instagram">INSTAGRAM</a>
              <a href="#" aria-label="GitHub">GITHUB</a>
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

  window.renderTools = function (selector, list, opts = {}) {
    const root = $(selector);
    if (!root) return;
    const action = opts.live ? "tool.open" : "tool.early";
    root.innerHTML = list.map(t => `
      <article class="tool" data-cat="${t.cat}">
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
          <a href="#waitlist" aria-label="${T(action)}"><span class="arrow">→</span></a>
        </div>
      </article>
    `).join("");
  };

  /* ── Tools page filter ────────────────────────────────── */
  function bindToolsFilter() {
    const bar = $(".tools-bar");
    if (!bar) return;
    bar.addEventListener("click", e => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      $$("button", bar).forEach(b => b.classList.toggle("is-active", b === btn));
      const cat = btn.dataset.filter;
      const list = cat === "all" ? window.BIMHUB_TOOLS : window.BIMHUB_TOOLS.filter(t => t.cat === cat);
      window.renderTools("#tools-grid", list);
      observeReveals();
    });
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
        // Persist locally (demo) — production would POST to /api/waitlist
        const list = JSON.parse(localStorage.getItem(STORAGE_WL) || "[]");
        if (!list.includes(email)) list.push(email);
        localStorage.setItem(STORAGE_WL, JSON.stringify(list));
        if (msg) msg.textContent = T("cta.success");
        input.value = "";

        // If we're on a primary CTA, optionally redirect to waitlist confirm
        if (form.dataset.redirect === "true") {
          setTimeout(() => location.href = "waitlist.html?email=" + encodeURIComponent(email), 600);
        }
      });
    });
  }

  /* ── FAQ accordion ────────────────────────────────────── */
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
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$(".reveal:not(.is-in)").forEach(el => io.observe(el));
    // Safety: ensure everything is visible after ~2s in case observer never fires
    // (Playwright fullPage screenshots, headless renderers, SEO crawlers)
    setTimeout(() => $$(".reveal:not(.is-in)").forEach(el => el.classList.add("is-in")), 2000);
  }

  /* ── Billing toggle (pricing page) ────────────────────── */
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

  /* ── Bootstrap ────────────────────────────────────────── */
  function boot() {
    document.documentElement.classList.add("js");
    injectHeader();
    injectFooter();
    injectDrawer();
    applyI18n();
    bindWaitlistForms();
    bindFaq();
    bindToolsFilter();
    bindBillingToggle();

    // Page-specific render hook
    window.BIMHUB_CTX = { T, LANG: () => LANG, tools: window.BIMHUB_TOOLS };
    if (typeof window.BIMHUB_PAGE === "function") window.BIMHUB_PAGE(window.BIMHUB_CTX);
    if (typeof window.BIMHUB_RENDER === "function") window.BIMHUB_RENDER();

    observeReveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
