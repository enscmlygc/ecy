# BIMHub — Marka Kılavuzu

> Mimar, mühendis ve yüklenicinin tekrar eden günlük BIM işlerini saniyelere
> indiren, küçük ve odaklı yapay zekâ araçlarının buluştuğu merkez.

---

## 1. Marka Özü

| | |
|---|---|
| **İsim** | BIMHub |
| **Okunuş** | "bim-hab" |
| **Anlam** | **BIM** (Building Information Modeling) için tek **hub** — çok sayıda küçük aracın bir araya geldiği merkez. |
| **Slogan TR** | **Tüm BIM iş akışınız, tek merkezde.** |
| **Slogan EN** | **One hub for all your BIM tools.** |
| **Konumlandırma** | AEC dünyası için aylık abonelikli, AI-destekli, modüler araç koleksiyonu (Linear/Notion/Figma modeli) |
| **Hedef kitle** | Mimar, BIM yöneticisi, inşaat mühendisi, küçük-orta ölçekli mimarlık ofisi, yüklenici, müfettiş |

### Marka sesi
Net, teknik, kendinden emin, samimi. Mimarın diliyle konuşur (DWG, IFC, metraj,
çakışma) — ama mühendislik jargonunda boğulmaz. "Sıkıcı işleri saniyelere
indiriyoruz" mesajını her zaman duyurur. Demogracı, saklı fiyatçı veya satış-baskıcı
değildir.

---

## 2. Renk Paleti — *Architectural Light*

ArchDaily editorial estetiği · sıcak nötr zeminler · tek aksan rengi.

| Token | Hex | Kullanım |
|---|---|---|
| Bg | `#FAFAF7` | Ana arka plan (warm white) |
| Bg-2 | `#F4F2EC` | İkincil zemin |
| Surface | `#FFFFFF` | Kart, fiyat tablosu, fotoğraf zemini |
| Surface-alt | `#F7F5EF` | Hover zemin |
| Ink | `#0E0E0C` | Ana metin, başlıklar, primary butonlar |
| Graphite | `#2A2A26` | Gövde metin |
| Slate | `#4A4A45` | İkincil metin |
| Mute | `#86867E` | Etiket, alt metin |
| Soft | `#B7B5AD` | Devre dışı |
| Line | `#E8E5DE` | Hairline çizgi |
| Line-strong | `#CFCBC1` | Form, kart kenarı |
| **Ochre (aksan)** | `#B47B3E` | İtalik vurgu, ikon noktası, "Yakında" çipi, CTA hover |
| Ochre-d | `#8E5E29` | Aksan hover |
| Blueprint | `#1E3A5F` | Beta çip, link vurgusu |
| Green | `#2F6A4A` | Başarı durumu |

---

## 3. Tipografi

- **Display / Başlıklar:** `Fraunces` (Google Fonts) — değişken eksenli (opsz,
  wght, SOFT) modern editorial serif. Hafif italik vurgu ile **ochre** renk.
- **Gövde / UI:** `Inter` — okunaklı geometrik sans, 300-600 ağırlık.
- **Mono detaylar:** `JetBrains Mono` — etiket, kod-vurgu, dosya formatı (DWG · IFC),
  fiyat tablosu sütun başlığı, eyebrow, scale bar, çizim bilgi bloğu.

Kurallar:
- H1: `clamp(44px, 7.4vw, 104px)`, italik vurgu `<em>` ochre renk.
- Eyebrow: 11px, BÜYÜK HARF, ochre, .22em harf aralığı, önünde 22px ince çizgi.
- Logo wordmark: `BIM` (medium, ink) + `hub` (italic regular, ink), önünde isometric kübik mark.

---

## 4. Logo

- **Birincil:** İzometrik küp dış çizgisi (BIM modelinin 3B doğasını referans
  alan vektör çizimi) + sağında "BIMhub" wordmark; "BIM" medium dik, "hub" italic.
  → `assets/img/logo.svg`
- **Mark / Favicon:** Koyu kare içinde beyaz izometrik küp + ochre vertex noktası.
  → `assets/img/favicon.svg`
- Vertex noktası **ochre (#B47B3E)** — markanın aksan rengi.
- Yanlış kullanım: gölge, eğme, renk değişimi, sıkıştırma, küpü ayırma, italic'i kaldırma.

---

## 5. Görsel Dil

- **Blueprint grid** (24px noktalı grid, opacity .04-.06) — hero, CTA strip
  zemini için.
- **Izometrik wireframe yapı çizimleri** — hero görseli, hakkımızda sayfası.
  Her çizimde **annotation pin** ve **scale bar** + **title block** (gerçek
  mimari pafta hissi).
- **Hairline çizgiler** — bölümler, kartlar, fiyat sütunları arasında 1px
  `--line` rengi.
- **Mono etiketler** — DWG · PDF · IFC · RVT gibi dosya formatları, scale bar,
  pafta numarası — `JetBrains Mono` ile yazılır.
- **Bol negatif alan** — section padding `clamp(72px, 11vw, 140px)`, başlık
  alt metni 60ch ile sınırlı.
- **Tool ikonu:** 44x44 yuvarlatılmış kare, hover'da -3° dönüş + invert renk.

---

## 6. UI İlkeleri

- Form: 999px radius, hairline kenarlık, focus'ta ink kenarlık.
- Buton: 999px pill, dolu ink → hover'da grafit; ochre varyant CTA için.
- Tool card: 0 köşe yarıçapı (grid hissi), border-collapse görünümü.
- Pricing kartı: 14px radius (yumuşak), Pro katmanı koyu zemin (feature card).
- Hareket: `cubic-bezier(.22,.61,.36,1)`, scroll'da yumuşak reveal.
- FAQ: tek tık aç/kapa, `+` → `×` rotate, max-height transition.
- Lang toggle: TR / EN pill, aktif olan ink zemin beyaz metin.

---

## 7. Ses & Mikro-Yazım

### TR
- "Tek tıkla", "Saniyeler içinde", "Filigransız çıktı", "Sınırsız işlem"
- Kaçınılan: "Mükemmel", "Devrim niteliğinde", "Lider", "Profesyonel çözüm"

### EN
- "In seconds", "One click", "Watermark-free", "Unlimited runs"
- Avoided: "Revolutionary", "Best-in-class", "Industry-leading", "Enterprise-grade"

---

## 8. Alan Adı Önerileri

`bimhub.com` · `bim-hub.io` · `bimhub.app` · `bimhub.studio` · `bimhub.tools`
(Site kodu içinde örnek olarak `bimhub.com` kullanılmıştır.)

---

## 9. Monetizasyon

3 katmanlı abonelik (freemium → Pro → Studio). Free her zaman ücretsiz; Pro
serbest çalışan için, Studio ofis/takım için. Erken erişimde ilk 500 kullanıcıya
Pro 3 ay %50 indirim. Yıllık abonelikte %17 tasarruf.
