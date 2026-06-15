# Hai Huong Seafood API

NestJS REST API phục vụ website frontend Next.js. Database: **MongoDB**.

## Yêu cầu

- Node.js 20+
- MongoDB (local hoặc Atlas)
- Frontend nằm cùng cấp: `../frontend` (dùng để seed dữ liệu ban đầu)

## Cài đặt & chạy

```bash
npm install
cp .env.example .env
# Đảm bảo MongoDB đang chạy, ví dụ: mongod
npm run start:dev
```

API chạy tại `http://localhost:3001/api`

## Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/health` | Health check |
| GET | `/api/products?locale=vi` | Danh sách sản phẩm |
| GET | `/api/products/:id?locale=vi` | Chi tiết sản phẩm |
| GET | `/api/news?locale=vi&page=1&limit=10` | Tin tức (phân trang) |
| GET | `/api/news/:id?locale=vi` | Chi tiết tin tức |
| POST | `/api/contact` | Gửi form liên hệ |
| POST | `/api/admin/auth/login` | Đăng nhập CMS |
| CRUD | `/api/admin/products` | Quản lý sản phẩm |
| CRUD | `/api/admin/news` | Quản lý tin tức |
| GET/DELETE | `/api/admin/contact` | Tin nhắn liên hệ |

### Locale

Hỗ trợ `vi` (mặc định) và `en` qua query `?locale=`.

### Environment

```env
MONGODB_URI=mongodb://127.0.0.1:27017/seafood
JWT_SECRET=change-me-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Cấu trúc

- `products`, `news`, `contact` — MongoDB collections, seed từ `frontend/src/messages/*.json` lần đầu
- Nội dung tĩnh (hero, about, footer...) giữ trong file JSON frontend, không qua API
