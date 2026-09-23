import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../dist/server.js";

let base = "";
let server = null;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;
  base = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(() => resolve()));
});

async function postSum(body) {
  const res = await fetch(`${base}/api/sum`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

describe("HTTP API /api/sum (AC1-AC5)", () => {
  it("AC1: 1234+897=2131 kèm 4 steps", async () => {
    const { status, json } = await postSum({ stn1: "1234", stn2: "897" });
    assert.equal(status, 200);
    assert.equal(json.result, "2131");
    assert.equal(json.steps.length, 4);
    assert.match(json.steps[0], /Lấy 4 cộng với 7 được 11/);
  });

  it("AC2: nhớ dây chuyền 999+1=1000, 0+0=0, 500 chữ số", async () => {
    const r1 = await postSum({ stn1: "999", stn2: "1" });
    assert.equal(r1.json.result, "1000");
    const r2 = await postSum({ stn1: "0", stn2: "0" });
    assert.equal(r2.json.result, "0");
    const r3 = await postSum({ stn1: "9".repeat(500), stn2: "1" });
    assert.equal(r3.json.result, "1" + "0".repeat(500));
  });

  it("AC3: từ chối input lạ theo matrix (400 INVALID_INPUT)", async () => {
    const cases = [
      { stn1: "12a", stn2: "897" },
      { stn1: "", stn2: "897" },
      { stn1: "-12", stn2: "5" },
      { stn1: "12 3", stn2: "5" },
      { stn1: 12, stn2: "5" },
      { stn1: null, stn2: "5" },
      {},
      { stn1: "123" },
    ];
    for (const payload of cases) {
      const { status, json } = await postSum(payload);
      assert.equal(status, 400);
      assert.equal(json.code, "INVALID_INPUT");
      assert.match(json.message, /chỉ nhận chuỗi số/);
    }
  });

  it("AC3b: số 0 ở đầu được chấp nhận (007+003=10)", async () => {
    const { status, json } = await postSum({ stn1: "007", stn2: "003" });
    assert.equal(status, 200);
    assert.equal(json.result, "10");
  });

  it("AC4: JSON vỡ 400 INVALID_JSON, route lạ 404", async () => {
    const broken = await fetch(`${base}/api/sum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{sai json",
    });
    assert.equal(broken.status, 400);
    assert.equal((await broken.json()).code, "INVALID_JSON");

    const missing = await fetch(`${base}/khong-ton-tai`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).code, "NOT_FOUND");
  });

  it("AC5: /openapi.json chứa POST /api/sum, /docs trả HTML, /health ok", async () => {
    const spec = await (await fetch(`${base}/openapi.json`)).json();
    assert.ok(spec.paths["/api/sum"].post);
    assert.ok(spec.paths["/health"].get);
    assert.equal(spec.components.schemas.SumRequest.properties.stn1.pattern, "^[0-9]+$");

    const docs = await fetch(`${base}/docs/`);
    assert.equal(docs.status, 200);
    assert.match(await docs.text(), /swagger/i);

    const health = await (await fetch(`${base}/health`)).json();
    assert.deepEqual(health, { status: "ok", version: "0.0.2" });
  });
});
