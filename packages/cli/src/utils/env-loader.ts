import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { logger } from "@/src/utils/logger"
import { parseEnvContent } from "@/src/utils/env-helpers"

/**
 * Load .env files into process.env (never overriding existing values).
 *
 * Upstream shadcn used @dotenvx/dotenvx here; a plain parse via
 * env-helpers keeps the dependency tree small and the behavior identical
 * for the simple KEY=value files registries rely on (auth tokens for
 * private registries).
 */
export async function loadEnvFiles(
  cwd: string = process.cwd(),
  options: {
    processEnv?: NodeJS.ProcessEnv
  } = {}
): Promise<NodeJS.ProcessEnv> {
  const processEnv = options.processEnv ?? process.env

  try {
    const envFiles = [
      ".env.local",
      ".env.development.local",
      ".env.development",
      ".env",
    ]

    for (const envFile of envFiles) {
      const envPath = join(cwd, envFile)
      if (!existsSync(envPath)) {
        continue
      }

      const variables = parseEnvContent(readFileSync(envPath, "utf-8"))
      for (const [key, value] of Object.entries(variables)) {
        if (!(key in processEnv)) {
          processEnv[key] = value
        }
      }
    }
  } catch (error) {
    logger.warn("Failed to load env files:", error)
  }

  return processEnv
}
