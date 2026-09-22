# Domain Model — MyBigNumber

## Thực thể

- **MyBigNumber**: class lõi, phương thức `sum(stn1: string, stn2: string): string`.
- **Logger**: `(message: string) => void`, inject qua constructor để ghi lịch sử phép toán.

## Quy tắc nghiệp vụ

- Input: chuỗi chỉ gồm ký tự `0-9`. Ký tự khác → ném `Error`.
- Output: chuỗi không có số 0 thừa ở đầu; rỗng → `"0"`.
- Thuật toán cột dọc từ phải sang trái, nhớ `carry` lan truyền.
