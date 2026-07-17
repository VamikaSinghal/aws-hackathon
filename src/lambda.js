import { createAdaptiveHealthApp } from "./app.js";

export async function handler(event = {}) {
  const app = createAdaptiveHealthApp();
  const shouldReset = Boolean(event.reset);

  if (shouldReset) {
    await app.reset();
  }

  const result = await app.advanceDay();

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result)
  };
}

