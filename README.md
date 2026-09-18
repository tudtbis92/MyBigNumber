# MyBigNumber

Cộng 2 số lớn dạng chuỗi + UI web minh họa. Lõi: cột dọc từ phải sang trái, như học sinh tiểu học. Web: tái dùng lõi qua `mybignumber`.

## Cài đặt

```sh
npm install            # root: lib mybignumber
cd web && npm install  # web: react + vite (link lib qua file:..)
```

Yêu cầu: Node >= ES2020, ESM.

## Sử dụng (lib)

```ts
import { MyBigNumber } from "mybignumber";

const svc = new MyBigNumber();
svc.sum("1234", "897"); // "2131"
```

Số vào: chuỗi chỉ gồm `0-9`. Số ra: chuỗi không số 0 thừa, `"0"` nếu rỗng.

Khác độ dài OK (`"897" + "1234" = "2131"`). Nhớ dây chuyền OK (`"999" + "1" = "1000"`). Số vượt int/long OK (`"12345678901234567890" + "98765432109876543210" = "111111111011111111100"`).

## API

### `new MyBigNumber(log?)`

- `log: (message: string) => void`, mặc định `console.log`.
- Truyền `() => {}` để tắt log. Web truyền hàm gom để render step list.

### `sum(stn1: string, stn2: string): string`

Duyệt `i = stn1.length - 1`, `j = stn2.length - 1`, giữ `carry`. Mỗi vòng: `total = digit1 + digit2 + carry`, ghi số `total % 10` vào trước `result`, `carry = floor(total / 10)`. Lặp đến khi hết cả 2 chuỗi và hết nhớ.

Mỗi bước gọi `log()` một dòng tiếng Việt:

```text
Bước 1: Lấy 4 cộng với 7 được 11. Lưu 1 vào kết quả và nhớ 1. Kết quả tạm: "1".
```

## Web UI (`web/`)

React 19 + Vite 7 + Bootstrap 5. `App.tsx` có 2 ô nhập (`stn1` mặc định `1234`, `stn2` mặc định `897`), nút `Cộng`. Validate `/^[0-9]+$/`, sai thì báo lỗi, đúng thì gọi `new MyBigNumber(push).sum(a, b)`, hiện kết quả + list step log. `main.tsx` mount `StrictMode`. `index.html` tiếng Việt, `div#root`.

```sh
cd web
npm run dev      # vite dev
npm run build    # tsc && vite build
npm run preview  # vite preview
```

`vite.config.ts`: `plugin-react`, `optimizeDeps.include: ["mybignumber"]`.

## Lệnh (root)

```sh
npm run build   # tsc -> dist/
npm run demo    # build + node dist/demo.js (in 1234 + 897)
npm test        # build + node --test tests/MyBigNumber.test.mjs (7 case)
```

## Cấu trúc

```text
src/MyBigNumber.ts   # class MyBigNumber + type Logger
src/index.ts         # re-export MyBigNumber, Logger
src/demo.ts          # demo 1234 + 897
tests/MyBigNumber.test.mjs  # 7 case node:test trên dist/
web/src/App.tsx      # form + validate + hiện kết quả/steps
web/src/main.tsx     # entry React
web/src/app.css      # .app-shell max-width 720px
web/index.html       # lang vi, div#root
```

