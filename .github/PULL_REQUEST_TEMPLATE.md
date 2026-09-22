## Mở đầu Pull Request

<!-- Mô tả ngắn gọn những thay đổi, tính năng hoặc unit test được thêm mới trong PR này. -->

- **Loại thay đổi:** [ ] Core Logic | [ ] Unit Test | [ ] Docs/Governance | [ ] Khác
- **Liên quan đến Issue số:** #...

---

## AI-Specific PR Checklist (Kiểm định chuẩn Harness Engineering)

Trước khi yêu cầu Review, vui lòng tự kiểm tra các tiêu chí sau:

- [ ] **Hallucination Scan:** Đã kiểm tra không có thư viện/dependency ngoài luồng nào do AI sinh ra bị đưa vào dự án (chỉ dùng TypeScript tiêu chuẩn + `node:test`).
- [ ] **Secret Inspection:** Đã quét mã nguồn và xác nhận **không** có thông tin nhạy cảm, mật khẩu hoặc file cấu hình cá nhân bị lọt (`.env`, tệp log...).
- [ ] **Coding Rules Compliance:** Mã nguồn tuân thủ tuyệt đối quy tắc tại `docs/coding-rules.md` (đặt tên PascalCase/camelCase, thuật toán duyệt từ phải sang trái xử lý số nhớ `carry`).
- [ ] **Test Validity:** Các kịch bản kiểm thử đơn vị (Unit Test) đã chạy thành công 100% (Green status) qua `npm test` trước khi đẩy.

---

## Kết quả kiểm thử / Minh chứng (Evidence)

<!-- Dán log `npm test` pass 100% -->

- **Trạng thái Test:** [ ] Pass / [ ] Fail
- **Ghi chú thêm cho Reviewer:**
