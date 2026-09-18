# MyBigNumber

Cong 2 so lon dang chuoi, khong gioi han do dai. Thuat toan cot doc tu phai sang trai, nhu hoc sinh tieu hoc.

## Cai dat

```sh
npm install mybignumber
```

Yeu cau: Node >= ES2020, ESM (`"type": "module"`).

## Su dung

```ts
import { MyBigNumber } from "mybignumber";

const svc = new MyBigNumber();
svc.sum("1234", "897"); // "2131"
```

So vao: chuoi chi gom `0-9`. So ra: chuoi khong co so 0 thua, `"0"` neu rong.

So khac do dai OK (`"897" + "1234" = "2131"`). Nho day chuyen OK (`"999" + "1" = "1000"`). So vuot int/long OK (`"12345678901234567890" + "98765432109876543210" = "111111111011111111100"`).

## API

### `new MyBigNumber(log?)`

- `log: (message: string) => void`, mac dinh `console.log`.
- Truyen `() => {}` de tat log. Truyen ham tu gom de thu step log.

### `sum(stn1: string, stn2: string): string`

Duyet `i = stn1.length - 1`, `j = stn2.length - 1`, giu `carry`. Moi vong: `total = digit1 + digit2 + carry`, ghi so `total % 10` vao truoc `result`, `carry = floor(total / 10)`. Lap den khi het ca 2 chuoi va het nho.

Moi buoc goi `log()` mot dong tieng Viet:

```text
Buoc 1: Lay 4 cong voi 7 duoc 11. Luu 1 vao ket qua va nho 1. Ket qua tam: "1".
```

Neu `carry > 0`: them `cong voi nho X`. Neu het nho: ghi `, het nho`.

## Lennh

```sh
npm run build   # tsc -> dist/
npm run demo    # build + node dist/demo.js (in 1234 + 897)
npm test        # build + node --test tests/MyBigNumber.test.mjs
```

## Cau truc

```text
src/MyBigNumber.ts   # class MyBigNumber + type Logger
src/index.ts         # re-export MyBigNumber, Logger
src/demo.ts          # demo 1234 + 897
tests/MyBigNumber.test.mjs  # 7 case node:test tren dist/
dist/                # output tsc (declaration + sourceMap)
```

`package.json`: `main dist/index.js`, `types dist/index.d.ts`. `tsconfig.json`: `target ES2020`, `module NodeNext`, `strict`, `rootDir src`, `outDir dist`.

