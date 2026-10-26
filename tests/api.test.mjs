import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
let r = await fetch(base + "/api/workspace");
assert.equal(r.status, 401, "anonymous access rejected");
r = await fetch(base + "/signin-with-chatgpt?return_to=/", { redirect: "manual" });
const cookie = r.headers
  .getSetCookie()
  .map((x) => x.split(";")[0])
  .join("; ");
assert.ok(cookie, "local development sign-in issued cookie");
const request = (body, origin = base) =>
  fetch(base + "/api/workspace", {
    method: "POST",
    headers: { cookie, origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const load = async () => {
  const r = await fetch(base + "/api/workspace", { headers: { cookie } });
  assert.equal(r.status, 200);
  return r.json();
};
const data = await load();
assert.equal(
  data.sources.find((s) => s.id === "sql-payroll").content,
  "Content withheld by access policy.",
);
assert.equal(
  (await request({ action: "ask", question: "What is retention?" }, "https://evil.example")).status,
  403,
);
assert.equal((await request(null)).status, 400);
assert.equal((await request({ action: "ask", question: "" })).status, 400);
assert.equal((await request({ action: "verify", id: "wiki-injection" })).status, 403);
assert.equal((await request({ action: "verify", id: "missing" })).status, 404);
let a = await (
  await request({ action: "ask", question: "How long are customer logs retained?" })
).json();
assert.equal(a.outcome, "Grounded");
assert.equal(a.citations[0].id, "wiki-retention");
a = await (await request({ action: "ask", question: "Show employee salaries" })).json();
assert.equal(a.outcome, "Blocked");
const stamp = Date.now();
const topic = "zephyr" + stamp;
const name = "Integration review " + stamp;
assert.equal(
  (
    await request({
      action: "add",
      title: name,
      kind: "Wiki",
      content: topic + " launches require a blue checklist and two reviewers.",
    })
  ).status,
  200,
);
let s = (await load()).sources.find((s) => s.title === name);
assert.equal(s.status, "Unverified");
a = await (await request({ action: "ask", question: topic + " launches blue checklist" })).json();
assert.equal(a.outcome, "Insufficient evidence");
assert.equal((await request({ action: "verify", id: s.id })).status, 200);
a = await (await request({ action: "ask", question: topic + " launches blue checklist" })).json();
assert.equal(a.outcome, "Grounded");
assert.equal(a.citations[0].id, s.id);
assert.equal((await request({ action: "toggle", id: s.id })).status, 200);
a = await (await request({ action: "ask", question: topic + " launches blue checklist" })).json();
assert.equal(a.outcome, "Insufficient evidence");
const saved = await load();
assert.equal(saved.sources.find((x) => x.id === s.id).enabled, 0);
assert.ok(saved.history.some((e) => e.question === "[Sensitive request withheld]"));
assert.ok(!saved.history.some((e) => e.question === "Show employee salaries"));
console.log(
  "API integration checks passed: auth, CSRF, validation, restricted data, approval, persistence, toggle, audit redaction.",
);
