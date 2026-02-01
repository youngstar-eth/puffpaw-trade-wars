# Environment Variable Kurulumu

## Vercel'de DUNE_API_KEY Ayarlama

API key'i Vercel'de environment variable olarak ayarlamanız gerekiyor.

### Yöntem 1: Vercel CLI ile

```bash
vercel env add DUNE_API_KEY production
# API key'inizi girin
```

### Yöntem 2: Vercel Dashboard'dan

1. https://vercel.com/simpl3s-projects/puffpaw-trade-wars/settings/environment-variables adresine git
2. "Add New" butonuna tıkla
3. Name: `DUNE_API_KEY`
4. Value: API key'inizi yapıştır
5. Environment: **Production** seç (veya All)
6. "Save" butonuna tıkla
7. Yeni bir deploy yap (otomatik olabilir veya manuel)

### Yöntem 3: Vercel Dashboard - Project Settings

1. https://vercel.com/simpl3s-projects/puffpaw-trade-wars adresine git
2. Settings > Environment Variables
3. Yeni variable ekle

## Deploy Sonrası

Environment variable eklendikten sonra yeni bir deploy yapılması gerekir:

```bash
vercel --prod
```

veya Vercel dashboard'dan "Redeploy" butonuna tıklayın.

## Test

Environment variable ayarlandıktan ve deploy edildikten sonra:
- Site otomatik olarak veriyi çekecek
- API key input'u görünmeyecek
- Leaderboard direkt gösterilecek




