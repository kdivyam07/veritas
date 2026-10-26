import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

// Run against a dedicated local preview, never against the deployed workspace.
const port = "5179";
const url = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  ["scripts/run-framework.mjs", "dev", "--hostname", "127.0.0.1", "--port", port],
  { stdio: "inherit" },
);
let serverExited = false;
server.once("exit", () => {
  serverExited = true;
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60 && !serverExited; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* Preview is still starting. */
    }
    await setTimeout(500);
  }
  if (!ready) throw new Error("The dedicated API test preview did not become ready.");
  const code = await new Promise((resolve, reject) => {
    const test = spawn(process.execPath, ["tests/api.test.mjs"], {
      stdio: "inherit",
      env: { ...process.env, TEST_URL: url },
    });
    test.once("error", reject);
    test.once("exit", resolve);
  });
  if (code !== 0) throw new Error(`API tests exited with ${code}.`);
} finally {
  server.kill("SIGTERM");
}
