/* BIMHub — Tool catalog
   cat: viz | doc | anl | ofc | gen
   status: live | beta | soon
*/
window.BIMHUB_TOOLS = [
  // ───── Visualization ─────
  {
    id: "sketch-render",
    cat: "viz", status: "soon",
    name: { tr: "Eskiz → Render", en: "Sketch → Render" },
    desc: {
      tr: "El çiziminizi saniyeler içinde fotoğraf gerçekçiliğinde rendere dönüştürür. Stil, gün ışığı, malzeme ayarı yapın.",
      en: "Turn a hand sketch into a photoreal render in seconds. Set style, daylight, material."
    },
    io: { in: "JPG · PNG · PDF", out: "PNG · 4K" },
    icon: `<path d="M4 20c2-6 5-9 8-10 3-1 6 1 8 4M14 6l4-2 2 4-4 2zM4 20l3-1"/><path d="M14 11l3 3" stroke-dasharray="2 2"/>`
  },
  {
    id: "plan-3d",
    cat: "viz", status: "soon",
    name: { tr: "2B Plan → 3B Kütle", en: "2D Plan → 3D Mass" },
    desc: {
      tr: "Kat planını yükleyin, doğru duvar yükseklikleriyle hacimsel 3B kütle modeli oluşturalım. SketchUp ve IFC çıktısı.",
      en: "Upload a floor plan and get a volumetric 3D mass with correct wall heights. Export SKP or IFC."
    },
    io: { in: "DWG · PDF", out: "IFC · SKP · GLB" },
    icon: `<path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>`
  },
  {
    id: "material-swap",
    cat: "viz", status: "soon",
    name: { tr: "Malzeme Değiştir", en: "Material Swap" },
    desc: {
      tr: "Mevcut rendere yeni cephe kaplaması, döşeme veya boya rengi uygulayın. Tek görselde 12 varyant.",
      en: "Apply a new façade cladding, flooring or paint to an existing render. 12 variants per image."
    },
    io: { in: "JPG · PNG", out: "PNG · varyant" },
    icon: `<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8" stroke-dasharray="2 2"/><rect x="3" y="13" width="8" height="8" stroke-dasharray="2 2"/><rect x="13" y="13" width="8" height="8"/>`
  },
  {
    id: "photo-sketch",
    cat: "viz", status: "soon",
    name: { tr: "Fotoğraf → Eskiz", en: "Photo → Sketch" },
    desc: {
      tr: "Konsept sunumu için fotoğrafı veya rendere kalem çizimi, sulu boya veya yüzey-perspektif eskizine dönüştürür.",
      en: "Convert a photo or render into pencil, watercolor or perspective sketch for concept presentations."
    },
    io: { in: "JPG · PNG", out: "PNG · PDF" },
    icon: `<path d="M3 17l8-12 3 2-8 12-4 1z"/><path d="M14 7l3 2"/><path d="M3 21h18"/>`
  },

  // ───── Documentation ─────
  {
    id: "dwg-pdf",
    cat: "doc", status: "live",
    href: "demo.html",
    name: { tr: "DXF → PDF", en: "DXF → PDF" },
    desc: {
      tr: "DXF dosyanızı tarayıcıda vektör PDF'ye çevirin. Katman aç-kapa, ölçekli çıktı. Tamamen tarayıcıda, sunucusuz.",
      en: "Convert DXF to vector PDF in your browser. Toggle layers, scaled output. Fully client-side, no backend."
    },
    io: { in: "DXF", out: "PDF (vector)" },
    icon: `<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/><path d="M8 13h8M8 17h5"/>`
  },
  {
    id: "pdf-takeoff",
    cat: "doc", status: "soon",
    name: { tr: "PDF Metraj", en: "PDF Takeoff" },
    desc: {
      tr: "PDF projeyi yükleyin, AI alanları, uzunlukları ve adetleri otomatik çıkarsın. Excel olarak indirin.",
      en: "Upload a PDF and let AI extract areas, lengths and counts automatically. Export to Excel."
    },
    io: { in: "PDF · DWG", out: "XLSX · CSV" },
    icon: `<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/><path d="M13 13l2 2 4-4" stroke-dasharray="0"/>`
  },
  {
    id: "dwg-ifc",
    cat: "doc", status: "soon",
    name: { tr: "DWG → IFC", en: "DWG → IFC" },
    desc: {
      tr: "2B mimari paftadan açık BIM (IFC) modeli üretir. Duvar, kapı, pencere, döşeme otomatik sınıflandırılır.",
      en: "Generates an open BIM (IFC) model from 2D drawings. Walls, doors, windows, slabs auto-classified."
    },
    io: { in: "DWG", out: "IFC 2x3 · IFC 4" },
    icon: `<path d="M3 12l9-9 9 9-9 9z"/><path d="M3 12h18M12 3v18" stroke-dasharray="2 2"/>`
  },
  {
    id: "rvt-ifc",
    cat: "doc", status: "soon",
    name: { tr: "RVT → IFC", en: "RVT → IFC" },
    desc: {
      tr: "Revit dosyasını Revit kurmadan IFC'ye çevirir. Set ayarları ve görünüm filtreleri korunur.",
      en: "Convert Revit files to IFC without installing Revit. Worksets and view filters preserved."
    },
    io: { in: "RVT", out: "IFC · NWC" },
    icon: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8v8H8z"/><path d="M3 12h5M16 12h5M12 3v5M12 16v5"/>`
  },

  // ───── Analysis & Coordination ─────
  {
    id: "clash-ai",
    cat: "anl", status: "beta",
    name: { tr: "AI Çakışma Kontrolü", en: "AI Clash Check" },
    desc: {
      tr: "IFC modellerini yükleyin, AI çakışmaları bulup neden olduğunu ve hangi disiplinin çözmesi gerektiğini açıklasın.",
      en: "Upload IFC models — AI finds clashes and explains the cause and which discipline should resolve."
    },
    io: { in: "IFC · NWC", out: "PDF Rapor · BCF" },
    icon: `<circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5"/><path d="M12 12l-1 1M12 12l1-1"/>`
  },
  {
    id: "code-check",
    cat: "anl", status: "soon",
    name: { tr: "Yönetmelik Kontrolü", en: "Code Compliance" },
    desc: {
      tr: "TR İmar, Eurocode ve IBC kurallarına göre projeyi tarar. İhlalleri madde numarasıyla raporlar.",
      en: "Scans projects against TR İmar, Eurocode and IBC rules. Flags violations with article numbers."
    },
    io: { in: "DWG · IFC · PDF", out: "PDF Rapor" },
    icon: `<path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>`
  },
  {
    id: "spec-reader",
    cat: "anl", status: "soon",
    name: { tr: "Şartname Okuyucu", en: "Spec Reader" },
    desc: {
      tr: "Yüzlerce sayfa teknik şartnameyi yükleyin, AI maddelere göre özetlesin. Risk ve uyumsuzlukları işaretler.",
      en: "Upload hundreds of pages of specs — AI summarizes by clause, flags risks and discrepancies."
    },
    io: { in: "PDF · DOCX", out: "MD · DOCX · XLSX" },
    icon: `<rect x="4" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>`
  },
  {
    id: "drawing-diff",
    cat: "anl", status: "soon",
    name: { tr: "Çizim Karşılaştır", en: "Drawing Diff" },
    desc: {
      tr: "İki revizyon arasındaki tüm değişiklikleri renkli kaplama ile gösterir. Eklenen, çıkarılan ve değişen.",
      en: "Highlights every change between two revisions with color overlay. Added, removed, modified."
    },
    io: { in: "DWG · PDF", out: "PDF Markup" },
    icon: `<rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/><path d="M11 7l2 2M11 13l2 2M11 19l2-2"/>`
  },

  // ───── Office & Productivity ─────
  {
    id: "rfi-drafter",
    cat: "ofc", status: "soon",
    name: { tr: "RFI Hazırlayıcı", en: "RFI Drafter" },
    desc: {
      tr: "Bir çizim ekran görüntüsünden veya foto araştırma sorusunu (RFI) profesyonel formatla yazar.",
      en: "Writes a professional RFI from a drawing screenshot or photo of a problem on site."
    },
    io: { in: "JPG · PNG · PDF", out: "PDF · DOCX" },
    icon: `<path d="M5 3h11l3 3v15H5z"/><path d="M9 11h6M9 15h4"/><circle cx="9" cy="7.5" r="1"/>`
  },
  {
    id: "submittal",
    cat: "ofc", status: "soon",
    name: { tr: "Submittal Listesi", en: "Submittal Tracker" },
    desc: {
      tr: "Şartnameden teslim edilmesi gereken tüm submittal kalemlerini AI ile çıkarır ve takip listesine atar.",
      en: "Extracts every required submittal item from specs with AI and drops them into a tracking list."
    },
    io: { in: "PDF · DOCX", out: "XLSX · CSV" },
    icon: `<path d="M5 5h14v16H5z"/><path d="M9 5V3h6v2"/><path d="M9 11l2 2 4-4M9 17h6"/>`
  },
  {
    id: "boq-excel",
    cat: "ofc", status: "soon",
    name: { tr: "BoQ → Excel", en: "BoQ → Excel" },
    desc: {
      tr: "PDF veya el yazısı metraj listesini düzenli Excel formatına çevirir. Birim fiyat şablonlarınızla eşleşir.",
      en: "Turns a PDF or hand-written takeoff list into a clean Excel format. Maps to your unit-price templates."
    },
    io: { in: "PDF · JPG", out: "XLSX" },
    icon: `<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18M15 3v18M3 15h18"/>`
  },
  {
    id: "meeting-actions",
    cat: "ofc", status: "soon",
    name: { tr: "Toplantı → Aksiyon", en: "Meeting → Actions" },
    desc: {
      tr: "Şantiye veya koordinasyon toplantı kaydını yükleyin; AI özet, aksiyon kalemleri ve sorumlular çıkarsın.",
      en: "Upload a site or coordination meeting recording; AI gives a summary, action items and owners."
    },
    io: { in: "MP3 · MP4", out: "MD · DOCX · PDF" },
    icon: `<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>`
  },

  // ───── Generative AI ─────
  {
    id: "facade-gen",
    cat: "gen", status: "soon",
    name: { tr: "Cephe Varyantları", en: "Façade Variants" },
    desc: {
      tr: "Tek cephe fotoğrafından 16 stilistik varyant üretir. Müşteri sunumu için anında karşılaştırma.",
      en: "Generates 16 stylistic variants from a single façade photo. Instant comparison for client review."
    },
    io: { in: "JPG · PNG", out: "PNG · grid" },
    icon: `<rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>`
  },
  {
    id: "site-optimizer",
    cat: "gen", status: "soon",
    name: { tr: "Vaziyet Optimize", en: "Site Optimizer" },
    desc: {
      tr: "Arsa sınırı, kotlar ve emsali girin; AI alternatif kütle, oryantasyon ve verim önerileri sunsun.",
      en: "Enter site boundary, contours and FAR; AI suggests massing alternatives, orientation and yield."
    },
    io: { in: "DWG · GeoJSON", out: "PDF · DWG" },
    icon: `<path d="M3 19l7-13 4 7 7-11M3 19h18"/><circle cx="10" cy="6" r="1.5"/><circle cx="14" cy="13" r="1.5"/>`
  },
  {
    id: "family-search",
    cat: "gen", status: "soon",
    name: { tr: "Aile Bulucu (AI)", en: "Family Search (AI)" },
    desc: {
      tr: "Doğal dilde \"60cm derinlik üçlü lavabo\" yazın; uygun Revit ailelerini, BIM nesnelerini ve üreticileri listeler.",
      en: "Type \"triple sink 60cm depth\" in plain language; surfaces matching Revit families, BIM objects and brands."
    },
    io: { in: "Text", out: "RFA · IFC · skp" },
    icon: `<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/><path d="M11 8v6M8 11h6" stroke-width="1"/>`
  },
  {
    id: "annotator",
    cat: "gen", status: "soon",
    name: { tr: "Çizim İşaretleyici", en: "Drawing Annotator" },
    desc: {
      tr: "Çizimi yükleyin; AI tüm elemanları otomatik etiketler — kapı, pencere, mobilya, ölçü.",
      en: "Upload a drawing; AI auto-labels every element — doors, windows, furniture, dimensions."
    },
    io: { in: "DWG · PDF · PNG", out: "PDF · DWG" },
    icon: `<rect x="3" y="3" width="18" height="18"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="16" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/><path d="M8 8l8 8M8 16l8-8"/>`
  }
];
