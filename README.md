# Puffpaw Trade Wars - Leaderboard UI

Dune Analytics Query #6622482 için hazırlanmış fancy leaderboard UI.

## Dosyalar

| Dosya | Açıklama |
| --- | --- |
| `puffpaw-trade-wars.jsx` | React component - Tam çalışan UI |
| `fetch-dune-data.js` | Node.js script - Veri yapısını görmek için |

## Hızlı Başlangıç (Cursor'da)

### Seçenek 1: Veriyi Önce Gör

```bash
# Terminal'de
export DUNE_API_KEY="your_api_key_here"
export LIMIT=1000  # Opsiyonel, varsayılan: 1000
node fetch-dune-data.js
```

Bu script:
- Veri yapısını (kolonlar) gösterir
- İlk 5 satırı preview olarak gösterir
- `dune-data.json` ve `dune-data.csv` olarak kaydeder
- Limit parametresi ile kaç kayıt çekileceğini belirleyebilirsiniz

### Seçenek 2: Direkt UI'ı Çalıştır

Next.js / Vite / CRA projenide:

```bash
# Yeni proje oluşturur (eğer yoksa)
npx create-next-app@latest puffpaw-trade-wars
cd puffpaw-trade-wars

# Component'i kopyala
cp puffpaw-trade-wars.jsx app/page.jsx # Next.js için
# veya
cp puffpaw-trade-wars.jsx src/App.jsx # Vite/CRA için

# Çalıştırır
npm run dev
```

### Standalone HTML (en kolay):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Puffpaw Trade Wars</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script src="puffpaw-trade-wars.jsx" type="text/babel"></script>
  <script type="text/babel">
    ReactDOM.createRoot(document.getElementById('root')).render(<PuffpawTradeWars />);
  </script>
</body>
</html>
```

## UI Özellikleri

- ✅ Animated background - Grid pattern + glow effects
- ✅ Top 3 highlighting - Altın, gümüş, bronz sıralaması
- ✅ Auto-formatting - USD, yüzde, büyük sayılar otomatik formatlanır
- ✅ Dynamic columns - API'den ne gelirse onu gösterir
- ✅ API key input - Güvenli şekilde key girişi
- ✅ Responsive - Mobil uyumlu

## Özelleştirme

### Renkleri Değiştir

styles objesinde ana renkleri bul:

- Primary: `#8b5cf6` (mor)
- Accent: `#ec4899` (pembe)
- Gold: `#fbbf24`

### Logo Ekle

Header'daki emoji'leri gerçek logo ile değiştir:

```jsx
<img src="/puffpaw-logo.png" alt="Puffpaw" style={{ height: '60px' }} />
```

### Kolon Sıralaması

Belirli bir sıralama istiyorsan:

```jsx
const columnOrder = ['rank', 'wallet', 'volume', 'pnl', 'trades'];
const sortedColumns = columnOrder.filter(c => columns.includes(c));
```

## Deploy

### Vercel (önerilen)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm run build
# dist klasörünü Netlify'a sürükle
```

### GitHub Pages

```bash
npm run build
# gh-pages branch'ine push et
```

## API Endpoints

```
# JSON format
GET https://api.dune.com/api/v1/query/6622482/results?limit=1000
Header: x-dune-api-key: YOUR_KEY

# CSV format
GET https://api.dune.com/api/v1/query/6622482/results/csv?limit=1000

# Parametreler
?limit=1000  # Max satır sayısı (varsayılan: 1000)
?offset=0    # Pagination için
```

### Limit Parametresi

- **fetch-dune-data.js**: `LIMIT` environment variable ile kontrol edilir
- **React Component**: UI'da limit input alanı ile ayarlanabilir (varsayılan: 1000)

## Sorun Giderme

| Hata | Çözüm |
| --- | --- |
| CORS error | Backend proxy kullan veya Dune'un allow-list'ine ekle |
| 401 Unauthorized | API key'i kontrol et |
| Empty data | Query'nin execute edilmiş olması lazım |

---

Made with 🐦 for Puffpaw Trade Wars

