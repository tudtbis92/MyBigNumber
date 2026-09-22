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
    let step = 1;
    // Coding rule (Lab): không khai báo biến trong vòng lặp, gán lại mỗi vòng.
    let digit1 = 0;
    let digit2 = 0;
    let total = 0;
    let digit = 0;
    let newCarry = 0;
    // Gom chữ số vào mảng cấp phát sẵn, điền từ cuối về đầu (không reverse).
    // Prepend trực tiếp vào chuỗi mỗi vòng copy cả chuỗi cũ (O(n^2) khi engine
    // phải flatten); mảng điền theo index rồi join một lần ở cuối là O(n).
    const cap = Math.max(stn1.length, stn2.length) + 1;
    const parts: string[] = new Array<string>(cap);
    let pos = cap;
    let prefix = "";

    while (i >= 0 || j >= 0 || carry > 0) {
      digit1 = i >= 0 ? stn1.charCodeAt(i) - CHAR_CODE_ZERO : 0;
      digit2 = j >= 0 ? stn2.charCodeAt(j) - CHAR_CODE_ZERO : 0;
      total = digit1 + digit2 + carry;
      digit = total % 10;
      newCarry = Math.floor(total / 10);

      // Vùng đã điền [pos, cap) vốn MSD-first nên hiển thị không cần đảo.
      // Chi phí dựng chuỗi này gắn với tính năng step-logging.
      prefix = parts.slice(pos).join("");

      this.log(this.formatStep({ step, digit1, digit2, carry, total, digit, newCarry, resultSoFar: prefix }));

      pos--;
      parts[pos] = digit.toString();
      carry = newCarry;
      i--;
      j--;
      step++;
    }

    const result = parts.slice(pos).join("");
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
