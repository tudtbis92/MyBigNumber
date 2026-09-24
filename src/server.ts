/** HTTP layer over MyBigNumber core. Implements docs/api-spec.yaml. Zero runtime deps. */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { MyBigNumber, type Logger } from "./MyBigNumber.js";
import { InMemoryStore, type UsageStatus } from "./store.js";

export interface AppDeps {
  calculator: MyBigNumber;
  store: InMemoryStore;
  apiKeys: Set<string>;
  log?: Logger;
}

const DIGIT_RE = /^[0-9]+$/;
const MAX_LIMIT = 200;
const RATE_PER_MINUTE = 60;

interface RateBucket {
  count: number;
  resetAt: number;
}

function problem(status: number, title: string, detail: string): Record<string, unknown> {
  return {
    type: `https://api.example.com/problems/${title.toLowerCase().replace(/ /g, "-")}`,
    title,
    status,
    detail,
  };
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/problem+json" });
  res.end(payload);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

export function createApp(deps: AppDeps): Server {
  const log = deps.log ?? (() => {});
  const rates = new Map<string, RateBucket>();

  return createServer((req, res) => {
    void handle(req, res).catch(() => {
      send(res, 500, problem(500, "Internal Error", "Unexpected failure"));
    });

    async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
      const url = new URL(req.url ?? "/", "http://localhost");
      const key = req.headers["x-api-key"];
      const clientId = Array.isArray(key) ? key[0] : (key ?? "anonymous");
      if (!deps.apiKeys.has(clientId)) {
        send(res, 401, problem(401, "Unauthorized", "Missing or invalid API key"));
        return;
      }
      const now = Date.now();
      const bucket = rates.get(clientId);
      if (bucket !== undefined && bucket.resetAt > now) {
        if (bucket.count >= RATE_PER_MINUTE) {
          send(res, 429, problem(429, "Too Many Requests", "Rate limit exceeded"));
          return;
        }
        bucket.count += 1;
      } else {
        rates.set(clientId, { count: 1, resetAt: now + 60000 });
      }

      if (req.method === "POST" && url.pathname === "/v1/add") {
        await handleAdd(req, res, clientId);
        return;
      }
      if (req.method === "GET" && url.pathname.startsWith("/v1/computations/")) {
        const requestId = url.pathname.slice("/v1/computations/".length);
        const record = deps.store.get(requestId);
        if (record === undefined) {
          send(res, 404, problem(404, "Not Found", "Unknown requestId"));
          return;
        }
        send(res, 200, record);
        return;
      }
      if (req.method === "GET" && url.pathname === "/v1/usage") {
        const statusParam = url.searchParams.get("status");
        const limitRaw = Number(url.searchParams.get("limit") ?? "50");
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), MAX_LIMIT) : 50;
        const status = statusParam === "COMPUTED" || statusParam === "REJECTED" ? (statusParam as UsageStatus) : undefined;
        const items = deps.store.list({ clientId: url.searchParams.get("clientId") ?? undefined, status, limit });
        send(res, 200, { items });
        return;
      }
      send(res, 404, problem(404, "Not Found", "Unknown route"));
    }

    async function handleAdd(req: IncomingMessage, res: ServerResponse, clientId: string): Promise<void> {
      const started = Date.now();
      let raw: string;
      try {
        raw = await readBody(req);
      } catch {
        send(res, 400, problem(400, "Bad Request", "Cannot read request body"));
        return;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        send(res, 400, problem(400, "Bad Request", "Malformed JSON body"));
        return;
      }
      const body = parsed as { a?: unknown; b?: unknown };
      if (typeof body.a !== "string" || typeof body.b !== "string" || !DIGIT_RE.test(body.a) || !DIGIT_RE.test(body.b)) {
        reject(clientId, started, "Non-digit input");
        send(res, 422, problem(422, "Unprocessable Entity", "a and b must be non-empty digit strings"));
        return;
      }
      let result: string;
      try {
        result = deps.calculator.sum(body.a, body.b);
      } catch (err) {
        reject(clientId, started, err instanceof Error ? err.message : "sum failed");
        send(res, 422, problem(422, "Unprocessable Entity", "Invalid operands"));
        return;
      }
      const requestId = randomUUID();
      deps.store.save({
        requestId,
        clientId,
        inputDigits: body.a.length + body.b.length,
        durationMs: Date.now() - started,
        status: "COMPUTED",
        createdAt: new Date().toISOString(),
      });
      log(`add ok requestId=${requestId}`);
      send(res, 201, { result, requestId });
    }

    function reject(clientId: string, started: number, reason: string): void {
      deps.store.save({
        requestId: randomUUID(),
        clientId,
        inputDigits: 0,
        durationMs: Date.now() - started,
        status: "REJECTED",
        createdAt: new Date().toISOString(),
      });
      log(`add rejected reason=${reason}`);
    }
  });
}
