import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { MyBigNumber } from "../dist/MyBigNumber.js";
import { InMemoryStore } from "../dist/store.js";
import { createApp } from "../dist/server.js";

const KEY = "test-key";
let base;
let server;

before(async () => {
  const app = createApp({
    calculator: new MyBigNumber(() => {}),
    store: new InMemoryStore(),
    apiKeys: new Set([KEY]),
    log: () => {},
  });
  await new Promise((resolve) => server = app.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

function req(path, options = {}) {
  return fetch(base + path, {
    ...options,
    headers: { "x-api-key": KEY, "content-type": "application/json", ...(options.headers ?? {}) },
  });
}

describe("API (Lab 3.2 slices)", () => {
  it("slice 1: POST /v1/add returns 201 + result", async () => {
    const res = await req("/v1/add", { method: "POST", body: JSON.stringify({ a: "1234", b: "897" }) });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.result, "2131");
    assert.match(body.requestId, /^[0-9a-f-]{36}$/);
  });

  it("slice 1: non-digit input returns 422 Problem Details", async () => {
    const res = await req("/v1/add", { method: "POST", body: JSON.stringify({ a: "12a", b: "1" }) });
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.title, "Unprocessable Entity");
    assert.equal(body.status, 422);
  });

  it("slice 1: malformed JSON returns 400", async () => {
    const res = await req("/v1/add", { method: "POST", body: "{oops" });
    assert.equal(res.status, 400);
  });

  it("auth: missing key returns 401", async () => {
    const res = await fetch(base + "/v1/add", { method: "POST", body: "{}" });
    assert.equal(res.status, 401);
  });

  it("slice 2: GET by requestId returns record, unknown returns 404", async () => {
    const created = await (await req("/v1/add", { method: "POST", body: JSON.stringify({ a: "9", b: "9" }) })).json();
    const found = await req(`/v1/computations/${created.requestId}`);
    assert.equal(found.status, 200);
    assert.equal((await found.json()).status, "COMPUTED");
    const missing = await req("/v1/computations/00000000-0000-0000-0000-000000000000");
    assert.equal(missing.status, 404);
  });

  it("slice 3: GET /v1/usage lists and filters by status", async () => {
    const res = await req("/v1/usage?status=COMPUTED&limit=10");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.items));
    assert.ok(body.items.length >= 2);
    assert.ok(body.items.every((item) => item.status === "COMPUTED"));
  });
});
