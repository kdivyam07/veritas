import test from "node:test";
import assert from "node:assert/strict";
import { readJsonObject, BodyError } from "../lib/request-body.ts";
import { isSameOrigin } from "../lib/request-origin.ts";

const jsonRequest = (text, type = "application/json") =>
  new Request("https://example.com/api/workspace", {
    method: "POST",
    headers: { "content-type": type },
    body: text,
  });
test("JSON objects and content-type parameters are accepted", async () => {
  assert.deepEqual(
    await readJsonObject(jsonRequest('{"action":"ask"}', "application/json; charset=utf-8")),
    { action: "ask" },
  );
});
test("malformed JSON, null and arrays are rejected", async () => {
  for (const body of ["{", "null", "[]", '"hello"'])
    await assert.rejects(
      readJsonObject(jsonRequest(body)),
      (e) => e instanceof BodyError && e.status === 400,
    );
});
test("similar-looking unsupported media types are rejected", async () => {
  await assert.rejects(
    readJsonObject(jsonRequest("{}", "application/json-not-really")),
    (e) => e.status === 415,
  );
});
test("streaming bodies are bounded without a content-length header", async () => {
  let cancelled = false;
  const body = new ReadableStream({
    pull(controller) {
      controller.enqueue(new Uint8Array(16));
    },
    cancel() {
      cancelled = true;
    },
  });
  const req = new Request("https://example.com/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    duplex: "half",
  });
  await assert.rejects(readJsonObject(req, 20), (e) => e.status === 413);
  assert.equal(cancelled, true);
});
test("byte limits include multibyte UTF-8 input", async () => {
  await assert.rejects(
    readJsonObject(jsonRequest('{"text":"हहहहहहहहहह"}'), 30),
    (e) => e.status === 413,
  );
});
test("same-origin checks support Next's normalized loopback URL", () => {
  assert.equal(
    isSameOrigin(
      new Request("http://localhost:5179/api", {
        headers: { origin: "http://127.0.0.1:5179", host: "127.0.0.1:5179" },
      }),
    ),
    true,
  );
});
test("foreign, missing, malformed and insecure origins are rejected", () => {
  for (const origin of ["https://evil.example", "null", "not-a-url", "http://example.com"])
    assert.equal(
      isSameOrigin(
        new Request("https://example.com/api", { headers: { origin, host: "example.com" } }),
      ),
      false,
    );
  assert.equal(isSameOrigin(new Request("https://example.com/api")), false);
});
