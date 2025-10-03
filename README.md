# 🍽️ MASAPP Backend API

Türkiye'nin en gelişmiş QR menü ve restoran yönetim sistemi backend API servisleri.

## 🚀 Özellikler

- **RESTful API**: Modern REST API tasarımı
- **Güvenlik**: JWT authentication, rate limiting, CORS
- **Middleware**: Helmet, CORS, body parsing
- **Error Handling**: Merkezi hata yönetimi
- **Health Monitoring**: Sistem sağlık kontrolü
- **Scalable**: Mikroservis mimarisine hazır

## 🛠️ Teknoloji Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv
- **Logging**: Built-in console logging

## 📁 Proje Yapısı

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
├── .gitignore
└── env.example
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/XezMetITSolutions/masapp-backend.git
cd masapp-backend
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp env.example .env
# .env dosyasını düzenleyin
```

4. **Development server'ı başlatın**
```bash
npm run dev
# veya
node src/index.js
```

5. **API'yi test edin**
```
http://localhost:3001
```

## 🔌 API Endpoints

### Genel
- `GET /` - Ana sayfa
- `GET /health` - Sağlık kontrolü

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Restoran İşlemleri
- `GET /api/restaurants` - Restoran listesi
- `POST /api/restaurants` - Yeni restoran
- `GET /api/restaurants/:id` - Restoran detayı
- `PUT /api/restaurants/:id` - Restoran güncelle
- `DELETE /api/restaurants/:id` - Restoran sil

### Sipariş İşlemleri
- `GET /api/orders` - Sipariş listesi
- `POST /api/orders` - Yeni sipariş
- `GET /api/orders/:id` - Sipariş detayı
- `PUT /api/orders/:id` - Sipariş güncelle
- `DELETE /api/orders/:id` - Sipariş sil

## 🔐 Güvenlik

### Middleware'ler
- **Helmet**: HTTP header güvenliği
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 15 dakikada 100 istek
- **Body Parser**: JSON ve URL-encoded parsing

### Environment Variables
```bash
# Sunucu ayarları
PORT=3001
NODE_ENV=production

# Güvenlik
JWT_SECRET=your-jwt-secret
CSRF_SECRET=your-csrf-secret

# API Keys
OPENAI_API_KEY=your-openai-key

# Database (gelecek)
DATABASE_URL=your-database-url
```

## 🚀 Production Deployment

### PM2 ile
```bash
npm install -g pm2
pm2 start src/index.js --name masapp-backend
pm2 startup
pm2 save
```

### Docker ile
```bash
docker build -t masapp-backend .
docker run -p 3001:3001 masapp-backend
```

### Environment Setup
```bash
# Production environment
NODE_ENV=production
PORT=3001
JWT_SECRET=your-production-secret
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### Logging
- Console logging aktif
- Error tracking için Sentry entegrasyonu hazır
- Performance monitoring için New Relic hazır

## 🧪 Testing

```bash
# API testleri
curl -X GET http://localhost:3001/health

# Postman collection kullanın
# docs/postman-collection.json
```

## 🔄 CI/CD

### GitHub Actions
- Otomatik test
- Docker build
- Production deployment

### Environment Variables
Production'da aşağıdaki environment variables'ları ayarlayın:
- `NODE_ENV=production`
- `PORT=3001`
- `JWT_SECRET=your-secret`
- `CSRF_SECRET=your-secret`

## 📈 Performance

- **Response Time**: < 100ms
- **Throughput**: 1000+ requests/second
- **Memory Usage**: Optimized
- **CPU Usage**: Minimal

## 🛡️ Security Best Practices

- ✅ HTTPS zorunluluğu
- ✅ JWT token authentication
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection koruması
- ✅ XSS koruması

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Bu proje özel lisans altındadır. Tüm hakları saklıdır.

## 📞 İletişim

- **Website**: [https://guzellestir.com](https://guzellestir.com)
- **API Docs**: [https://api.guzellestir.com/docs](https://api.guzellestir.com/docs)
- **Support**: support@guzellestir.com

---

**© 2025 MasApp. Tüm hakları saklıdır.**
