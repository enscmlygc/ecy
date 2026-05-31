# Esse İstanbul · Butik Moda E-Ticaret Sitesi

**Esse**, modern kadının zarafetini sade, zamansız parçalarla buluşturan kurgusal bir kadın giyim butiği için tasarlanmış marka kimliği + e-ticaret vitrin sitesidir. *Şampanya & Krem* paletinde, quiet-luxury estetiğiyle hazırlanmıştır.

> Marka detayları için → [`BRAND.md`](BRAND.md)

## ✦ Özellikler

- **5 sayfa:** Anasayfa, Koleksiyon (filtre + sıralama), Ürün detayı, Hikâyemiz, İletişim
- **Çalışan sepet:** `localStorage` ile kalıcı; kayar sepet çekmecesi, adet, ücretsiz kargo eşiği
- **Ürün kataloğu:** 12 ürün, kategori filtreleri, indirim etiketleri, renk seçenekleri
- **Tamamen responsive:** mobil menü dahil; masaüstü/tablet/telefon
- **Bağımsız:** framework yok, build adımı yok — saf HTML/CSS/JS
- **AI üretimi editöryel görseller** + ölçeklenebilir SVG logo/favicon

## 📁 Yapı

```
index.html        Anasayfa (hero, kategoriler, yeni sezon, hikâye, lookbook, bülten)
shop.html         Koleksiyon — kategori filtresi + sıralama (?cat= parametresi)
product.html      Ürün detayı (?id= parametresi)
about.html        Marka hikâyesi / Hakkımızda
contact.html      İletişim formu
assets/
  css/style.css   Tüm tasarım sistemi (renk token'ları, tipografi, bileşenler)
  js/products.js  Ürün kataloğu verisi
  js/app.js       Header/footer/sepet enjeksiyonu + tüm etkileşimler
  img/            Hero & lookbook görselleri, logo.svg, favicon.svg
```

## ▶ Çalıştırma

Build gerektirmez. Herhangi bir statik sunucu yeterli:

```bash
python3 -m http.server 8000
# Tarayıcı: http://localhost:8000
```

## 🚀 Yayınlama

Statik site olduğu için Vercel, Netlify veya GitHub Pages'e olduğu gibi yüklenebilir
(`vercel.json` dahildir). Kök dizin doğrudan deploy edilebilir.

## 🛠 Özelleştirme

- **Ürünler:** `assets/js/products.js` içinden düzenleyin (fiyat, isim, kategori, görsel).
- **Renkler/yazı tipleri:** `assets/css/style.css` en üstteki `:root` token'ları.
- **Metinler/menü:** ilgili `.html` dosyaları ve `app.js` içindeki `navLinks` / footer.
