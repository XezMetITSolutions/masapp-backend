# MASAPP Backend

Backend API servisleri için Node.js/Express tabanlı sunucu.

## Yapı

```
backend/
├── src/
│   ├── index.js          # Ana sunucu dosyası
│   ├── routes/           # API route'ları
│   │   ├── auth.js       # Kimlik doğrulama
│   │   ├── restaurants.js # Restoran işlemleri
│   │   └── orders.js     # Sipariş işlemleri
│   ├── controllers/      # İş mantığı
│   ├── models/          # Veritabanı modelleri
│   ├── middleware/      # Middleware'ler
│   ├── utils/           # Yardımcı fonksiyonlar
│   └── config/          # Konfigürasyon
├── package.json
└── env.example
```

## Kurulum

```bash
cd backend
npm install
```

## Çalıştırma

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /` - Ana sayfa
- `GET /health` - Sağlık kontrolü
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `GET /api/restaurants` - Restoran listesi
- `POST /api/orders` - Sipariş oluştur

## Environment Variables

`env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun.
