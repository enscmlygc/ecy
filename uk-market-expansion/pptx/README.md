# ECY — UK Pitch Deck (PPTX)

Native, **düzenlenebilir** PowerPoint — "Resolved Field" estetiğinde. Nokta‑bulutu
arka planları prosedürel üretilir (`render_field.py`), metin PPTX içinde gerçek metin
olarak durur (Windows fontları: **Segoe UI** + **Consolas**).

## Çıktı
**`ECY-UK-Pitch-Deck.pptx`** — 12 slayt, 16:9. PowerPoint / Keynote / Google Slides'ta açılır.

## Yeniden üretmek
```bash
cd uk-market-expansion/pptx
pip install python-pptx Pillow numpy
python3 build_pptx.py        # → ECY-UK-Pitch-Deck.pptx
```

## Slayt düzeni
| # | Slayt | Not |
|---|---|---|
| 01 | Kapak — scatter | Rami UK iletişim |
| 02 | Who we are | 218 / 17 / 15 |
| 03 | The problem | |
| 04 | Services | 5 hizmet |
| 05 | Why ECY | |
| 06 | **Erbil** | LOD 350 · 829 clash · 20 hafta · görsel: `projects/erbil/` |
| 07 | **HEMA, Emmen** | 3 500 m² · LOD 300 · 8 hafta · split scan‑to‑bim arka plan |
| 08 | **Leas Pavilion (UK)** | BIM Manager'ın saha tecrübesi olarak sunulur · görsel: `projects/leas/` |
| 09 | How we work | |
| 10 | Pricing | 3 model |
| 11 | **Contacts** | Rami (UK) + Enes Cemil Yağcı (Kurucu & BIM Manager, TR) |
| 12 | CTA · pilot | |

## İletişim bilgileri (gömülü)
- **Rami Daşkın** — UK Representative — +44 7786 410586 — rami@ecy.com.tr *(bu maili açman gerekebilir)*
- **Enes Cemil Yağcı** — Founder & BIM Manager — +90 533 566 67 80 — info@ecy.com.tr

## Leas Pavilion — yasal çerçeve (önemli)
Bu proje slaytta **ECY'nin doğrudan aldığı iş** olarak değil, **BIM Manager Enes Cemil
Yağcı'nın profesyonel saha tecrübesi** olarak sunulur ("Selected experience · UK" /
"Track record"). Önceki işveren adı **geçmez**. Künye metnini `projects/leas/`'e koyarsan
slayt 08'deki yer tutucu künyeyi onunla değiştiririm.

## Görseller
`projects/erbil|hema|leas/` klasörlerine görselleri koy, `build_pptx.py`'yi tekrar çalıştır.
Detay: `projects/README.md`.
