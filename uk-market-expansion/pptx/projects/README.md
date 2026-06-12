# Proje görselleri — buraya koy

Slaytlara gömülecek görseller. Her projenin klasörüne görselleri at, sonra
`build_pptx.py`'yi tekrar çalıştır — alfabetik ilk görsel ilgili slayta yerleşir
(kapak/cover gibi düşün). Yoksa slaytta "PROJECT IMAGE → push…" yer tutucusu görünür.

| Klasör | Slayt | Proje |
|---|---|---|
| `erbil/` | 06 | Erbil International Hospital (LOD 350 · 829 clash · 20 hafta) |
| `hema/`  | 07 | HEMA, Emmen (3 500 m² · LOD 300 · 8 hafta) — arka plan zaten split scan-to-bim |
| `leas/`  | 08 | Leas Pavilion, UK — BIM Manager'ın saha tecrübesi olarak sunulur |

Desteklenen: jpg, jpeg, png, webp. Yatay (landscape) görseller en iyi oturur (~4:3).

## Nasıl push'larsın (Windows, repo kökünde)
```cmd
copy "C:\Users\ECY\Desktop\008 BEE4GIS\SLAYT GORSELLER\erbil\*.jpg" uk-market-expansion\pptx\projects\erbil\
git add uk-market-expansion/pptx/projects
git commit -m "Proje gorselleri eklendi"
git push origin claude/uk-market-expansion-plx09t
```
