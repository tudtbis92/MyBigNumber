# API Spec — MyBigNumber

Thư viện nội bộ, dùng trực tiếp qua import (không có HTTP layer).

## `new MyBigNumber(log?)`

- `log?: (message: string) => void`, mặc định `console.log`.
- Mỗi bước cộng gọi `log()` một dòng tiếng Việt, vd:
  `Bước 1: Lấy 4 cộng với 7 được 11. Lưu 1 vào kết quả và nhớ 1. Kết quả tạm: "1".`

## `sum(stn1: string, stn2: string): string`

| Input | Output | Ghi chú |
|---|---|---|
| `("1234", "897")` | `"2131"` | Ví dụ trong đề |
| `("999", "1")` | `"1000"` | Nhớ dây chuyền |
| `("0", "0")` | `"0"` | Zero |
| input chứa ký tự lạ | ném `Error` | Validation |

Package: `main dist/index.js`, `types dist/index.d.ts`, ESM.
