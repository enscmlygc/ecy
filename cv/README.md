# CV — Enes Cemil Yağcı

Yurtdışı **Remote BIM Manager / BIM Coordinator** başvuruları için hazırlanan profesyonel İngilizce CV.

## Dosyalar
- `en/index.html` — İngilizce CV kaynağı (A4 baskı CSS'li tek HTML dosyası)
- `en/Enes-Cemil-Yagci-CV-EN.pdf` — yurtdışı başvurularda kullanılacak nihai PDF (2 sayfa)
- `tr/index.html` + `tr/Enes-Cemil-Yagci-CV-TR.pdf` — aynı tasarımla Türkçe versiyon (2 sayfa)
- `assets/fonts/` + `assets/fonts.css` — gömülü fontlar (Space Grotesk · Inter · IBM Plex Mono — ECY UK marka kimliğiyle uyumlu)

Not (TR sürümü): Türkçe büyük harf duyarlılığı (i→İ, ı→I) nedeniyle başlık/etiket metinleri
kaynakta doğrudan büyük harfle yazılmıştır; `text-transform: uppercase` kullanılmamıştır.
TR sürümünde de uluslararası format korunmuştur (doğum tarihi/foto vb. yok) — yerel bir
başvuru özellikle isterse bu alanlar eklenebilir.

## PDF'i yeniden üretme
HTML'de bir değişiklik yaptıktan sonra:

```bash
cd cv/en
chromium --headless=new --no-pdf-header-footer \
  --print-to-pdf=Enes-Cemil-Yagci-CV-EN.pdf "file://$(pwd)/index.html"
```

(Windows'ta `chrome.exe` ile aynı bayraklar çalışır. Tarayıcıda açıp Ctrl+P → "PDF olarak kaydet",
kenar boşlukları "Yok/None" ve "Arka plan grafikleri" açık şekilde de aynı sonucu verir.)

## Bilinçli içerik kararları (uluslararası işe alım standartları)
- **Kişisel veriler çıkarıldı** — doğum tarihi, cinsiyet, askerlik, ehliyet, foto yok:
  UK/EU başvurularında ayrımcılık taramasına takılmamak için standart uygulama.
- **Tek e-posta**: `ecy@ecy.com.tr` — marka tutarlılığı için Gmail yerine kurumsal adres.
- **ECY "kurucu" rolü**, işverenleri ürkütmemesi için *teslimat kanıtlı danışmanlık* olarak
  çerçevelendi (Erbil: LOD 350 · 829 clash · 20 hafta; HEMA Emmen: 3.500 m² Scan-to-BIM · 8 hafta).
- **Leas Pavilion (UK)** ESC dönemi altında "Selected Project" bloğu olarak vurgulandı;
  işveren (son müşteri) adı bilinçli olarak yazılmadı.
- **ESC unvanı "BIM Manager"** olarak kullanıldı (LinkedIn ile tutarlı); ülke sayısı **17**,
  alan **85.000+ m²**, ekip **40–50** — hepsi LinkedIn profiliyle uyumlu.
- **buildingSMART sertifikası kişisel olarak İDDİA EDİLMEDİ** (şirket materyalindeki ekip
  düzeyi bir ifade); "218 proje" ekip iddiası da CV'ye alınmadı.
- Not ortalaması, yarım kalan Saraybosna dönemi, İBA stajı ve NFT/metaverse ilgi alanları
  bilinçli olarak çıkarıldı.

## Başvurmadan önce yapılacaklar
1. **LinkedIn'i CV ile senkronla** — işe alımcılar ilk temastan önce çapraz kontrol yapar:
   ECY başlangıcı *Mar 2023*, ESC unvanı *BIM Manager*, 17 ülke, Kulak *Aug 2016 – Apr 2017*.
2. PDF dosya adını değiştirmeyin (`Enes-Cemil-Yagci-CV-EN.pdf`) — ATS'ler isim eşleştirmede
   dosya adını da kullanır.
3. Sponsorluk sorusu sorulmadıkça vize konusu açılmaz; CV'deki "Availability" satırı
   remote-first mesajını en başta veriyor.
