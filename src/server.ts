/** HTTP layer cho MyBigNumber: Express app mỏng, delegate 100% phép tính cho core. */
import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { MyBigNumber } from "./MyBigNumber.js";

const VERSION = "0.0.2";
const NUMBER_PATTERN = /^[0-9]+$/;

interface SumBody {
  stn1: unknown;
  stn2: unknown;
}

function errorEnvelope(code: string, message: string, details?: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = { code, message };
  if (details !== undefined) {
    body["details"] = details;
  }
  return body;
}

function loadOpenApiDocument(): Record<string, unknown> {
  const candidates = [
    join(process.cwd(), "openapi", "openapi.yaml"),
    join(dirname(fileURLToPath(import.meta.url)), "..", "openapi", "openapi.yaml"),
  ];
  let lastError: unknown = null;
  for (const path of candidates) {
    try {
      return YAML.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Cannot load openapi.yaml");
}

export function createApp(): Express {
  const app = express();
  const openApiDocument = loadOpenApiDocument();

  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", version: VERSION });
  });

  app.get("/openapi.json", (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.post("/api/sum", (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as SumBody | null;
    const stn1 = body !== null && typeof body === "object" && !Array.isArray(body) ? body.stn1 : undefined;
    const stn2 = body !== null && typeof body === "object" && !Array.isArray(body) ? body.stn2 : undefined;
    if (typeof stn1 !== "string" || typeof stn2 !== "string" || !NUMBER_PATTERN.test(stn1) || !NUMBER_PATTERN.test(stn2)) {
      res
        .status(400)
        .json(
          errorEnvelope(
            "INVALID_INPUT",
            `MyBigNumber.sum chỉ nhận chuỗi số (0-9), nhận được: "${String(stn1)}", "${String(stn2)}".`,
            { stn1: stn1, stn2: stn2 },
          ),
        );
      return;
    }
    try {
      const steps: string[] = [];
      const svc = new MyBigNumber((message: string) => {
        steps.push(message);
      });
      const result = svc.sum(stn1, stn2);
      res.json({ result, steps });
    } catch (err) {
      next(err);
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json(errorEnvelope("NOT_FOUND", "Route không tồn tại."));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = typeof err === "object" && err !== null && "status" in err ? (err as { status: unknown }).status : undefined;
    const type = typeof err === "object" && err !== null && "type" in err ? (err as { type: unknown }).type : undefined;
    if (status === 413 || type === "entity.too.large") {
      res.status(413).json(errorEnvelope("PAYLOAD_TOO_LARGE", "Body vượt giới hạn 100kb."));
      return;
    }
    if (err instanceof SyntaxError || status === 400 || type === "entity.parse.failed") {
      res.status(400).json(errorEnvelope("INVALID_JSON", "Body phải là JSON hợp lệ."));
      return;
    }
    if (err instanceof Error && err.message.includes("chỉ nhận chuỗi số")) {
      res.status(400).json(errorEnvelope("INVALID_INPUT", err.message));
      return;
    }
    console.error(err);
    res.status(500).json(errorEnvelope("INTERNAL_ERROR", "Internal Server Error"));
  });

  return app;
}

const entry = process.argv[1] ?? "";
if (entry.endsWith("server.js") || entry.endsWith("server.ts")) {
  const port = Number(process.env["PORT"] ?? 3000);
  createApp().listen(port);
}
