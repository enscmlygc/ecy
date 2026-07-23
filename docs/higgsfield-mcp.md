# Higgsfield AI MCP — Kullanım Kılavuzu

> Esse'nin editöryel görselleri (**hero** ve **lookbook** kareleri) AI ile üretilmiştir.
> Bu belge, aynı görselleri markaya sadık kalarak yeniden üretmek veya çoğaltmak için
> kullanılan **Higgsfield AI MCP** sunucusunu anlatır.

**Sunucu adresi (endpoint):** `https://mcp.higgsfield.ai/mcp`

İçindekiler:

1. [Higgsfield MCP nedir?](#1-higgsfield-mcp-nedir)
2. [Bağlanma / Kurulum](#2-bağlanma--kurulum)
3. [Nasıl çalışır?](#3-nasıl-çalışır-üretim-akışı)
4. [Araç kategorileri](#4-araç-kategorileri)
5. [Model kataloğu](#5-model-kataloğu)
6. [Esse için pratik reçeteler](#6-esse-için-pratik-reçeteler)
7. [Maliyet ve hesap](#7-maliyet-ve-hesap)
8. [Örnek çağrılar](#8-örnek-çağrılar)
9. [Referanslar](#9-referanslar)

---

## 1. Higgsfield MCP nedir?

[Higgsfield](https://higgsfield.ai) bir yapay zekâ üretim platformudur; **görsel, video,
ses ve 3D** içerik üretir. **MCP** (Model Context Protocol) sunucusu, bu üretim
yeteneklerini Claude gibi yapay zekâ asistanlarına **araç** olarak açar. Yani sohbet
içinden "şu tarzda bir editöryel kare üret", "bu görseli 4K'ya yükselt", "arka planını
temizle" diyebilir ve sonucu doğrudan alabilirsiniz.

- **Tür:** Uzak (remote) MCP sunucusu — HTTP taşıma (streamable HTTP) üzerinden çalışır.
- **Kimlik doğrulama:** İlk bağlantıda Higgsfield hesabınızla **OAuth** yetkilendirmesi
  istenir (tarayıcıda giriş + izin). Üretim işlemleri hesabınızdaki **kredilerden** düşer.
- **Neden Esse için önemli?** `assets/img/` altındaki editöryel karelerin (hero, look-1…5)
  markanın *Şampanya & Krem* estetiğiyle üretilmesi/yenilenmesi bu sunucuyla yapılır.

---

## 2. Bağlanma / Kurulum

### Claude Code (CLI)

```bash
claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp
```

Bağlandıktan sonra ilk kullanımda tarayıcı açılır; Higgsfield hesabınızla giriş yapıp
erişimi onaylarsınız. Durumu kontrol etmek için:

```bash
claude mcp list
```

### Claude Desktop / Connectors destekleyen istemciler

Ayarlar → **Connectors / Bağlayıcılar** bölümünden "Add custom connector" ile şu URL'yi
ekleyin:

```
https://mcp.higgsfield.ai/mcp
```

### Genel MCP istemci yapılandırması (JSON)

HTTP taşımayı destekleyen istemcilerde:

```json
{
  "mcpServers": {
    "higgsfield": {
      "type": "http",
      "url": "https://mcp.higgsfield.ai/mcp"
    }
  }
}
```

Yalnızca **stdio** destekleyen (eski) istemcilerde `mcp-remote` köprüsüyle:

```json
{
  "mcpServers": {
    "higgsfield": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.higgsfield.ai/mcp"]
    }
  }
}
```

> **Not:** Kimlik doğrulaması tarayıcı üzerinden yapıldığından, tarayıcısız/headless
> ortamlarda (ör. CI) sunucuya erişilemeyebilir.

---

## 3. Nasıl çalışır? (Üretim akışı)

1. **Model seç.** Emin değilseniz `models_explore` ile arayın/önerdirin:
   - `models_explore(action:"recommend", query:"...", type:"image")` → hedefe en uygun modeli önerir.
   - `models_explore(action:"get", model_id:"soul_2")` → modelin desteklediği en/boy oranları, parametreler, referans medya rolleri.
2. **(İsteğe bağlı) Referans medya ekle.** Elinizde bir görsel/foto varsa:
   - Web'deki bir URL → `media_import_url` → dönen `media_id`'yi kullanın.
   - Yerel dosya (Apps UI'lı istemcilerde) → `media_upload_widget`.
   - `medias[].value` alanına **URL değil**, `media_id` veya önceki bir işin `job_id`'sini verin.
3. **Üret.** `generate_image` / `generate_video` / `generate_audio` / `generate_3d` çağırın.
   - `get_cost: true` verirseniz iş **kuyruğa alınmadan** yalnızca kredi maliyeti döner (ön kontrol).
4. **Sonucu al.** Üretim asenkrondur; iş bir `job_id` ile döner. Durum/çıktı için:
   - `job_display`, `show_generations`, `show_medias`.
5. **İşle & indir.** Gerekirse `upscale_image`, `outpaint_image`, `remove_background`
   ile rötuşlayın; çıktı görseli indirip `assets/img/` altına kaydedin.

---

## 4. Araç kategorileri

Sunucunun sunduğu başlıca araçlar (MCP tarafında `generate_image` gibi adlarla gelir):

| Kategori | Araçlar | Ne işe yarar |
|---|---|---|
| **Üretim (çekirdek)** | `generate_image`, `generate_video`, `generate_audio`, `generate_3d` | Görsel / video / ses üretimi; görselden 3D GLB mesh |
| **Görsel düzenleme** | `upscale_image`, `outpaint_image`, `remove_background`, `reframe`, `upscale_video`, `motion_control` | Yükseltme (2K/4K), tuval genişletme, arka plan silme, oran değiştirme, hareket aktarımı |
| **Keşif** | `models_explore`, `presets_show`, `apps_search`, `apps_describe`, `apps_invoke`, `animation_actions` | Model/preset/uygulama bulma ve çalıştırma |
| **Medya** | `media_upload`, `media_upload_widget`, `media_import_url`, `media_confirm` | Referans medyayı sisteme alma |
| **Hesap** | `balance`, `transactions`, `show_plans_and_credits`, `list_workspaces`, `select_workspace` | Kredi bakiyesi, işlem geçmişi, çalışma alanı |
| **Sonuç görüntüleme** | `job_display`, `show_generations`, `show_medias`, `show_characters` | Üretilen işleri ve medyaları listeleme |
| **İş akışları (workflow)** | `get_workflow_instructions`, `get_workflow_bundle_file` | Anlatım videosu, reklam, UGC, podcast gibi çok adımlı şablonlar |
| **Ses / seslendirme** | `create_voice`, `list_voices`, `voice_change`, `dubbing` | Seslendirme, ses klonlama, dublaj |
| **Web sitesi / oyun** | `create_website`, `deploy_website`, `get_game_creation_instructions`, `deploy_game` | Site ve tarayıcı oyunu üretimi |

> Tam liste büyüktür; ihtiyaç anında `apps_search` / `models_explore` ile keşfedin.

---

## 5. Model kataloğu

Aşağıdaki tablolar, sunucudan `models_explore` ile alınan **güncel** kataloğun Esse için
en ilgili alt kümesidir. Tam liste ve parametreler için:
`models_explore(action:"list", type:"image")`.

### Görsel modelleri

| Model ID | Sağlayıcı | Güçlü yönü | Çözünürlük / oran |
|---|---|---|---|
| **`soul_2`** ⭐ | Higgsfield | **Gerçekçi moda editöryeli, portre, karakter** — Esse için önerilen | 1.5k/2k · 1:1, 3:4, 4:3, 16:9, 9:16, 3:2, 2:3 |
| `soul_cinematic` | Higgsfield | Sinematik, dramatik ışık; konsept sanat | 1.5k/2k |
| `nano_banana_pro` | Google | En yüksek kalite, **metin/tipografi**, 4K | 1k/2k/4k · 4:5 dahil geniş oran seti |
| `nano_banana_2` | Google | Hızlı, foto-gerçekçi, çok yönlü | 1k/2k/4k |
| `seedream_v4_5` | Bytedance | 4K çıkış, hassas kontrol, dönüşüm/düzenleme | ~4K–6K |
| `flux_2` | Black Forest Labs | Yüksek prompt sadakati (pro/flex/max) | 1k/2k |
| `gpt_image_2` | OpenAI | Metin işleme + düzenleme, 4K | 1k/2k/4k |
| `recraft_v4_1` | Recraft | **Logo / ikon / vektör**, ürün mockup | 1k/2k · palet desteği |
| `marketing_studio_image` | Higgsfield | Tek tıkla **ürün/reklam** görseli | 1k/2k/4k |
| `topaz_image` / `bytedance_image_upscale` | — | Görsel **yükseltme** (upscale) | 2k/4k'ya kadar |

### Video modelleri

| Model ID | Güçlü yönü |
|---|---|
| `seedance_2_0` | Referans odaklı, tutarlı kimlik, çok-SKU, yerel ses; e-ticaret için ideal |
| `kling3_0` / `kling3_0_turbo` | Çok çekim, ses senkronu, hareket aktarımı / hızlı metin→video |
| `veo3_1` (Google Veo 3.1) | Ultra-gerçekçi, üst düzey sinematik |
| `cinematic_studio_3_0` | Sinema kalitesinde, 4K'ya kadar |
| `marketing_studio_video` | TikTok/Reels'e hazır ürün reklamı |
| `clipify` | Bir YouTube videosunu altyazılı kısa kliplere böler |

### Ses modelleri

| Model ID | Güçlü yönü |
|---|---|
| `seed_audio` | Varsayılan metin→konuşma (ByteDance); voice preset/klon desteği |
| `text2speech_v2` | Seçilebilir motor: ElevenLabs, MiniMax, Seed Speech, Vibe/Cozy Voice |
| `qwen_audio_tts` | İfadeli, çok dilli TTS (dil + üslup yönergesi) |

---

## 6. Esse için pratik reçeteler

### Önerilen model

Editöryel moda kareleri için **`soul_2` (Higgsfield Soul 2.0)** — `models_explore`
önerisinde de bu proje tarifi için en yüksek puanı alan modeldir
(*"fashion editorial, portrait, realistic"*). Kalite: `2k`.

### En/boy oranı (mevcut görsellerle uyum)

`assets/img/` altındaki karelerin gerçek boyutları **dikey (portre)**:

| Dosya | Boyut | Oran (yaklaşık) |
|---|---|---|
| `hero.jpg` | 1290×1601 | ~4:5 |
| `look-1…5.jpg` | 1290×~1500–1710 | ~3:4 – ~4:5 |

- **`soul_2` ile:** `aspect_ratio: "3:4"` kullanın (mevcut dikey karelere en yakın desteklenen oran).
- **Tam 4:5 gerekiyorsa:** `nano_banana_pro` veya `seedream_v4_5` (bu modeller `4:5` destekler).

### Markaya sadık prompt reçetesi

`BRAND.md` görsel dilini prompt'a taşıyın: yumuşak doğal ışık, sıcak nötr tonlar
(krem `#FAF6EF`, şampanya `#E7D8C1`, altın `#B8945F`, taupe `#8C7E6C`), sakin editöryel
kompozisyon, bol negatif alan, abartısız poz ve renk. Görsel modeller **İngilizce**
prompt'a daha iyi yanıt verir; aşağıdaki hazır metinleri kullanabilirsiniz.

**Hero (dikey ~4:5, `aspect_ratio:"3:4"`):**

```text
Editorial fashion photograph of an elegant woman in her early 30s wearing a timeless
cream wool coat over a simple silk slip dress, soft diffused natural window light.
Warm neutral palette — champagne, cream, sand and taupe. Calm, minimal composition with
generous negative space and a clean warm background. Quiet-luxury aesthetic, muted
film-like color grade, no harsh shadows, no bold colors. Serene, confident, understated.
```

**Lookbook karesi (dikey, `aspect_ratio:"3:4"`):**

```text
Full-length editorial portrait of a modern woman in a minimalist beige tailored ensemble,
natural soft daylight, warm neutral backdrop in champagne and cream tones. Timeless
quiet-luxury styling, relaxed elegant pose, lots of negative space, soft film grain,
gentle warm color grade.
```

> İpucu: Her karede **aynı ton ve ışık** dilini koruyun; `count: 2-4` ile birkaç varyant
> üretip en uygun olanı seçin.

### Üretimden `assets/img/`'e akış

1. `generate_image` (model `soul_2`, `aspect_ratio:"3:4"`, `quality:"2k"`, uygun prompt).
2. Gerekirse **yükselt:** `upscale_image` (Topaz) ile 2K/4K net çıktı.
3. Gerekirse **hero için tuval genişlet:** `outpaint_image` (üst/yanlarda nefes alanı).
4. **Ürün çekimi** gerekiyorsa arka planı sadeleştir: `remove_background`.
5. Çıktıyı indir, **web için optimize et** (uzun kenar ~1290px, kaliteli JPEG),
   `assets/img/hero.jpg` / `look-N.jpg` olarak kaydet.
6. Dosyayı değiştirdiyseniz `sw.js` service worker sürümünü yükselterek önbelleği tazeleyin.

### Sosyal içerik (opsiyonel)

Instagram Reels/TikTok için ürün videosu: `marketing_studio_video` (9:16) veya bir editöryel
kareyi `kling3_0_turbo` ile hafifçe canlandırma (start-frame → video).

---

## 7. Maliyet ve hesap

- **Ön maliyet kontrolü:** Herhangi bir `generate_*` çağrısına `get_cost: true` ekleyin →
  iş kuyruğa alınmadan yalnızca kredi maliyeti döner.
- **Bakiye:** `balance`; **planlar/krediler:** `show_plans_and_credits`; **geçmiş:** `transactions`.
- Yüksek çözünürlük (`2k`/`4k`), yüksek kalite (`high`) ve fazla `count` **maliyeti artırır**.
  Önce `1k`/taslakla deneyin, beğendiğinizi yükseltin.

---

## 8. Örnek çağrılar

> Aşağıdaki çağrılar MCP araçlarıdır; Claude'a doğal dille söylediğinizde bu araçlara
> dönüşür. Şema referansı içindir.

**Uygun modeli önerdir:**

```json
models_explore {
  "action": "recommend",
  "type": "image",
  "query": "warm neutral quiet-luxury editorial fashion, soft natural light, portrait, text-only"
}
```

**Hero görseli üret (maliyeti önce kontrol et):**

```json
generate_image {
  "params": {
    "model": "soul_2",
    "aspect_ratio": "3:4",
    "quality": "2k",
    "count": 2,
    "get_cost": true,
    "prompt": "Editorial fashion photograph of an elegant woman ... understated."
  }
}
```

`get_cost` olmadan aynı çağrı işi başlatır. Sonuç için `job_display` / `show_medias`.

**4K'ya yükselt:**

```json
generate_image {
  "params": {
    "model": "topaz_image",
    "output_width": 2580,
    "output_height": 3200,
    "medias": [{ "role": "image_references", "value": "<önceki_job_id>" }]
  }
}
```

---

## 9. Referanslar

- Higgsfield MCP endpoint: `https://mcp.higgsfield.ai/mcp`
- Higgsfield: <https://higgsfield.ai>
- Model Context Protocol: <https://modelcontextprotocol.io>
- Marka rehberi (renk/tipografi/görsel dil): [`BRAND.md`](../BRAND.md)
- Proje genel bakış: [`README.md`](../README.md)

> Katalog ve parametreler zamanla değişebilir; kesin bilgi için her zaman canlı
> `models_explore` çıktısını esas alın.
