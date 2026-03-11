# 🤖 AI Context Guide — Dành Cho AI Assistant

> **Mục đích file này:** Khi bắt đầu một cửa sổ ngữ cảnh mới, AI cần đọc file này để hiểu ngay: tôi là ai, tôi đang học gì, dự án này là gì, và cách hỗ trợ tôi hiệu quả nhất.

---

## 1. Về Tôi (Người Dùng)

- **Tên:** Vũ Đình Quân
- **Level:** Backend Developer đang nâng cao kỹ năng, quen với JavaScript/TypeScript cơ-trung cấp
- **Ngôn ngữ giao tiếp:** **Tiếng Việt** (trừ khi tôi chủ động dùng tiếng Anh)
- **Cách học:** Học qua thực hành, hỏi-hiểu-làm, không học theo kiểu học thuộc lý thuyết
- **Cần hỗ trợ:** Giải thích rõ "tại sao", so sánh ưu/nhược điểm, và confirm lại hiểu biết của tôi có đúng không

---

## 2. Khóa Học Đang Theo

**Tên khóa học:** NestJS Microservices Thực Chiến: Production-Ready E-Invoice System  
**Giảng viên:** Đỗ Tấn Thành (mentor)  
**Phương châm:** "Học thật – Làm thật"

### Mục tiêu khóa học:

- Xây dựng hệ thống **8 microservices** production-ready từ đầu
- Tích hợp Stripe payment, Keycloak auth, Kafka events, Redis cache, Grafana monitoring
- Deploy với Docker Compose, centralized logging với Loki + Promtail

### File hướng dẫn của mentor:

> Xem `docs/TEACHING_GUIDE.md` — đây là tài liệu gốc của mentor, hướng dẫn toàn bộ kiến trúc, luồng xử lý, và tech stack. Đây là **nguồn chính thức** cho project này.

---

## 3. Tech Stack Dự Án

### Backend

| Layer         | Technology                                | Ghi Chú                 |
| ------------- | ----------------------------------------- | ----------------------- |
| Framework     | NestJS + TypeScript                       | Main framework          |
| Monorepo      | Nx Workspace                              | Quản lý các apps + libs |
| Communication | TCP (nội bộ), gRPC (Auth), Kafka (events) | Internal services       |
| API Gateway   | BFF Service (HTTP REST)                   | Port 3300               |

### Infrastructure

| Service         | Port  | Mục Đích                      |
| --------------- | ----- | ----------------------------- |
| MongoDB         | 27017 | Document DB cho User, Invoice |
| PostgreSQL      | 5432  | Relational DB cho Product     |
| Keycloak        | 8180  | Auth & Identity Provider      |
| Redis           | 6379  | Token cache, session          |
| Kafka           | 9092  | Async events                  |
| Grafana         | 3001  | Monitoring                    |
| Loki + Promtail | 3100  | Centralized logging           |

### Frontend (chưa xây dựng)

- **Dự kiến:** Next.js (Authorization Code + PKCE flow với Keycloak)

---

## 4. Kiến Trúc Tổng Thể (8 Microservices)

```
🌐 Client/Next.js (Frontend — chưa xây)
        │ HTTP REST
        ▼
🚪 BFF Service (apps/bff) — Port 3300
   └── HTTP API Gateway, Swagger, Global Guards
        │ TCP
        ├──────────────────────────┐
        ▼                         ▼
📄 Invoice Service          👤 User-Access Service (apps/user-access)
   (apps/invoice)                │ TCP KEYCLOAK.*
   Kafka Producer                ▼
        │               🔐 Authorizer Service (apps/authorizer)
        │               Keycloak adapter (client_credentials)
        ▼
🔄 Kafka ──► 📧 Mail Service (async email + PDF)
        │ TCP
        ├──► 📄 PDF Generator
        ├──► 📁 Media Service (Cloudinary)
        └──► 💳 Payment Service (Stripe + Webhook)
```

**Giao tiếp giữa services:**

- **BFF ↔ Business Services:** TCP (RPC pattern)
- **BFF ↔ Authorizer:** gRPC (hiện tại BFF và services đang dùng TCP trong giai đoạn học, sẽ migrate sang gRPC)
- **Invoice → Mail:** Kafka Pub/Sub (async)
- **Database:** MongoDB (User, Invoice), PostgreSQL (Product)

---

## 5. Auth Flow — Cực Kỳ Quan Trọng

Dự án dùng **Keycloak** làm Identity Provider, hiện đang implement 3 grant types:

### 5.1 `client_credentials` ✅ (Đang dùng)

- **Ai dùng:** Authorizer service (backend)
- **Mục đích:** Lấy token quản trị để gọi Keycloak Admin API (tạo user, v.v.)
- **Request:** `POST /token` với `client_id + client_secret + grant_type=client_credentials`
- **KHÔNG có** username/password user

### 5.2 `password` grant ⚠️ (Dev/test only)

- **Ai dùng:** Developer trong quá trình test
- **Mục đích:** Lấy access token nhanh để test API backend mà không cần frontend
- **Request:** `POST /token` với `username + password + grant_type=password`
- **KHÔNG dùng** trong production

### 5.3 `authorization_code` + PKCE 🔜 (Production — chưa xây Next.js)

