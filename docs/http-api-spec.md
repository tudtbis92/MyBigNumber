# HTTP API Spec — MyBigNumber (chuẩn bị execute)

Bối cảnh: nhánh `core` có class `MyBigNumber.sum(stn1, stn2)` cộng chuỗi số lớn, validation regex `/^[0-9]+$/`, logger inject, test `node:test` trên `dist/`. Docs hiện tại (`docs/api-spec.md`) ghi rõ "không có HTTP layer". Spec này định nghĩa lớp HTTP để execute, không sửa core.

## Quyết định đã chốt (thảo luận 2026-09-23)

- Framework: **Express 5** (`express.json()` + error middleware 4 tham số). Lý do: team chọn quen thuộc; Context7 xác nhận pattern tối giản; Tavily ghi Fastify nhanh hơn nhưng overkill cho 1 endpoint.
- Contract: `POST /api/sum` trả **result + steps**.
- Lỗi: **envelope chuẩn** `{ code, message, details }`.
- Phạm vi: **chuẩn deploy + OpenAPI** (CORS, PORT env, Dockerfile, script start, OpenAPI 3.1 + Swagger UI). Không làm rate-limit, helmet, pino ở phase này.

## Contract

### POST /api/sum

Request:

```json
{ "stn1": "1234", "stn2": "897" }
```

- `Content-Type: application/json`, body phải là object với đúng 2 field string.
- Validation: chuỗi khác rỗng, chỉ `0-9`. Reuse logic core (không thêm Zod/AJV — tránh dep mới cho rule đã có trong codebase).

Success `200`:

```json
{
  "result": "2131",
  "steps": [
    "Bước 1: Lấy 4 cộng với 7 được 11. Lưu 1 vào kết quả và nhớ 1. Kết quả tạm: \"1\"."
  ]
}
```

