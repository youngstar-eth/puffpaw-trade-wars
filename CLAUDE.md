# Puffpaw Trade Wars

## Proje Özeti
Dune Analytics Query #6622482 için hazırlanmış leaderboard UI. Next.js 14 + React 18.
Paws (insan) vs Claws (bot/agent) faction sistemi ile trade savaşı liderlik tablosu.

## Tech Stack
- Next.js 14 (App Router)
- React 18
- Dune Analytics API
- Polymarket API (Gamma + Data)
- Python 3.11 (GitHub Actions veri güncelleme scripti)
- Vercel deploy
- ESLint

## Proje Yapısı
- `app/` — Next.js app router sayfaları
  - `app/page.jsx` — Ana sayfa, PuffpawTradeWars componentini render eder
  - `app/layout.jsx` — Root layout, Open Graph meta tag'leri
  - `app/globals.css` — Global stiller (koyu tema)
- `app/api/` — Backend API route'ları
  - `app/api/dune/route.js` — Dune Analytics proxy (Query #6622482)
  - `app/api/polymarket/route.js` — Polymarket API proxy
  - `app/api/cron/refresh/route.js` — Günlük Dune sorgu yenileme cron job'u
- `components/` — React componentleri
  - `components/PuffpawTradeWars.jsx` — Ana leaderboard componenti (~1135 satır)
  - `components/PolymarketWidget.jsx` — Polymarket istatistik widget'ı (~381 satır)
- `scripts/` — Yardımcı scriptler
  - `scripts/update_leaderboard.py` — GitHub Actions ile çalışan Python veri güncelleyici
- `public/` — Statik dosyalar
  - `public/leaderboard_data.json` — Cache'lenmiş leaderboard verisi (her 10 dk güncellenir)
  - `public/paws-vs-claws-logo.png` — Marka logosu
- `fetch-dune-data.js` — Dune API'den veri çeken Node.js CLI scripti
- `.github/workflows/update-leaderboard.yml` — GitHub Actions workflow (10 dk'da bir)
- `vercel.json` — Vercel deploy konfigürasyonu ve cron tanımları
- `index.html` — Legacy standalone HTML (kullanılmıyor)

## Komutlar
- `npm run dev` — Geliştirme sunucusu
- `npm run build` — Production build
- `npm run start` — Production sunucusu
- `npm run fetch-data` — Dune'dan veri çek (CLI)
- `npm run lint` — ESLint

## API Route'ları
- `GET /api/dune?limit=1000&refresh=true` — Dune sorgu sonuçları (1 saat cache, 5 dk stale-while-revalidate)
- `GET /api/polymarket` — Polymarket event verileri (puffpaw-fdv slug'ı)
- `GET|POST /api/cron/refresh` — Dune sorgu yenileme (Vercel cron: günlük gece yarısı UTC)

## Environment Variables
| Değişken | Zorunlu | Kullanıldığı Yer | Açıklama |
|----------|---------|-------------------|----------|
| `DUNE_API_KEY` | Evet | API route'ları, scriptler | Dune Analytics API anahtarı |
| `CRON_SECRET` | Hayır | `/api/cron/refresh` | Cron job yetkilendirme |
| `LIMIT` | Hayır | `fetch-dune-data.js` | Varsayılan satır limiti (1000) override |

## Veri Akışı
1. **GitHub Actions** → Her 10 dk'da `update_leaderboard.py` çalışır → `public/leaderboard_data.json` güncellenir
2. **Vercel Cron** → Günlük gece yarısı `/api/cron/refresh` → Dune sorgusunu yeniler
3. **Frontend** → `/api/dune` üzerinden canlı veri çeker, 10 dk'da bir auto-refresh

## Skor Sistemi (UI Score)
Leaderboard sıralaması Dune'dan gelen ham `score` yerine UI tarafında hesaplanan `ui_score` ile yapılır.

**Formül:**
```
ui_score = Volume^0.7 × (1 + |PnL| / Volume)^2
```

**Mantık:**
- `Volume^0.7` — Hacmi ödüllendirir ama azalan getiri ile (logaritmik etki). Çok yüksek hacim tek başına skoru domine edemez.
- `(1 + |PnL| / Volume)^2` — PnL/Volume oranı (verimlilik) kare alınarak güçlü şekilde ödüllendirilir. Hem kâr hem zarar pozitif olarak sayılır (mutlak değer), çünkü amaç fiyat keşfi — doğru ya da yanlış, aktif pozisyon almak değerlidir.
- Sıfır hacimli trader'lar otomatik 0 skor alır.

**Hesaplama noktaları:**
1. `fetch-dune-data.js` — CLI scripti, `ui_score` ve `ui_rank` alanlarını ekler
2. `components/PuffpawTradeWars.jsx` — Frontend'de `enrichedRows` üzerinde hesaplanır, tablo bu skora göre sıralanır
3. Faction ortalama skorları da bu formülle hesaplanır (`pawsAvgScore`, `clawsAvgScore`)

## Kodlama Kuralları
- Türkçe yorum ve commit mesajları kullan
- React functional component ve hooks kullan, class component kullanma
- Inline styles yerine CSS modules veya styled-components tercih et (mevcut kodda inline var, yeni kodda geçiş yap)
- API key'leri asla hardcode etme, environment variable kullan
- Component'leri küçük ve tek sorumlu tut
- Dune API çağrılarında her zaman error handling yap
- Responsive tasarım her zaman gözetilmeli

## Dikkat Edilecekler
- DUNE_API_KEY environment variable olarak ayarlanmalı
- Vercel'e deploy edilirken vercel.json konfigürasyonu kontrol edilmeli
- CORS sorunları için backend proxy gerekebilir
- `public/puffpaw-logo.png` boş dosya (0 byte) — düzeltilmeli veya silinmeli
- `.eslintrc.json`, `index.html`, `.gitignore` dosyalarında duplicate içerik var — temizlenmeli
- `index.html` legacy dosya, Next.js projesiyle gereksiz — kaldırılabilir

## Git
- Branch: main
- Commit mesajları Türkçe, açıklayıcı
- Her feature için ayrı branch aç, sonra main'e merge et
