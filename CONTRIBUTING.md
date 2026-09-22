# Contributing — MyBigNumber

## Nhánh

- `core`: nhánh chính (default). Không push thẳng.
- Tính năng/sửa lỗi: `feature/<mô-tả-ngắn>` (vd: `feature/governance-0.0.2`).
- Mỗi PR phải gắn Issue (dùng template Feature/Bug).

## Quy tắc PR

1. Điền đầy đủ PULL_REQUEST_TEMPLATE (đặc biệt AI checklist).
2. `npm test` xanh 100% trước khi đẩy, dán log vào Evidence.
3. Không commit `dist/`, `node_modules/` (đã gitignore, build ở CI/local).
4. Cần 1 approval của người review trước khi merge vào `core`.

## Chính sách AI

- Code AI sinh ra là **UNTRUSTED** cho đến khi đọc + test từng dòng.
- Không đưa secret/key vào prompt hay file repo.
- Kiểm tra dependency AI đề xuất có tồn tại và phù hợp (Hallucination Scan).
