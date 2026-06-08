# Resolved Field — ECY UK design system

Bespoke görsel dil: **ölçülmüş kaos → düzen**, *nokta bulutu → yapısal çizgi*.
Scan‑to‑BIM'in görsel karşılığı. Espresso zemin · tek bir pirinç (brass) aksan ·
kemik beyazı sözcükler · monospace koordinatlar.

## Dosyalar
| Dosya | Ne |
|---|---|
| `resolved-field.css` | Tasarım sistemi — renk/tipografi token'ları, grid, enstrümanlar |
| `field.js` | Prosedürel motor — binlerce noktayı dağınıktan çizgiye çözer (canvas) |
| `capability-statement.html` | Tek sayfa (A4 dikey) capability statement |
| `deck.html` | 12 slaytlık sunum (16:9) — faz faz çözülen anlatı |

## Görüntüleme
```bash
cd uk-market-expansion/design
python3 -m http.server 8000
# Tarayıcı: http://localhost:8000/deck.html  ve  /capability-statement.html
```
Deck'te gezinme: **← / →** ok tuşları (ya da kaydır). Her slaytın `data-phase`
değeri farklı bir "odak derinliği" — scatter (.16) → resolved line (1.0).

## PDF / sunum çıktısı
- **Capability statement → PDF:** sayfayı tarayıcıda aç → `Cmd/Ctrl+P` → *Save as PDF*,
  kenar boşlukları **None**, arka plan grafikleri **açık**, A4 **dikey**.
- **Deck → PDF:** `deck.html` → yazdır → A4 **yatay**, her slayt ayrı sayfa olacak
  şekilde ayarlı. (Ekranda canlı sunmak için doğrudan `deck.html`'i tam ekran aç.)
- **PowerPoint gerekiyorsa:** PDF'i içe aktar ya da iste — slaytları PPTX'e çeviririm.

## Doldurulacak alanlar (`{{ }}`)
- `{{UK phone}}`, `{{rami@ecy.com.tr}}` — Rami'nin UK iletişimi
- Slide 06–08 vaka rakamları: `{{350}}`, `{{000}}`, `{{m²}}`, `{{LOD}}`, `{{0}}wk` —
  **gerçek sayılarla** değiştir (boş placeholder satmaz).

## Notlar
- Tamamen bağımsız (framework yok). Gerçek görseller (render/foto) eklemek istersen
  `field.js` arkasındaki canvas'ın üstüne `.plate > .ink` içinde `<img>` yerleştirebiliriz.
- `prefers-reduced-motion` saygılı: açılışta tek seferlik "çözülme" animasyonu, sonra sabit.