- `steps` thu bằng cách inject logger gom mảng (`new MyBigNumber((m) => steps.push(m))`), không `console.log` trong core (giữ coding-rules #4).
- Ví dụ kiểm chứng: `("999","1") → "1000"`, `("0","0") → "0"`, số 500 chữ số vẫn OK.

Error:

| Trường hợp | HTTP | Body |
|---|---|---|
| Thiếu field / sai kiểu / chuỗi rỗng / ký tự lạ | `400` | `{ "code": "INVALID_INPUT", "message": "<message core tiếng Việt>", "details": { "stn1": "...", "stn2": "..." } }` |
| JSON parse lỗi | `400` | `{ "code": "INVALID_JSON", "message": "Body phải là JSON hợp lệ." }` |
| Route không tồn tại | `404` | `{ "code": "NOT_FOUND", "message": "..." }` |
| Lỗi không ngờ | `500` | `{ "code": "INTERNAL_ERROR", "message": "Internal Server Error" }` (không lộ stack) |

`message` cho `INVALID_INPUT` reuse nguyên văn `Error` core ném ra để client và test cũ khớp nhau.

### GET /health

`200 { "status": "ok", "version": "0.0.2" }`. Dùng cho Docker/CI check, không auth.

### CORS, PORT

- CORS mở mặc định (`cors` dep duy nhất thêm cùng `express`; hoặc tự set header nếu muốn 0 dep phụ — chốt ở execute, mặc định dùng `cors`).
- `PORT` từ env, mặc định `3000`. `app.listen(PORT)`.

## Domain / cấu trúc dự kiến (execute làm, spec chỉ định hướng)

```text
src/server.ts        # tạo Express app, POST /api/sum, GET /health, GET /openapi.json, GET /docs, error middleware, export app + start khi chạy trực tiếp
src/index.ts         # giữ re-export cũ, thêm export server factory nếu cần (không phá API cũ)
openapi/openapi.yaml # OpenAPI 3.1 duy nhất làm source of truth, serve lại ở /openapi.json + /docs (Swagger UI)
tests/api.test.mjs   # test HTTP bằng fetch/node:test trên dist/ + server ephemeral port, gồm contract-test khớp openapi
Dockerfile           # multi-stage: npm ci + tsc -> node dist/server.js
```

- Không tách controller/service/validator thành nhiều lớp cho 1 endpoint (YAGNI). Mọi validation nằm ở handler + core.
- Giữ coding-rules hiện hành: strict TS, ESM NodeNext, Loop Rule (không khai báo biến trong loop), String Building (mảng + join), test chạy trên `dist/` (`npm test` build trước).
- `package.json` thêm: `express`, `cors`, `swagger-ui-express`, `@types/express`, `@types/cors`, `@types/swagger-ui-express`, scripts `start: node dist/server.js`, `dev` (nếu cần `tsx` — né thêm dep nếu không cần). Không dùng `express-openapi-validator` (quá nặng cho 1 endpoint; validation reuse core + check thủ công theo schema).

## OpenAPI chuẩn (bắt buộc)

- File duy nhất: `openapi/openapi.yaml`, `openapi: 3.1.0`, `info.title: MyBigNumber API`, `version` khớp `package.json`.
- Paths: `POST /api/sum` (request `SumRequest` required `stn1`, `stn2` pattern `^[0-9]+$`; response `200 SumResponse` với `result` + `steps[]`; response `400/404/500 ErrorEnvelope` với `code`, `message`, `details`), `GET /health`, `GET /openapi.json`.
- Serve: `GET /openapi.json` trả YAML/JSON parse từ file (không hardcode spec thứ hai); `GET /docs` mount Swagger UI từ cùng document.
- Quy tắc: mọi thay đổi contract phải sửa `openapi.yaml` trước, code + test theo sau. YAML là source of truth duy nhất.

## Test plan (execute phải xanh)

1. Giữ 9 case core cũ xanh 100%.
2. Thêm API test (`node:test` + `fetch` tới port ngẫu nhiên):
   - `POST ("1234","897") → 200 result "2131", steps.length === 4, steps[0] match /Lấy 4 cộng với 7/`.
   - `POST ("999","1") → "1000"`.
   - `POST ("12a","897") → 400 INVALID_INPUT, message chứa "chỉ nhận chuỗi số"`.
   - `POST {} → 400`, body sai JSON → 400 INVALID_JSON, `GET /health → 200 ok`.
   - Contract-test: `GET /openapi.json → 200`, parse được, chứa `POST /api/sum`; mọi response thực tế của 4 case trên validate khớp schema trong `openapi.yaml` (dùng validator nhẹ hoặc check thủ công field + pattern, không cần thêm dep nặng).
   - `GET /docs → 200` trả Swagger UI HTML.
3. `npm test` build trước rồi test (giữ rule #6). Dán log vào Evidence PR.

## Review & Verify sau execute (gate bắt buộc, không merge khi chưa xong)

1. **Self-review code generate:** đọc từng dòng `src/server.ts` + `openapi.yaml` đối chiếu spec; check Hallucination Scan (dep tồn tại, API Express 5 đúng: `express.json()`, error middleware 4 tham số, `next(err)` cho async); xác nhận không `console.log` trong core, không prepend string, không biến trong loop, ESM `.js` suffix.
2. **Contract verify:** `npm test` xanh 100% (core + API + contract-test); `GET /docs` mở được Swagger UI; thử `POST /api/sum` bằng Swagger UI 1 case đúng + 1 case sai, đối chiếu response với envelope trong spec.
3. **PR Evidence:** dán log `npm test`, ảnh/screenshot hoặc curl log của `/docs` + `/openapi.json`, checklist AI trong PULL_REQUEST_TEMPLATE đánh dấu đã review từng dòng.
4. Người review xác nhận 3 mục trên mới approve merge vào `core`.

## Deploy

- Dockerfile multi-stage `node:20-alpine`, expose PORT, `CMD ["node", "dist/server.js"]`.
- Không commit `dist/`, `node_modules/`. CI/local build.
- Branch theo CONTRIBUTING: `feature/http-api-*` từ `core`, PR gắn Issue, 1 approval, Hallucination Scan dep mới.

## Không làm (defer)

- Rate-limit, helmet, pino, `express-openapi-validator` — thêm khi có nhu cầu thật.
- Zod/AJV/TypeBox — core đã validate, thêm là trùng.
- Auth — health và sum public ở phase này.

## Bổ sung theo Add2Num_Long_Promps_20260922 (Lab_01)

Nguồn: `Lab_01/Add2Num_Long_Promps_20260922.docx` (workflow spec.md → openapi.yaml → implementation-plan → skeleton → vertical slice → validation/errors → review → verification + traceability). Mục này lấp khoảng trống của spec hiện tại, không sửa quyết định đã chốt (Express, result+steps, envelope, deploy chuẩn).

- **Mục tiêu:** expose `MyBigNumber.sum` qua HTTP cho client ngoài Node. Core giữ nguyên, web module chỉ delegate — cấm duplicate thuật toán, cấm thay bằng BigInt.
- **Actor/use-case:** client HTTP gọi `POST /api/sum`; devops/CI check `GET /health`; reviewer verify qua `GET /docs` + `GET /openapi.json`.
- **Validation matrix (API boundary, trước khi gọi core):**

| Field | Required | Rule | Lỗi |
|---|---|---|---|
| `stn1`, `stn2` | Có | string, khác rỗng, chỉ `0-9` (pattern `^[0-9]+$`) | `400 INVALID_INPUT` |
| body | Có | object đúng 2 field, `Content-Type: application/json` | `400 INVALID_INPUT` / `INVALID_JSON` khi parse lỗi |
| số âm (`-12`), khoảng trắng, `null`, số JSON (không phải string) | — | Từ chối | `400 INVALID_INPUT` |

- **Policy chốt (assumption, ghi rõ để execute khỏi đoán mò):** số 0 ở đầu được chấp nhận (`"007" + "003" = "10"`); output không có số 0 thừa (do core); không giới hạn độ dài ở spec — giới hạn duy nhất là `express.json({ limit: "100kb" })` mặc định (~100k chữ số/input, dư xa case 500 chữ số); vượt limit → `413` (Express tự ném, map vào envelope).
- **NFR:** giữ hiệu năng core O(n); 1 endpoint <200 LOC; không auth ở phase này; `GET /health` không log steps.
- **Security/logging:** không secret/key trong code/prompt (theo CONTRIBUTING); không dump body request ra console — console chỉ nhận log lỗi server; `steps` chứa chữ số input là đúng thiết kế (client đã gửi), không coi là leak; error `500` không lộ stack.
- **Thứ tự execute (vertical slice, mỗi bước validate độc lập):**
  1. Skeleton: `src/server.ts` + deps + `openapi/openapi.yaml` rỗng đúng khung → validate `npm run build`.
  2. Success path: `POST /api/sum` đúng + `GET /health` → validate 2 case fetch tay.
  3. Validation/errors: matrix trên + envelope → validate full API test.
  4. Docs: `/openapi.json` + `/docs` → validate mở Swagger UI, thử 1 đúng + 1 sai.
  5. Dockerfile + contract-test → validate `npm test` xanh + build image.
- **Traceability (acceptance → API → test):**

| # | Acceptance | API | Test |
|---|---|---|---|
| AC1 | Cộng đúng `1234+897=2131` kèm 4 steps | `POST /api/sum 200` | api.test: result + steps.length + match log |
| AC2 | Nhớ dây chuyền `999+1=1000`, `0+0=0`, 500 chữ số | `POST /api/sum 200` | api.test 3 case |
| AC3 | Từ chối input lạ theo matrix | `400 INVALID_INPUT` + message core | api.test ký tự lạ/rỗng/thiếu field/null |
| AC4 | JSON vỡ, route lạ, lỗi lạ đúng envelope | `400 INVALID_JSON` / `404` / `500` | api.test 3 case |
| AC5 | Contract duy nhất, docs mở được | `/openapi.json`, `/docs` | contract-test + GET /docs 200 |
| AC6 | Không sửa core, 9 case cũ xanh | — | suite core cũ |

- **Lệch chuẩn Lab_01 có chủ ý:** giữ `POST /api/sum` (không version `/api/v1`, không plural — 1 hàm thuần, version khi có breaking change); giữ envelope `{code,message,details}` thay vì RFC 7807 + `422` (giữ nguyên message core tiếng Việt, 1 format cho mọi lỗi validation). Ghi nhận để reviewer khỏi bắt lỗi nhầm.
- **Câu hỏi mở còn lại (không block execute, sai thì sửa spec):** có cần `GET` query-string cho demo trình duyệt không? Có cần giới hạn độ dài chặt hơn 100kb không? Có cần i18n message lỗi (Anh/Việt) không? Mặc định: không.

## Research tham khảo

- Tavily (2025-2026): Fastify ~9ms/97k req/s vs Express ~16ms/60k req/s; raw http nhẹ nhất nhưng tự parse body; single endpoint giữ layout <200 LOC.
- Context7 `/expressjs/express`: pattern `express.json()` + route POST + error handler 4 tham số + `next(err)` cho async.
- Tavily OpenAPI 2025-2026: contract trong `openapi/api.yaml`, serve Swagger UI tại `/docs` từ cùng file, `express-openapi-validator` hỗ trợ OAS 3.1 + Express 5 nhưng nặng — spec này chọn validation reuse core + contract-test nhẹ.
- Context7 `/websites/swagger_io`: schema `requestBody application/json` + `responses 200/default Error` bằng `$ref components/schemas`.
- Docx `Lab_01/Add2Num_Long_Promps_20260922.docx`: workflow spec → openapi → plan → skeleton → vertical slice → validation → review → verification; yêu cầu delegate 100% cho core, validation ở boundary, controller mỏng, traceability report, không đoán mò khi spec mù mờ.
