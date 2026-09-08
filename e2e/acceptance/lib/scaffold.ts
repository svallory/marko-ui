import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { run } from "./proc"

/**
 * Scaffolds the app apps/docs/src/routes/docs/installation tells users to
 * start from: `bun create marko` (Marko 6 + @marko/run), then Tailwind v4
 * wired in by hand — the installation page assumes "a Tailwind v4
 * stylesheet" exists but doesn't scaffold one itself, so this fills the gap
 * the same way a real user following the docs would (@tailwindcss/vite +
 * an `@import "tailwindcss"` entry imported from the root layout).
 */
export async function scaffoldMarkoApp(parentDir: string): Promise<string> {
  const create = await run("bun", ["create", "marko", "my-app"], {
    cwd: parentDir,
    timeoutMs: 120_000,
  })
  if (create.exitCode !== 0) {
    throw new Error(
      `bun create marko failed (exit ${create.exitCode})\n${create.stdout}\n${create.stderr}`
    )
  }
  const appDir = join(parentDir, "my-app")

  await mkdir(join(appDir, "src/styles"), { recursive: true })
  await writeFile(
    join(appDir, "src/styles/globals.css"),
    '@import "tailwindcss";\n'
  )

  const install = await run(
    "bun",
    ["add", "-d", "tailwindcss", "@tailwindcss/vite"],
    { cwd: appDir, timeoutMs: 120_000 }
  )
  if (install.exitCode !== 0) {
    throw new Error(
      `bun add tailwindcss failed (exit ${install.exitCode})\n${install.stderr}`
    )
  }

  await writeFile(
    join(appDir, "vite.config.ts"),
    `import { defineConfig } from "vite"\nimport tailwindcss from "@tailwindcss/vite"\n\nexport default defineConfig({\n  plugins: [tailwindcss()],\n})\n`
  )

  const layoutPath = join(appDir, "src/routes/+layout.marko")
  const layout = await readFile(layoutPath, "utf8")
  await writeFile(
    layoutPath,
    `import "../styles/globals.css";\n${layout}`
  )

  return appDir
}
