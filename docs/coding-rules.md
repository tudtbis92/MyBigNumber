# TypeScript Coding & Logging Rules (MyBigNumber Project)

1. **Language Version:** TypeScript strict (`tsconfig`: `target ES2020`, `module NodeNext`, ESM `"type": "module"`).
2. **Naming Conventions:** `PascalCase` cho Class/Type, `camelCase` cho biến/hàm, `UPPER_CASE` cho hằng số.
3. **Algorithm Rule:** Cộng 2 chuỗi số phải duyệt từ phải sang trái (index từ `length - 1` về `0`), xử lý biến `carry` (số nhớ) đúng chuẩn phép cộng tiểu học.
4. **Logging Requirement:** Không `console.log` trực tiếp trong core. Inject `Logger` qua constructor (`(message: string) => void`, mặc định `console.log`) để ghi nhận lịch sử phép toán (bước, số hạng, số nhớ, kết quả tạm thời). Truyền `() => {}` để tắt log trong test.
5. **Exception Handling:** Không dùng `catch` chung chung để nuốt lỗi. Ném `Error` khi tham số đầu vào chứa ký tự không phải số (`0-9`).
6. **Tests:** Mọi thay đổi core phải kèm test `node:test` chạy trên `dist/` (`npm test` build trước rồi test). Giữ test xanh 100%.
