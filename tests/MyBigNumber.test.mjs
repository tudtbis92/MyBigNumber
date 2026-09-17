import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MyBigNumber } from "../dist/MyBigNumber.js";

const silent = new MyBigNumber(() => {});

describe("MyBigNumber.sum (core, Task 1)", () => {
  it('ví dụ trong đề: sum("1234", "897") = "2131"', () => {
    assert.equal(silent.sum("1234", "897"), "2131");
  });

  it('lệch độ dài ngược lại: sum("897", "1234") = "2131"', () => {
    assert.equal(silent.sum("897", "1234"), "2131");
  });

  it('nhớ dây chuyền: sum("999", "1") = "1000"', () => {
    assert.equal(silent.sum("999", "1"), "1000");
  });

  it('đơn giản: sum("9", "9") = "18"', () => {
    assert.equal(silent.sum("9", "9"), "18");
  });

  it('zero: sum("0", "0") = "0"', () => {
    assert.equal(silent.sum("0", "0"), "0");
  });

  it("số rất lớn vượt int/long", () => {
    assert.equal(
      silent.sum("12345678901234567890", "98765432109876543210"),
      "111111111011111111100"
    );
  });

  it("ghi nhận lịch sử phép toán qua logger", () => {
    const logs = [];
    const svc = new MyBigNumber((m) => logs.push(m));
    assert.equal(svc.sum("1234", "897"), "2131");
    assert.equal(logs.length, 4);
    assert.match(logs[0], /Lấy 4 cộng với 7 được 11/);
  });
});
