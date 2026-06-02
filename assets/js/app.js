/* =========================================================
   ESSE — Uygulama mantığı
   Header/Footer/Sepet enjeksiyonu · localStorage sepet ·
   ürün render · etkileşimler
   ========================================================= */
(function () {
  "use strict";

  const TL = n => new Intl.NumberFormat("tr-TR").format(n) + " ₺";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const P = window.ESSE_PRODUCTS || [];
  const byId = id => P.find(p => p.id === id);

  /* ---- İkonlar ---- */
  const I = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    user:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
    heart:  '<svg viewBox="0 0 24 24"><path d="M12 21C5 15.5 3 12 3 8.5 3 6 5 4 7.5 4 9.5 4 11 5.2 12 7c1-1.8 2.5-3 4.5-3C19 4 21 6 21 8.5 21 12 19 15.5 12 21Z"/></svg>',
    bag:    '<svg viewBox="0 0 24 24"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu:   '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    ig:     '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>',
    fb:     '<svg viewBox="0 0 24 24"><path d="M14 8h2V5h-2c-2 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.2l.5-3H14V8.5c0-.4.2-.5.6-.5Z"/></svg>',
    pin:    '<svg viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    truck:  '<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
    refresh:'<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M19 4v5h-5M5 20v-5h5"/></svg>',
    lock:   '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    gift:   '<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 13h16M12 9v11M9 9C7 9 6 7.5 7 6.5 8 5.5 12 9 12 9s4-3.5 5-2.5C18 7.5 17 9 15 9"/></svg>',
    leaf:   '<svg viewBox="0 0 24 24"><path d="M5 20c0-9 6-15 14-15 0 9-6 15-14 15Z"/><path d="M5 20c3-6 7-9 11-10"/></svg>',
    scissors:'<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 8M8 16 20 8"/></svg>',
    mail:   '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
    phone:  '<svg viewBox="0 0 24 24"><path d="M5 4h4l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v4c0 1-.8 1.8-1.8 1.6A17 17 0 0 1 3.4 6.8 1.6 1.6 0 0 1 5 4Z"/></svg>'
  };

  /* ===================== HEADER ===================== */
  const navLinks = [
    { t: "Anasayfa",   h: "index.html",          key: "home" },
    { t: "Yeni Sezon", h: "shop.html",            key: "shop" },
    { t: "Elbise",     h: "shop.html?cat=elbise", key: "elbise" },
    { t: "Üst Giyim",  h: "shop.html?cat=ust-giyim", key: "ust-giyim" },
    { t: "Dış Giyim",  h: "shop.html?cat=dis-giyim", key: "dis-giyim" },
    { t: "İndirim",    h: "shop.html?cat=sale",   key: "sale", sale: true },
    { t: "Hikâyemiz",  h: "about.html",           key: "about" }
  ];

  function buildHeader() {
    const active = document.body.dataset.page || "";
    const nav = navLinks.map(l =>
      `<a href="${l.h}" class="${l.sale ? "sale" : ""} ${l.key === active ? "active" : ""}">${l.t}</a>`
    ).join("");
    const mnav = navLinks.map(l => `<a href="${l.h}">${l.t}</a>`).join("");

    const html = `
    <div class="announce"><span>Türkiye geneli 1500 ₺ üzeri kargo ücretsiz · Spring / Summer '26 koleksiyonu yayında</span></div>
    <header class="header" id="hdr">
      <div class="header__bar">
        <nav class="nav">${nav}</nav>
        <button class="menu-toggle" id="menuToggle" aria-label="Menü">${I.menu}</button>
        <a href="index.html" class="logo" aria-label="Esse anasayfa">esse<small>atelier</small></a>
        <div class="header__actions">
          <button class="icon-btn" aria-label="Ara">${I.search}</button>
          <a href="about.html" class="icon-btn" aria-label="Hesabım">${I.user}</a>
          <button class="icon-btn" aria-label="Favoriler">${I.heart}</button>
          <button class="icon-btn" id="cartToggle" aria-label="Sepet">${I.bag}<span class="cart-count" id="cartCount"></span></button>
        </div>
      </div>
    </header>
    <nav class="mobile-nav" id="mobileNav">
      <button class="mobile-nav__close" id="mobileClose" aria-label="Kapat">&times;</button>
      ${mnav}
    </nav>`;
    const mount = $("#site-header");
    if (mount) mount.innerHTML = html;
  }

  /* ===================== FOOTER ===================== */
  function buildFooter() {
    const html = `
    <footer class="footer">
      <div class="wrap">
        <div class="footer__top">
          <div class="footer__brand">
            <div class="logo">esse<small>atelier</small></div>
            <p>Modern kadının zarafetini sade, zamansız ve özenle seçilmiş parçalarla buluşturan butik moda evi.</p>
            <div class="footer__social">
              <a href="#" aria-label="Instagram">${I.ig}</a>
              <a href="#" aria-label="Facebook">${I.fb}</a>
              <a href="#" aria-label="Pinterest">${I.pin}</a>
            </div>
          </div>
          <div class="footer__col">
            <h4>Koleksiyon</h4>
            <ul>
              <li><a href="shop.html">Yeni Sezon</a></li>
              <li><a href="shop.html?cat=elbise">Elbise</a></li>
              <li><a href="shop.html?cat=ust-giyim">Üst Giyim</a></li>
              <li><a href="shop.html?cat=dis-giyim">Dış Giyim</a></li>
              <li><a href="shop.html?cat=sale">İndirim</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4>Hesabım</h4>
            <ul>
              <li><a href="#">Giriş Yap</a></li>
              <li><a href="#">Siparişlerim</a></li>
              <li><a href="#">Favorilerim</a></li>
              <li><a href="index.html#davet">Arkadaşını Davet Et</a></li>
              <li><a href="#">Sipariş Takibi</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4>Kurumsal</h4>
            <ul>
              <li><a href="about.html">Hakkımızda</a></li>
              <li><a href="contact.html">İletişim</a></li>
              <li><a href="#">Teslimat & İade</a></li>
              <li><a href="#">Gizlilik Politikası</a></li>
              <li><a href="#">Mesafeli Satış Sözleşmesi</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} Esse · Tüm hakları saklıdır.</span>
          <div class="pay"><span>VISA</span><span>MASTERCARD</span><span>TROY</span><span>IYZICO</span></div>
        </div>
      </div>
    </footer>`;
    const mount = $("#site-footer");
    if (mount) mount.innerHTML = html;
  }

  /* ===================== SEPET DRAWER ===================== */
  function buildDrawer() {
    const html = `
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="drawer" aria-label="Sepet">
      <div class="drawer__head">
        <h3>Sepetim</h3>
        <button class="drawer__close" id="drawerClose" aria-label="Kapat">&times;</button>
      </div>
      <div class="drawer__items" id="drawerItems"></div>
      <div class="drawer__foot" id="drawerFoot"></div>
    </aside>
    <div class="toast" id="toast"></div>`;
    const mount = $("#site-drawer");
    if (mount) mount.innerHTML = html;
  }

  /* ===================== SEPET DURUMU ===================== */
  const CART_KEY = "esse_cart";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  function addToCart(id, opts = {}) {
    const p = byId(id); if (!p) return;
    const size = opts.size || p.sizes[0];
    const key = id + "|" + size;
    const ex = cart.find(c => c.key === key);
    if (ex) ex.qty += (opts.qty || 1);
    else cart.push({ key, id, size, qty: opts.qty || 1 });
    saveCart(); renderCart(); openDrawer();
    toast(`${p.name} sepete eklendi`);
  }
  function setQty(key, delta) {
    const it = cart.find(c => c.key === key); if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart = cart.filter(c => c.key !== key);
    saveCart(); renderCart();
  }
  function removeItem(key) { cart = cart.filter(c => c.key !== key); saveCart(); renderCart(); }
  const cartTotal = () => cart.reduce((s, c) => { const p = byId(c.id); return s + (p ? (p.oldPrice && p.sale ? p.price : p.price) * c.qty : 0); }, 0);
  const cartCount = () => cart.reduce((s, c) => s + c.qty, 0);

  // Fotoğrafsız ürünler için ürünün kendi paletinden zarif, açık tonlu degrade
  const PH_PAIRS = [
    ["#EFE3D0", "#FAF6EF"], ["#E7D8C1", "#F4ECE0"], ["#E3D7C6", "#F7F1E7"],
    ["#EAD9BF", "#F2EADC"], ["#E0D2BE", "#F5EFE4"], ["#ECDFCB", "#F8F3EA"],
    ["#E6D5BA", "#F3ECDF"], ["#DECEB6", "#F6F0E6"]
  ];
  function phStyle(p) {
    const i = Math.max(0, P.indexOf(p));
    const [a, b] = PH_PAIRS[i % PH_PAIRS.length];
    return `--g1:${a};--g2:${b}`;
  }
  function mediaHtml(p, cls = "") {
    if (p.img) return `<img class="${cls}" src="${p.img}" alt="${p.name}" loading="lazy">`;
    return `<div class="ph ${cls}" style="${phStyle(p)}"><b>esse</b><span>${p.cat}</span></div>`;
  }

  function renderCart() {
    const cc = $("#cartCount");
    if (cc) { const n = cartCount(); cc.textContent = n; cc.dataset.count = n; }
    const items = $("#drawerItems"), foot = $("#drawerFoot");
    if (!items) return;
    if (!cart.length) {
      items.innerHTML = `<div class="drawer__empty"><p style="font-family:var(--serif);font-size:24px;margin-bottom:10px">Sepetiniz boş</p><p>Koleksiyonu keşfedin ve favori parçalarınızı ekleyin.</p><a href="shop.html" class="btn btn--ghost" style="margin-top:22px">Alışverişe Başla</a></div>`;
      foot.innerHTML = "";
      return;
    }
    items.innerHTML = cart.map(c => {
      const p = byId(c.id); if (!p) return "";
      return `<div class="citem">
        <a href="product.html?id=${p.id}" class="citem__img">${mediaHtml(p)}</a>
        <div>
          <a href="product.html?id=${p.id}"><div class="citem__name">${p.name}</div></a>
          <div class="citem__meta">Beden: ${c.size}</div>
          <div class="citem__qty">
            <button data-q="-" data-k="${c.key}">−</button><span>${c.qty}</span><button data-q="+" data-k="${c.key}">+</button>
          </div>
        </div>
        <div class="citem__right">
          <div class="citem__price">${TL(p.price * c.qty)}</div>
          <button class="citem__rm" data-rm="${c.key}">Kaldır</button>
        </div>
      </div>`;
    }).join("");
    foot.innerHTML = `
      <div class="drawer__sub"><span>Ara Toplam</span><b>${TL(cartTotal())}</b></div>
      <p class="drawer__note">${cartTotal() >= 1500 ? "Kargo ücretsiz 🎁" : `${TL(1500 - cartTotal())} daha ekleyin, kargo bedava.`}</p>
      <button class="btn btn--block" id="checkout">Ödemeye Geç</button>`;
  }

  /* ===================== DRAWER UI ===================== */
  function openDrawer() { $("#drawer")?.classList.add("open"); $("#overlay")?.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeDrawer() { $("#drawer")?.classList.remove("open"); $("#overlay")?.classList.remove("open"); document.body.style.overflow = ""; }

  let toastT;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ===================== ÜRÜN KARTI ===================== */
  function cardHtml(p) {
    const tag = p.tag ? `<span class="card__tag ${p.sale ? "sale" : ""}">${p.tag}</span>` : "";
    const price = p.oldPrice
      ? `<span class="old">${TL(p.oldPrice)}</span><span class="new">${TL(p.price)}</span>`
      : `${TL(p.price)}`;
    const colors = p.colors.map(c => `<span class="swatch" style="background:${c}"></span>`).join("");
    return `<article class="card reveal">
      <div class="card__media">
        ${tag}
        <button class="card__fav" data-fav="${p.id}" aria-label="Favori">${I.heart}</button>
        <a href="product.html?id=${p.id}">${mediaHtml(p, "main")}</a>
        <button class="card__add" data-add="${p.id}">Sepete Ekle</button>
      </div>
      <div class="card__cat">${p.cat}</div>
      <h3 class="card__name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <div class="card__price">${price}</div>
      <div class="card__colors">${colors}</div>
    </article>`;
  }

  function renderGrid(sel, list) {
    const el = $(sel); if (!el) return;
    el.innerHTML = list.map(cardHtml).join("");
  }

  /* ===================== ETKİLEŞİMLER ===================== */
  function bindGlobal() {
    document.addEventListener("click", e => {
      const add = e.target.closest("[data-add]");
      if (add) { addToCart(add.dataset.add); return; }
      const fav = e.target.closest("[data-fav]");
      if (fav) { fav.classList.toggle("on"); return; }
      const q = e.target.closest("[data-q]");
      if (q) { setQty(q.dataset.k, q.dataset.q === "+" ? 1 : -1); return; }
      const rm = e.target.closest("[data-rm]");
      if (rm) { removeItem(rm.dataset.rm); return; }
      const cp = e.target.closest("[data-copy]");
      if (cp) { copyCode(cp.dataset.copy); return; }
      if (e.target.closest("#cartToggle")) { openDrawer(); return; }
      if (e.target.closest("#drawerClose") || e.target.id === "overlay") { closeDrawer(); return; }
      if (e.target.closest("#checkout")) { toast("Ödeme adımı yakında — demo mağaza"); return; }
      if (e.target.closest("#menuToggle")) { $("#mobileNav")?.classList.add("open"); document.body.style.overflow = "hidden"; return; }
      if (e.target.closest("#mobileClose")) { $("#mobileNav")?.classList.remove("open"); document.body.style.overflow = ""; return; }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

    // Header gölge
    const hdr = $("#hdr");
    if (hdr) {
      const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 10);
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
  }

  /* ---- Davet kodu kopyala ---- */
  function copyCode(code) {
    const done = () => toast("Davet kodu kopyalandı: " + code);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done));
    } else {
      fallbackCopy(code, done);
    }
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) { /* sessiz */ }
    document.body.removeChild(ta);
  }

  /* ---- Newsletter ---- */
  function bindNewsletter() {
    const f = $("#newsForm"); if (!f) return;
    f.addEventListener("submit", e => {
      e.preventDefault();
      const m = $("#newsMsg");
      if (m) m.textContent = "Teşekkürler! Esse dünyasına hoş geldiniz ✦";
      f.reset();
    });
  }

  /* ---- Reveal on scroll (stagger destekli) ---- */
  function bindReveal() {
    const els = $$(".reveal");
    // Stagger: .stagger içindeki kardeşlere kademeli gecikme
    $$(".stagger").forEach(group => {
      group.querySelectorAll(".reveal").forEach((el, i) => {
        el.style.transitionDelay = (i * 90) + "ms";
      });
    });
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
  }

  /* ---- Hareket azaltma tercihi ---- */
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Tek rAF kaydırma motoru: ilerleme + parallax + story ---- */
  function bindScrollEngine() {
    if (reduceMotion) return;
    const prog = $(".scroll-prog");
    const parax = $$("[data-parallax]");
    const story = $(".story");
    const storyMedia = story && story.querySelector(".story__media img, .story__media video");
    const storyLines = story ? $$(".story__line", story) : [];
    let ticking = false;

    function frame() {
      ticking = false;
      const y = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;

      // İlerleme çubuğu
      if (prog) {
        const max = document.documentElement.scrollHeight - vh;
        prog.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      }
      // Parallax (görsel hafifçe kayar)
      parax.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          const off = (r.top + r.height / 2 - vh / 2) * -speed;
          el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0) scale(1.12)";
        }
      });
      // Sinematik story: kaydırma ilerlemesine göre zoom + yazı geçişi
      if (story && storyMedia) {
        const rect = story.getBoundingClientRect();
        const total = rect.height - vh;
        const p = Math.min(Math.max(-rect.top / (total || 1), 0), 1);
        storyMedia.style.transform = "scale(" + (1.18 - p * 0.18).toFixed(3) + ")";
        if (storyLines.length) {
          const idx = Math.min(Math.floor(p * storyLines.length), storyLines.length - 1);
          storyLines.forEach((l, i) => l.classList.toggle("on", i === idx));
        }
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    frame();
  }

  /* ---- Video slotu: dosya varsa otomatik <video> yükle (yoksa görsel kalır) ---- */
  function bindVideoSlots() {
    $$("[data-video]").forEach(slot => {
      const src = slot.dataset.video;
      if (!src) return;
      fetch(src, { method: "HEAD" }).then(r => {
        if (!r.ok) return;
        const v = document.createElement("video");
        v.src = src; v.muted = true; v.loop = true; v.autoplay = true;
        v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "metadata";
        const poster = slot.querySelector("img");
        if (poster) poster.replaceWith(v); else slot.prepend(v);
        v.play().catch(() => {});
      }).catch(() => {});
    });
  }

  /* ===================== INIT ===================== */
  /* ---- Karşılama (splash) ekranı ---- */
  function showSplash() {
    // Sadece anasayfada ve oturum başına bir kez göster.
    // Ana ekrana eklenmiş uygulamada (standalone) her açılışta gösterilir.
    var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (document.body.getAttribute("data-page") !== "home") return;
    if (!standalone && sessionStorage.getItem("esseSplash")) return;
    sessionStorage.setItem("esseSplash", "1");

    var el = document.createElement("div");
    el.className = "splash";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="splash__mark">' +
        '<div class="splash__logo">esse</div>' +
        '<div class="splash__rule"><i></i><b></b><i></i></div>' +
        '<div class="splash__sub">Atelier</div>' +
      '</div>';
    document.body.appendChild(el);
    document.body.style.overflow = "hidden";

    var hold = reduceMotion ? 600 : 1700;
    setTimeout(function () {
      el.classList.add("hide");
      document.body.style.overflow = "";
      setTimeout(function () { el.remove(); }, 750);
    }, hold);
  }

  function init() {
    showSplash();
    // Üst ilerleme çizgisi
    if (!reduceMotion && !$(".scroll-prog")) {
      const bar = document.createElement("div");
      bar.className = "scroll-prog";
      document.body.prepend(bar);
    }
    buildHeader(); buildFooter(); buildDrawer();
    renderCart(); bindGlobal(); bindNewsletter();

    // Sayfaya özel render hook'ları
    if (typeof window.ESSE_PAGE === "function") window.ESSE_PAGE({ P, renderGrid, cardHtml, byId, TL, addToCart, mediaHtml, getParam, I });

    bindReveal();
    bindVideoSlots();
    bindScrollEngine();
    registerSW();
  }
  function getParam(k) { return new URLSearchParams(location.search).get(k); }

  /* ---- Service Worker (PWA / çevrimdışı) ---- */
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost") return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
