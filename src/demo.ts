import { MyBigNumber } from "./MyBigNumber";

const svc = new MyBigNumber();
const result = svc.sum("1234", "897");
console.log(`Ket qua: 1234 + 897 = ${result}`);
