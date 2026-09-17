/** Lõi cộng 2 số lớn (dạng chuỗi) theo thuật toán học sinh tiểu học. */
export type Logger = (message: string) => void;

export class MyBigNumber {
  constructor(private readonly log: Logger = console.log) {}

  sum(stn1: string, stn2: string): string {
    let i = stn1.length - 1;
    let j = stn2.length - 1;
    let carry = 0;
    let reversed = "";
    let step = 1;

    while (i >= 0 || j >= 0 || carry > 0) {
      const d1 = i >= 0 ? stn1.charCodeAt(i) - 48 : 0;
      const d2 = j >= 0 ? stn2.charCodeAt(j) - 48 : 0;
      const total = d1 + d2 + carry;
      const digit = total % 10;
      const newCarry = Math.floor(total / 10);

      this.log(
        `Bước ${step}: Lấy ${d1} cộng với ${d2}` +
          (carry > 0 ? ` cộng với nhớ ${carry}` : ``) +
          ` được ${total}. Lưu ${digit} vào kết quả` +
          (newCarry > 0 ? ` và nhớ ${newCarry}` : `, hết nhớ`) +
          `. Kết quả tạm: "${digit + reversed}".`
      );

      reversed = digit.toString() + reversed;
      carry = newCarry;
      i--;
      j--;
      step++;
    }

    return reversed === "" ? "0" : reversed;
  }
}