- **Ai dùng:** Next.js frontend
- **Mục đích:** Login production flow, user không bao giờ chia sẻ password với app
- **Flow:** Next.js redirect → Keycloak UI → `code` trả về callback → backend exchange lấy token
- **Endpoint khởi đầu:** `GET /realms/{realm}/protocol/openid-connect/auth?response_type=code&...`

### 5.4 Tại sao user data lưu ở 2 nơi?

- **Keycloak:** Lưu identity (email, password hash, login session)
- **MongoDB:** Lưu business profile (roles, tenant, status, app-specific data)
- Liên kết bởi `keycloakUserId` trong MongoDB document

---

## 6. Cấu Trúc Thư Mục Quan Trọng

```
apps/
├── bff/              # API Gateway (HTTP REST, Port 3300)
├── authorizer/       # Keycloak adapter (TCP + gRPC)
├── user-access/      # User management service (TCP)
├── invoice/          # Invoice + payment service (TCP + Kafka)
├── product/          # Product catalog service (TCP)
└── invoice-e2e/      # E2E tests

libs/                 # Shared libraries (dùng chung cho tất cả apps)
├── configuration/    # ConfigModule setup
├── constants/        # Enums (TCP message names, error codes)
├── decorators/       # Custom decorators (@RequestParams, v.v.)
├── entities/         # Base entities / schemas
├── interceptors/     # TcpLoggingInterceptor, ExceptionInterceptor
├── interfaces/       # TCP request/response interfaces
├── middlewares/      # HTTP middlewares
├── schemas/          # Mongoose schemas
└── utils/            # Helper utilities

docs/
├── TEACHING_GUIDE.md        # 📌 Tài liệu chính của mentor
├── AI_CONTEXT_GUIDE.md      # 📌 File này — context cho AI
└── user-create-flow.mmd.md  # Flow diagram user creation
```

---

## 7. Luồng Đã Implement (Tính đến thời điểm file này tạo)

### ✅ User Creation Flow (BFF → User-Access → Authorizer → Keycloak + MongoDB)

1. `POST /api/v1/users` (BFF)
2. TCP `USER.CREATE` → User-Access
3. Check duplicate email (MongoDB)
4. TCP `KEYCLOAK.CREATE_USER` → Authorizer
5. Authorizer exchange `client_credentials` token → Keycloak Admin API
6. `POST /admin/realms/{realm}/users` → tạo user trên Keycloak
7. Parse `userId` từ Location header
8. Lưu user profile + `keycloakUserId` vào MongoDB
9. Trả về response

**Xem chi tiết:** `docs/user-create-flow.mmd.md`

### ✅ Login Flow (đang implement)

- Message pattern: `AUTHORIZER.LOGIN`
- File: `apps/authorizer/src/app/authorizer/controllers/authorizer.controller.ts`
- Dùng `exchangeUserToken()` (password grant) cho dev/test

---

## 8. Giai Đoạn Học Hiện Tại

Dự án đang ở **giai đoạn đầu** (Phase 1):

- [x] Setup Nx monorepo, docker-compose
- [x] Keycloak integration (client_credentials, user creation)
- [x] User creation end-to-end flow
- [ ] Login flow + JWT validation guard
- [ ] Product CRUD
- [ ] Invoice CRUD
- [ ] PDF generation
- [ ] File upload (Cloudinary)
- [ ] Kafka events (invoice.sent → email)
- [ ] Stripe payment integration
- [ ] Redis token caching
- [ ] gRPC migration
- [ ] Monitoring (Grafana + Loki)
- [ ] Next.js frontend

---

## 9. Cách AI Nên Hỗ Trợ Tôi

1. **Luôn dùng tiếng Việt** — trừ khi tôi hỏi bằng tiếng Anh
2. **Giải thích rõ "tại sao"** — không chỉ "làm thế này" mà còn "tại sao làm thế này"
3. **Confirm lại hiểu biết** — khi tôi nói "tôi hiểu là..." thì hãy xác nhận đúng/sai, chỗ nào sai thì sửa
4. **Đọc code hiện tại trước** khi suggest thay đổi — đừng đoán, hãy dùng tool đọc file
5. **Bám sát kiến trúc mentor** — tham chiếu `docs/TEACHING_GUIDE.md` khi có câu hỏi về design decisions
6. **Không over-engineer** — tôi đang học theo lộ trình, không thêm feature chưa đến giai đoạn
7. **So sánh** khi cần — ví dụ "cách này vs cách kia khác nhau ở điểm gì"

---

## 10. Lỗi / Vấn Đề Đã Gặp Và Đã Giải Quyết

| Lỗi                                  | Nguyên Nhân                                                   | Giải Pháp                                                                                  |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `401 unauthorized_client` (Keycloak) | Service account chưa bật Client Credentials grant             | Bật `Service Accounts Enabled` + `Client authentication` trong Keycloak client             |
| `403 Forbidden` (Keycloak Admin API) | Service account thiếu role `manage-users`                     | Assign `realm-management` roles: `manage-users`, `view-users`, `query-users`, `view-realm` |
| Nx Cloud bundle cache corrupted      | Cache hỏng                                                    | Xóa cache, reset daemon, chạy với `NX_CLOUD=false`                                         |
| `.env` variable không đọc được       | Tên biến có space thừa (e.g. `TCP_AUTHORIZER  _SERVICE_PORT`) | Sửa tên biến, xóa space thừa                                                               |
