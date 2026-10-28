export class BodyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Bound bytes while reading, including requests without Content-Length. */
export async function readJsonObject(
  req: Request,
  limit = 30_000,
): Promise<Record<string, unknown>> {
  if (req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new BodyError("JSON required.", 415);
  }
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > limit) throw new BodyError("Request too large.", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new BodyError("A JSON object is required.", 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new BodyError("Request too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new BodyError("Invalid JSON.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new BodyError("A JSON object is required.", 400);
  return body as Record<string, unknown>;
}
