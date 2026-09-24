/** Production entry: wires core + store + API keys, then listens. */

import { MyBigNumber } from "./MyBigNumber.js";
import { InMemoryStore } from "./store.js";
import { createApp } from "./server.js";

const port = Number(process.env.PORT ?? "8080");
const apiKeys = new Set((process.env.API_KEYS ?? "dev-key").split(",").map((key) => key.trim()));

const app = createApp({
  calculator: new MyBigNumber(),
  store: new InMemoryStore(),
  apiKeys,
});

app.listen(port, () => {
  console.log(`MyBigNumber API listening on :${port}`);
});
