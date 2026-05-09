import { spawn } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const prismaClientDir = path.join(repoRoot, "node_modules", ".prisma", "client");
const requiredClientFiles = [
  path.join(prismaClientDir, "index.js"),
  path.join(prismaClientDir, "index.d.ts"),
  path.join(prismaClientDir, "query_engine-windows.dll.node"),
];

function cleanupStaleTempFiles() {
  if (!existsSync(prismaClientDir)) {
    return;
  }

  for (const entry of readdirSync(prismaClientDir)) {
    if (!entry.startsWith("query_engine-windows.dll.node.tmp")) {
      continue;
    }

    try {
      rmSync(path.join(prismaClientDir, entry), { force: true });
    } catch {
      // Best effort only; Windows may still have the temp file open.
    }
  }
}

function hasUsableGeneratedClient() {
  return requiredClientFiles.every((filePath) => existsSync(filePath));
}

function runPrismaGenerate() {
  return new Promise((resolve) => {
    const prismaCliPath = path.join(
      repoRoot,
      "node_modules",
      "prisma",
      "build",
      "index.js",
    );

    const child = spawn(process.execPath, [prismaCliPath, "generate"], {
      cwd: repoRoot,
      shell: false,
      stdio: "inherit",
    });

    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

cleanupStaleTempFiles();

const exitCode = await runPrismaGenerate();

if (exitCode === 0) {
  cleanupStaleTempFiles();
  process.exit(0);
}

if (hasUsableGeneratedClient()) {
  console.warn(
    [
      "",
      "Prisma generate hit a Windows file-lock error, but an existing generated client is available.",
      "Continuing the script so build/dev can proceed.",
      "If this keeps happening, stop any running Next.js/node process that may be holding the Prisma engine file open.",
    ].join("\n"),
  );
  cleanupStaleTempFiles();
  process.exit(0);
}

process.exit(exitCode);
