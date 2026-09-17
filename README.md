# MyBigNumber — Project Add 2 numbers (Add2Num)

Lõi cộng 2 số lớn (dạng chuỗi) theo thuật toán học sinh tiểu học.
Task 1 — nhánh `core`, version `0.0.1`.

## Yêu cầu môi trường

- Node.js >= 20 (đã kiểm chứng với Node v22)
- npm >= 10

## Cài đặt

```bash
npm install
```

## Biên dịch

```bash
npm run build
```

Kết quả nằm trong `dist/` (`dist/MyBigNumber.js`, `dist/demo.js`).

## Chạy demo (ví dụ trong đề: 1234 + 897 = 2131)

```bash
npm run demo
```

Mỗi bước cộng được log ra console bằng tiếng Việt có dấu
(`Bước 1: Lấy 4 cộng với 7 được 11...`).

## Chạy Unit Testing

Tests nằm riêng trong `tests/` (không chung với `src/`), dùng test-runner có sẵn của Node, không dependency ngoài:

```bash
npm test
```

## Cách nhóm UI/console gọi hàm

```ts
import { MyBigNumber } from "./dist/MyBigNumber";

const svc = new MyBigNumber(); // mặc định log ra console
console.log(svc.sum("1234", "897")); // "2131"

// Muốn tắt log (ví dụ khi làm UI):
const silent = new MyBigNumber(() => {});
silent.sum("999", "1"); // "1000"
```

Giả định theo đề: input chỉ chứa kí số `0-9` hợp lệ, chưa xử lý lỗi dữ liệu.

## Lịch sử phép toán

`MyBigNumber` nhận `Logger` qua constructor (mặc định `console.log`), mỗi bước duyệt từ phải sang trái được ghi lại: digits lấy ra, tổng tạm, digit lưu, nhớ mới, kết quả tạm.
