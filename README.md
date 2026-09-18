# MyBigNumber

Cộng 2 số lớn dạng chuỗi, không giới hạn độ dài. Thuật toán cột dọc từ phải sang trái, như học sinh tiểu học.

## Cài đặt

```sh
npm install mybignumber
```

Yêu cầu: Node >= ES2020, ESM (`"type": "module"`).

## Sử dụng

```ts
import { MyBigNumber } from "mybignumber";

const svc = new MyBigNumber();
svc.sum("1234", "897"); // "2131"
```

Số vào: chuỗi chỉ gồm `0-9`. Số ra: chuỗi không có số 0 thừa, `"0"` nếu rỗng.

Khác độ dài OK (`"897" + "1234" = "2131"`). Nhớ dây chuyền OK (`"999" + "1" = "1000"`). Số vượt int/long OK (`"12345678901234567890" + "98765432109876543210" = "111111111011111111100"`).

## API

### `new MyBigNumber(log?)`

- `log: (message: string) => void`, mặc định `console.log`.
- Truyền `() => {}` để tắt log. Truyền hàm tự gom để thu step log.

### `sum(stn1: string, stn2: string): string`

Duyệt `i = stn1.length - 1`, `j = stn2.length - 1`, giữ `carry`. Mỗi vòng: `total = digit1 + digit2 + carry`, ghi số `total % 10` vào trước `result`, `carry = floor(total / 10)`. Lặp đến khi hết cả 2 chuỗi và hết nhớ.

Mỗi bước gọi `log()` một dòng tiếng Việt:

```text
Bước 1: Lấy 4 cộng với 7 được 11. Lưu 1 vào kết quả và nhớ 1. Kết quả tạm: "1".
```

Nếu `carry > 0`: thêm `cộng với nhớ X`. Nếu hết nhớ: ghi `, hết nhớ`.

## Lệnh

```sh
npm run build   # tsc -> dist/
npm run demo    # build + node dist/demo.js (in 1234 + 897)
npm test        # build + node --test tests/MyBigNumber.test.mjs
```

## Cấu trúc

```text
src/MyBigNumber.ts   # class MyBigNumber + type Logger
src/index.ts         # re-export MyBigNumber, Logger
src/demo.ts          # demo 1234 + 897
tests/MyBigNumber.test.mjs  # 7 case node:test trên dist/
dist/                # output tsc (declaration + sourceMap)
```

`package.json`: `main dist/index.js`, `types dist/index.d.ts`. `tsconfig.json`: `target ES2020`, `module NodeNext`, `strict`, `rootDir src`, `outDir dist`.

