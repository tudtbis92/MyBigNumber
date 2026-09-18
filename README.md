# MyBigNumber

Cong 2 so lon dang chuoi + UI web minh hoa. Loi: cot doc tu phai sang trai, nhu hoc sinh tieu hoc. Web: tai dung loi qua `mybignumber`.

## Cai dat

```sh
npm install            # root: lib mybignumber
cd web && npm install  # web: react + vite (link lib qua file:..)
```

Yeu cau: Node >= ES2020, ESM.

## Su dung (lib)

```ts
import { MyBigNumber } from "mybignumber";

const svc = new MyBigNumber();
svc.sum("1234", "897"); // "2131"
```

So vao: chuoi chi gom `0-9`. So ra: chuoi khong so 0 thua, `"0"` neu rong.

So khac do dai OK (`"897" + "1234" = "2131"`). Nho day chuyen OK (`"999" + "1" = "1000"`). So vuot int/long OK (`"12345678901234567890" + "98765432109876543210" = "111111111011111111100"`).

## API

### `new MyBigNumber(log?)`

- `log: (message: string) => void`, mac dinh `console.log`.
- Truyen `() => {}` de tat log. Web truyen ham gom de render step list.

### `sum(stn1: string, stn2: string): string`

Duyet `i = stn1.length - 1`, `j = stn2.length - 1`, giu `carry`. Moi vong: `total = digit1 + digit2 + carry`, ghi so `total % 10` vao truoc `result`, `carry = floor(total / 10)`. Lap den khi het ca 2 chuoi va het nho.

Moi buoc goi `log()` mot dong tieng Viet:

```text
Buoc 1: Lay 4 cong voi 7 duoc 11. Luu 1 vao ket qua va nho 1. Ket qua tam: "1".
```

## Web UI (`web/`)

React 19 + Vite 7 + Bootstrap 5. `App.tsx` co 2 o nhap (`stn1` mac dinh `1234`, `stn2` mac dinh `897`), nut `Cong`. Validate `/^[0-9]+$/`, sai thi bao loi, dung thi goi `new MyBigNumber(push).sum(a, b)`, hien ket qua + list step log. `main.tsx` mount `StrictMode`. `index.html` tieng Viet, `div#root`.

```sh
cd web
npm run dev      # vite dev
npm run build    # tsc && vite build
npm run preview  # vite preview
```

`vite.config.ts`: `plugin-react`, `optimizeDeps.include: ["mybignumber"]`.

## Lennh (root)

```sh
npm run build   # tsc -> dist/
npm run demo    # build + node dist/demo.js (in 1234 + 897)
npm test        # build + node --test tests/MyBigNumber.test.mjs (7 case)
```

## Cau truc

```text
src/MyBigNumber.ts   # class MyBigNumber + type Logger
src/index.ts         # re-export MyBigNumber, Logger
src/demo.ts          # demo 1234 + 897
tests/MyBigNumber.test.mjs  # 7 case node:test tren dist/
web/src/App.tsx      # form + validate + hien ket qua/steps
web/src/main.tsx     # entry React
web/src/app.css      # .app-shell max-width 720px
web/index.html       # lang vi, div#root
```

