// Dev-server launcher with a bigger Node heap.
//
// The Next.js dev compiler farms work out to jest-worker child processes.
// On a long session with many recompiles those workers exhaust their default
// heap and die ("Jest worker encountered N child process exceptions"). Raising
// --max-old-space-size and passing it via NODE_OPTIONS — which child processes
// inherit — gives the workers headroom and keeps the dev server alive.
//
// Usage:
//   node scripts/dev.mjs            → start dev server
//   node scripts/dev.mjs --clean    → delete .next first (fresh build)
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";

if (process.argv.includes("--clean")) {
  rmSync(".next", { recursive: true, force: true });
  console.log("[dev] cleared .next");
}

const HEAP_FLAG = "--max-old-space-size=4096";
const NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ""} ${HEAP_FLAG}`.trim();

const child = spawn("next", ["dev", "--webpack", "-p", "8080"], {
  stdio: "inherit",
  shell: true, // resolve the `next` bin on Windows + posix
  env: { ...process.env, NODE_OPTIONS },
});

child.on("exit", (code) => process.exit(code ?? 0));
