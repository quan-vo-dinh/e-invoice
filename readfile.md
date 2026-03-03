Để hiểu toàn bộ codebase, hãy đọc theo thứ tự sau:

---

## Bước 1: Hiểu tổng quan dự án

Đọc các file config gốc trước:

- package.json — các scripts, dependencies, tên project
- nx.json — cấu hình Nx monorepo (cache, pipeline, targets)
- pnpm-workspace.yaml — khai báo các workspace packages
- tsconfig.base.json — path alias (ví dụ @common/... trỏ đến lib nào)
- .env — các biến môi trường

---

## Bước 2: Hiểu các thư viện dùng chung (libs/)

Đọc theo thứ tự từ nền tảng đến logic:

**2.1 constants/** — các hằng số, enum dùng chung

- lib

**2.2 interfaces/** — các interface, type dùng chung

- lib

**2.3 schemas/** — MongoDB schema (cấu trúc dữ liệu)

- lib

**2.4 configuration/** — cấu hình app (MongoDB, TCP, JWT...)

- lib

**2.5 decorators/** — custom decorator (ví dụ: lấy user từ request)

- lib

**2.6 middlewares/** — middleware (ví dụ: logging, auth)

- lib

**2.7 interceptors/** — interceptor (transform response, error handling)

- lib

**2.8 utils/** — các hàm tiện ích

- lib

---

## Bước 3: Hiểu các ứng dụng (apps/)

**3.1 invoice app** — microservice xử lý hóa đơn
Đọc theo thứ tự:

1. main.ts — entry point, khởi động app
2. configuration — config riêng của app
3. app.module.ts — module gốc, xem import gì
4. Các module con bên trong app/ (controller → service → repository)

**3.2 bff app** — API Gateway (Backend For Frontend), nhận request từ client và gọi đến microservices
Đọc theo thứ tự:

1. main.ts — entry point
2. configuration — config riêng
3. app.module.ts — module gốc
4. Các module con (controller → service → TCP client gọi invoice)

**3.3 invoice-e2e** — test end-to-end

- src — đọc sau cùng để hiểu flow test

---

## Bước 4: Hiểu luồng dữ liệu (Data Flow)

Sau khi đọc xong, hình dung luồng như sau:

```
Client (HTTP)
    ↓
BFF App (REST API - port 3000)
    ↓ (TCP)
Invoice Service (Microservice - port 3301)
    ↓
MongoDB (port 27017)
```

---

## Thứ tự đọc từng file trong module

Trong mỗi module NestJS, đọc theo thứ tự:

1. **Module** (`*.module.ts`) — xem import/export gì
2. **Controller** (`*.controller.ts`) — các route/endpoint
3. **Service** (`*.service.ts`) — logic xử lý
4. **Repository** (`*.repository.ts`) — truy vấn database
5. **DTO** (`*.dto.ts`) — validate input
6. **Tests** (`*.spec.ts`) — hiểu behavior qua test

---

**Gợi ý:** Nếu muốn tôi đọc và giải thích chi tiết từng phần, hãy nói bắt đầu từ bước nào và tôi sẽ đi sâu vào từng file cụ thể.
