# BIMHub · BIM × AI Tool Hub

**BIMHub**, mimar, mühendis ve yüklenicinin tekrar eden BIM işlerini saniyelere
indiren küçük, odaklı yapay zekâ araçlarının bulunduğu bir SaaS markası için
tasarlanmış iki dilli (TR/EN) erken-erişim landing sitesidir. Aylık abonelik
modeli üzerine kurgulanmıştır.

> Marka detayları için → [`BRAND.md`](BRAND.md)

## ✦ Özellikler

- **5 sayfa:** Anasayfa (hero + 6 öne çıkan araç + nasıl çalışır + fiyat + FAQ),
  Tüm Araçlar (16 araç + kategori filtresi), Fiyatlandırma (3 katman + özellik
  karşılaştırma tablosu), Hakkımızda, Bekleme Listesi Onayı
- **16 BIM aracı kataloğu** (5 kategori): Görselleştirme · Dokümantasyon ·
  Analiz & Koordinasyon · Ofis & Üretkenlik · Üretken AI
- **Tam iki dilli:** Türkçe ↔ English; tek tıkla geçiş,
  `localStorage` ile kalıcı, tarayıcı diline göre otomatik tespit
- **3 katmanlı fiyatlandırma:** Free · Pro €19/ay · Studio €79/kul/ay; aylık/yıllık
  geçiş (%17 indirim göstergesi)
- **Bekleme listesi formu:** `localStorage`'a kayıt, başarı ekranına yönlendirme,
  paylaşım (Web Share API + clipboard fallback)
- **Tamamen responsive:** masaüstü, tablet, mobil; mobilde kayar drawer menü
- **PWA:** offline destek, "Ana ekrana ekle", `bimhub-v1` service worker
- **Bağımsız:** framework yok, build adımı yok — saf HTML/CSS/JS

## 📁 Yapı

```
index.html        Anasayfa (hero · pillars · 6 araç · how-it-works · 3 fiyat · FAQ · CTA)
tools.html        Araç kataloğu (16 araç · kategori filtresi)
pricing.html      Fiyat (3 katman + özellik karşılaştırma)
about.html        Vizyon · ilkeler
waitlist.html     Erken erişim onay ekranı
assets/
  css/style.css   Tüm tasarım sistemi (Fraunces + Inter + JetBrains Mono)
  js/i18n.js      TR + EN sözlük (180+ anahtar)
  js/tools.js     16 aracın katalog verisi (her biri çift dilli + SVG ikon)
  js/app.js       Header/footer/drawer enjeksiyonu · i18n · FAQ · form · reveal
  img/            logo.svg · favicon.svg
  icons/          PWA ikonları (apple touch, 152, 167, 180, 192, 512)
sw.js             Service worker
manifest.webmanifest  PWA manifest
```

## ▶ Çalıştırma

Build gerektirmez:

```bash
python3 -m http.server 8000
# Tarayıcı: http://localhost:8000
```

## 🚀 Yayınlama

Statik site — Vercel, Netlify, GitHub Pages'e olduğu gibi yüklenebilir
(`vercel.json` ve `netlify.toml` dahil). Kök dizin doğrudan deploy.

## 🛠 Özelleştirme

- **Araçlar:** `assets/js/tools.js` — `cat` (viz/doc/anl/ofc/gen),
  `status` (live/beta/soon), `name`, `desc`, `io`, `icon` (inline SVG path).
- **Renkler / tipografi:** `assets/css/style.css` en üstteki `:root` token'ları.
- **Çeviriler:** `assets/js/i18n.js` — `tr` ve `en` sözlüklerinde aynı anahtarlar.
- **Fiyatlandırma:** `index.html` ve `pricing.html` içindeki `.price` blokları
  + i18n anahtarları `price.*` ve `cmp.*`.
- **Bekleme listesi:** Üretimde `assets/js/app.js` içindeki `bindWaitlistForms`
  fonksiyonunda `localStorage` yerine `POST /api/waitlist` çağrısı yapılmalıdır.

## 💰 Monetizasyon Modeli

| Katman | Fiyat | Hedef |
|---|---|---|
| **Free** | €0 | Keşif, küçük projeler, filigranlı çıktı |
| **Pro** ⭐ | €19/ay (yıllık €15) | Serbest mimar / küçük büro · sınırsız işlem |
| **Studio** | €79/kullanıcı/ay | Ofis · takım · SSO · API |

İlk 500 erken erişim kullanıcısı için Pro 3 ay %50 indirimli.

## 💳 Stripe Checkout

`assets/js/checkout.js` Stripe Checkout için **production-ready**. Şu an `demo`
modda — gerçek ödeme yerine Stripe-stili önizleme modal'ı açılır.

Canlıya almak için her sayfada `</body>` öncesi şu config ekleyin:

```html
<script>
window.BIMHUB_STRIPE_CONFIG = {
  mode: "live",                              // "demo" → "live"
  publicKey: "pk_live_…",                    // Stripe Dashboard'dan
  prices: {
    "pro-monthly":    { id: "price_…", amount: 19,  currency: "EUR" },
    "pro-yearly":     { id: "price_…", amount: 180, currency: "EUR" },
    "studio-monthly": { id: "price_…", amount: 79,  currency: "EUR" },
    "studio-yearly":  { id: "price_…", amount: 792, currency: "EUR" }
  }
};
</script>
<script src="assets/js/checkout.js"></script>
```

Butonlara `data-checkout="pro"` veya `data-checkout="studio"` koyun;
billing-toggle aktif değerine göre `-monthly` / `-yearly` çözülür.

## 🛠 Canlı Demo: DXF → PDF

`demo.html` — tamamen tarayıcıda çalışan ilk gerçek araç. Backend yok.

- Drag/drop DXF (veya örnek planı yükle butonu)
- ASCII DXF parser: LINE, LWPOLYLINE, POLYLINE, CIRCLE, ARC, TEXT, MTEXT
- SVG live preview, katman aç/kapa
- jsPDF (lokal vendored, 356 KB) ile gerçek vektör PDF export
- A3 landscape, ölçekli, BIMHub watermark + title block

Ek araç eklemek için:
1. `assets/js/tools.js` içinde `status: "live"` + `href: "demo-X.html"` ekleyin
2. `demo-X.html` ve `assets/js/demo-X.js` oluşturun
3. `sw.js` ASSETS listesine ekleyin
