/* =========================================================
   BIMHub — Checkout (Stripe + demo fallback)
   ---------------------------------------------------------
   Production: window.BIMHUB_STRIPE_CONFIG'i prod ortamda
   gerçek pk_live_... + price_... ID'lerle setleyin.
   Şu an "demo" modda — gerçek Stripe Checkout yerine
   modal gösterir; ürün hazır olunca config'i değiştirip
   gerçek akışı tek satırda aktive edersiniz.
   ========================================================= */
(function () {
  "use strict";

  // ── Config — production'da bu nesneyi gerçek Stripe değerleriyle replace edin ──
  const DEFAULT = {
    mode:        "demo",                // "demo" | "live"
    publicKey:   "",                    // pk_test_... veya pk_live_...
    successUrl:  location.origin + "/waitlist.html?checkout=success",
    cancelUrl:   location.origin + "/pricing.html?checkout=cancel",
    prices: {
      "pro-monthly":      { id: "", amount: 19,  currency: "EUR", interval: "month",  name: "Pro · Monthly"   },
      "pro-yearly":       { id: "", amount: 180, currency: "EUR", interval: "year",   name: "Pro · Yearly"    },
      "studio-monthly":   { id: "", amount: 79,  currency: "EUR", interval: "month",  name: "Studio · Monthly · per seat" },
      "studio-yearly":    { id: "", amount: 792, currency: "EUR", interval: "year",   name: "Studio · Yearly · per seat"  }
    }
  };
  const CFG = Object.assign({}, DEFAULT, window.BIMHUB_STRIPE_CONFIG || {});

  // ── Public API ──────────────────────────────────────────
  window.BIMHubCheckout = {
    start(plan, billing) {
      const key = `${plan}-${billing || "monthly"}`;
      const price = CFG.prices[key];
      if (!price) return console.warn("[BIMHubCheckout] unknown plan:", key);

      if (CFG.mode === "live" && CFG.publicKey && price.id) {
        return goStripe(price);
      }
      openDemoModal(plan, billing, price);
    },
    setConfig(next) { Object.assign(CFG, next); },
    getConfig()     { return Object.assign({}, CFG); }
  };

  // ── Real Stripe Checkout ────────────────────────────────
  async function loadStripeJs() {
    if (window.Stripe) return window.Stripe;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://js.stripe.com/v3/"; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    return window.Stripe;
  }
  async function goStripe(price) {
    try {
      const Stripe = await loadStripeJs();
      const stripe = Stripe(CFG.publicKey);
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: price.id, quantity: 1 }],
        mode: "subscription",
        successUrl: CFG.successUrl,
        cancelUrl: CFG.cancelUrl
      });
      if (error) console.error(error);
    } catch (e) {
      console.error("[BIMHubCheckout] Stripe error", e);
      openDemoModal(price.plan, price.billing, price);
    }
  }

  // ── Demo modal (production'da görünmez) ─────────────────
  const T = (key) => window.BIMHUB_CTX?.T ? window.BIMHUB_CTX.T(key) : key;
  function L() { return window.BIMHUB_CTX?.LANG?.() || "tr"; }

  function openDemoModal(plan, billing, price) {
    closeDemoModal();
    const yearly = billing === "yearly";
    const planLabel = plan === "studio" ? "Studio" : "Pro";
    const tr = L() === "tr";
    const i18n = {
      title:    tr ? "Stripe Checkout · Önizleme" : "Stripe Checkout · Preview",
      demoTag:  tr ? "DEMO MODU"             : "DEMO MODE",
      plan:     tr ? "Plan"                 : "Plan",
      cycle:    tr ? "Fatura döngüsü"       : "Billing cycle",
      total:    tr ? "Toplam (vergi hariç)" : "Total (excl. tax)",
      card:     tr ? "Kart numarası"        : "Card number",
      cardP:    "4242 4242 4242 4242",
      exp:      tr ? "AY/YIL"              : "MM/YY",
      cvc:      "CVC",
      email:    "E-posta",
      pay:      tr ? `Şimdi öde · €${yearly ? (price.amount).toLocaleString(L()==="tr"?"tr-TR":"en-US") : price.amount}` : `Pay now · €${price.amount}`,
      secured:  tr ? "Stripe ile güvenli ödeme" : "Secured by Stripe",
      note:     tr
        ? "Stripe henüz canlı olmadığı için bu bir önizlemedir. Gerçek ödeme için bekleme listesine katılın — sıraniz geldiğinde Pro 3 ay %50 indirimli."
        : "Stripe isn't live yet — this is a preview. Join the waitlist for the real flow; you get 50% off Pro for 3 months when it's your turn.",
      cta:      tr ? "Bekleme Listesine Katıl" : "Join the Waitlist",
      cancel:   tr ? "Kapat" : "Close"
    };

    const wrap = document.createElement("div");
    wrap.className = "checkout-modal";
    wrap.innerHTML = `
      <div class="checkout-modal__panel" role="dialog" aria-modal="true">
        <button class="checkout-modal__close" type="button" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
        </button>

        <div class="checkout-modal__head">
          <div class="checkout-modal__brand">
            <svg viewBox="0 0 40 40" aria-hidden="true" style="width:24px;height:24px"><g stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"><path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"/><path d="M20 4 L20 20 L6 28 M20 20 L34 12"/></g><circle cx="20" cy="20" r="2.6" fill="#6366F1"/></svg>
            <b>BIMHub</b>
          </div>
          <span class="checkout-modal__tag">${i18n.demoTag}</span>
        </div>

        <h3 class="checkout-modal__h">${i18n.title}</h3>

        <div class="checkout-modal__summary">
          <div class="row"><span>${i18n.plan}</span><b>${planLabel}</b></div>
          <div class="row"><span>${i18n.cycle}</span><b>${yearly ? (tr?"Yıllık":"Yearly") : (tr?"Aylık":"Monthly")}</b></div>
          <div class="row total"><span>${i18n.total}</span><b>€${price.amount} <small>${plan === "studio" ? (tr?"/ kul / ay":"/ user / mo") : (tr?"/ ay":"/ mo")}</small></b></div>
        </div>

        <div class="checkout-modal__form">
          <label class="ch-field">
            <span>${i18n.email}</span>
            <input type="email" placeholder="you@studio.com" disabled value="demo@bimhub.app">
          </label>
          <label class="ch-field">
            <span>${i18n.card}</span>
            <div class="ch-card">
              <input type="text" placeholder="${i18n.cardP}" disabled>
              <input type="text" placeholder="${i18n.exp}" disabled style="max-width: 70px">
              <input type="text" placeholder="${i18n.cvc}" disabled style="max-width: 60px">
            </div>
          </label>
          <button type="button" class="btn checkout-modal__pay" disabled>${i18n.pay}</button>
          <div class="checkout-modal__secured">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
            <span>${i18n.secured}</span>
          </div>
        </div>

        <div class="checkout-modal__note">
          <p>${i18n.note}</p>
          <div class="checkout-modal__actions">
            <button type="button" class="btn btn--ghost" data-close>${i18n.cancel}</button>
            <a href="#waitlist" class="btn btn--ochre" data-close-and-scroll>${i18n.cta} <span class="arrow">→</span></a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => wrap.classList.add("is-open"));

    wrap.querySelector(".checkout-modal__close").addEventListener("click", closeDemoModal);
    wrap.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeDemoModal));
    wrap.querySelector("[data-close-and-scroll]").addEventListener("click", e => {
      closeDemoModal();
      setTimeout(() => {
        const t = document.getElementById("waitlist");
        if (t) t.scrollIntoView({ behavior: "smooth" });
      }, 200);
    });
    wrap.addEventListener("click", e => { if (e.target === wrap) closeDemoModal(); });
    document.addEventListener("keydown", escClose);
  }
  function escClose(e) { if (e.key === "Escape") closeDemoModal(); }
  function closeDemoModal() {
    const m = document.querySelector(".checkout-modal");
    if (!m) return;
    m.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", escClose);
    setTimeout(() => m.remove(), 220);
  }

  // ── Bind pricing buttons ───────────────────────────────
  function bind() {
    document.querySelectorAll("[data-checkout]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const plan = btn.dataset.checkout;
        const billing = (document.querySelector(".billing-toggle .is-active")?.dataset.bill) || "monthly";
        window.BIMHubCheckout.start(plan, billing);
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
