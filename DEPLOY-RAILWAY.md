# Railway — Backend + MongoDB

Deploy **chỉ backend và database** trước. Frontend deploy sau.

## 1. Tạo project Railway

1. [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub** → chọn repo `seafood`

## 2. Thêm MongoDB

1. Trong project → **+ New** → **Database** → **MongoDB**
2. Đợi MongoDB chạy xong

## 3. Cấu hình service Backend

1. Service backend (từ GitHub) → **Settings**
2. **Root Directory:** `backend`
3. **Networking** → **Generate Domain** → copy URL, ví dụ:
   `https://seafood-api-production.up.railway.app`

### Volume (ảnh upload — bắt buộc nếu dùng CMS upload)

1. Service backend → **Volumes** → **Add Volume**
2. **Mount path:** `/app/uploads`

## 4. Biến môi trường (Variables)

Trong service **backend** → **Variables**:

| Biến | Giá trị |
|------|---------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `${{MongoDB.MONGO_URL}}` *(click Reference → chọn service MongoDB)* |
| `JWT_SECRET` | Chuỗi ngẫu nhiên dài (32+ ký tự) |
| `ADMIN_USERNAME` | `admin` (hoặc tên khác) |
| `ADMIN_PASSWORD` | Mật khẩu mạnh |
| `API_PUBLIC_URL` | URL public backend, VD: `https://seafood-api-production.up.railway.app` |
| `CORS_ORIGIN` | `http://localhost:3000` *(tạm — đổi khi deploy frontend)* |

> `PORT` do Railway tự inject — **không** cần set.

### Reference MongoDB trên Railway

- Tab Variables → **+ New Variable** → **Add Reference**
- Chọn service MongoDB → biến `MONGO_URL` → đặt tên `MONGODB_URI`

## 5. Deploy

Push code lên GitHub hoặc **Deploy** thủ công trên Railway.

Build: `npm ci && npm run build`  
Start: `npm run start:prod`

## 6. Kiểm tra

```bash
# Health
curl https://YOUR-RAILWAY-URL.up.railway.app/api/health

# Sản phẩm
curl "https://YOUR-RAILWAY-URL.up.railway.app/api/products?locale=vi"

# Đăng nhập CMS (lưu accessToken)
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'
```

Kỳ vọng health:

```json
{"status":"ok","service":"hai-huong-seafood-api"}
```

## 7. Seed dữ liệu

Lần đầu (DB trống), API tự seed từ `src/database/seed-data/*.json` — không cần folder frontend trên Railway.

## 8. Khi deploy frontend sau

Cập nhật backend:

```env
CORS_ORIGIN=https://your-frontend.up.railway.app
```

Frontend sẽ dùng:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
NEXT_PUBLIC_API_ORIGIN=https://your-backend.up.railway.app
```

## Troubleshooting

| Lỗi | Cách xử lý |
|-----|------------|
| Crash: `JWT_SECRET is required` | Set đủ biến production (mục 4) |
| `MONGODB_URI` connection failed | Kiểm tra Reference tới MongoDB service |
| Upload ảnh mất sau redeploy | Gắn Volume `/app/uploads` |
| CORS error từ frontend local | Thêm `http://localhost:3000` vào `CORS_ORIGIN` |
