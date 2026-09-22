/** Lõi cộng 2 số lớn (dạng chuỗi) theo thuật toán học sinh tiểu học. */
export type Logger = (message: string) => void;

const CHAR_CODE_ZERO = '0'.charCodeAt(0);

interface StepInfo {
  step: number;
  digit1: number;
  digit2: number;
  carry: number;
  total: number;
  digit: number;
  newCarry: number;
  resultSoFar: string;
}

export class MyBigNumber {
  constructor(private readonly log: Logger = console.log) {}

  sum(stn1: string, stn2: string): string {
    if (!/^[0-9]+$/.test(stn1) || !/^[0-9]+$/.test(stn2)) {
      throw new Error(`MyBigNumber.sum chỉ nhận chuỗi số (0-9), nhận được: "${stn1}", "${stn2}".`);
    }

    let i = stn1.length - 1;
    let j = stn2.length - 1;
    let carry = 0;
    let result = "";
    let step = 1;

    while (i >= 0 || j >= 0 || carry > 0) {
      const digit1 = i >= 0 ? stn1.charCodeAt(i) - CHAR_CODE_ZERO : 0;
      const digit2 = j >= 0 ? stn2.charCodeAt(j) - CHAR_CODE_ZERO : 0;
      const total = digit1 + digit2 + carry;
      const digit = total % 10;
      const newCarry = Math.floor(total / 10);

      this.log(this.formatStep({ step, digit1, digit2, carry, total, digit, newCarry, resultSoFar: result }));

      result = digit.toString() + result;
      carry = newCarry;
      i--;
      j--;
      step++;
    }

    return result === "" ? "0" : result;
  }

  private formatStep(info: StepInfo): string {
    return (
      `Bước ${info.step}: Lấy ${info.digit1} cộng với ${info.digit2}` +
      (info.carry > 0 ? ` cộng với nhớ ${info.carry}` : ``) +
      ` được ${info.total}. Lưu ${info.digit} vào kết quả` +
      (info.newCarry > 0 ? ` và nhớ ${info.newCarry}` : `, hết nhớ`) +
      `. Kết quả tạm: "${info.digit + info.resultSoFar}".`
    );
  }
}
