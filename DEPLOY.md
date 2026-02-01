# Deploy Talimatları

## ✅ Build Başarılı!

Proje başarıyla build edildi. Şimdi deploy edebilirsiniz.

## Seçenek 1: Vercel CLI ile (Önerilen)

```bash
# Vercel CLI'yi yükle (eğer yoksa)
npm i -g vercel

# Deploy et
vercel

# Production'a deploy et
vercel --prod
```

## Seçenek 2: Vercel Web Arayüzü ile

1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap
3. "New Project" butonuna tıkla
4. Repository'yi seç veya import et
5. Framework Preset: **Next.js** seç
6. "Deploy" butonuna tıkla

Vercel otomatik olarak:
- Next.js projesini algılar
- Build komutunu çalıştırır (`npm run build`)
- Deploy eder

## Seçenek 3: GitHub Actions ile Otomatik Deploy

GitHub'a push ettiğinizde otomatik deploy için:

1. Vercel hesabına git
2. Project Settings > Git
3. GitHub repository'yi bağla
4. Her push'ta otomatik deploy aktif olur

## Seçenek 4: Netlify

```bash
# Netlify CLI yükle
npm i -g netlify-cli

# Deploy et
netlify deploy --prod
```

veya Netlify web arayüzünden:
1. https://app.netlify.com adresine git
2. "Add new site" > "Import an existing project"
3. GitHub repository'yi seç
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Deploy!

## Önemli Notlar

- ✅ Build başarıyla tamamlandı
- ✅ Tüm dosyalar hazır
- ✅ Vercel.json konfigürasyonu mevcut
- ⚠️ API key'ler client-side'da kullanılıyor (güvenlik için environment variable kullanmayı düşünün)

## Hızlı Deploy Komutu

```bash
# Tek komutla deploy
npx vercel --prod
```




