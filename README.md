# MyBigNumber (Add2Num)

Cộng 2 số lớn dạng chuỗi, theo cách đặt tính hồi tiểu học.
Bài tập trên lớp — Task 1: lõi `MyBigNumber.sum()`, nhánh `core`, tag `0.0.1`.

## Chạy

Cần Node.js 20+ và npm 10+.

```bash
npm install
npm run build   # ra dist/
npm run demo    # ví dụ 1234 + 897 = 2131, in từng bước ra console
npm test        # 7 test, dùng test-runner có sẵn của Node
```

## Dùng trong code khác

```ts
import { MyBigNumber } from "./dist/MyBigNumber.js";

new MyBigNumber().sum("1234", "897"); // "2131", log từng bước ra console
new MyBigNumber(() => {}).sum("999", "1"); // "1000", tắt log
```

Lưu ý:

- Mỗi bước cộng được log lại. Mặc định log ra `console.log`, muốn ghi chỗ khác thì truyền `Logger` vào constructor.
- Input coi như luôn đúng (chỉ gồm `0-9`), chưa kiểm tra lỗi — theo đúng đề bài.
- Tests để riêng trong `tests/`.
