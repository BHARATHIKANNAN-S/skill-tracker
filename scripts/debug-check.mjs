/**
 * Debug diagnostic script — logs TypeScript error categories to debug ingest.
 * Run: node scripts/debug-check.mjs
 */
import { execSync } from "child_process";
import { appendFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const LOG_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "debug-e9175d.log");
const ENDPOINT = "http://127.0.0.1:7905/ingest/3dafc6f4-03a0-4e86-96ce-99c467efa115";
const SESSION = "e9175d";

function log(hypothesisId, message, data) {
  const entry = JSON.stringify({
    sessionId: SESSION,
    hypothesisId,
    location: "scripts/debug-check.mjs",
    message,
    data,
    timestamp: Date.now(),
    runId: process.env.DEBUG_RUN || "pre-fix",
  });
  try { appendFileSync(LOG_PATH, entry + "\n"); } catch {}
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION },
    body: entry,
  }).catch(() => {});
}

let tscOutput = "";
try {
  execSync("npx tsc --noEmit", { cwd: join(dirname(fileURLToPath(import.meta.url)), ".."), encoding: "utf8" });
  log("ALL", "tsc passed with no errors", { errorCount: 0 });
} catch (e) {
  tscOutput = (e.stdout || "") + (e.stderr || "") + (e.message || "");
  const lines = tscOutput.split("\n").filter((l) => l.includes("error TS"));
  log("A", "StudentData export check", { hasStudentDataError: lines.some((l) => l.includes("StudentData")) });
  log("B", "Zod errors property check", { hasZodErrorsIssue: lines.some((l) => l.includes("Property 'errors'")) });
  log("C", "JWT signToken overload check", { hasJwtSignError: lines.some((l) => l.includes("auth.ts") && l.includes("sign")) });
  log("D", "Prisma include+select check", { hasPrismaSelectError: lines.some((l) => l.includes("select` or `include`")) });
  log("E", "Role type assignment check", { hasRoleTypeError: lines.some((l) => l.includes("Type 'string' is not assignable to type 'Role'")) });
  log("ALL", "tsc summary", { errorCount: lines.length, errors: lines.slice(0, 12) });
  console.log(`Found ${lines.length} TypeScript errors. See debug-e9175d.log`);
  process.exit(1);
}

console.log("No TypeScript errors found.");
process.exit(0);
