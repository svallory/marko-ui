import { logger } from "@/src/utils/logger"
import fsExtra from "fs-extra"

export const FILE_BACKUP_SUFFIX = ".bak"

/**
 * Error convention for this module (deliberately one split, not three):
 *
 * - "Nothing to do" is an EXPECTED outcome and is reported by the return
 *   value: `createFileBackup` returns null when there is no file to back
 *   up, `restoreFileBackup`/`deleteFileBackup` return false when there is
 *   no backup present. These are not failures and are never logged.
 * - A filesystem operation that was asked for and FAILED throws. Callers
 *   that can meaningfully continue anyway (only the cleanup paths inside
 *   `withFileBackup`) catch and log at debug level; nothing swallows an
 *   error silently.
 *
 * Previously the module mixed three conventions — false/null returns, a
 * thrown FileBackupError, and a bare `console.error` — and
 * `deleteFileBackup` discarded every error with no trace, so repeated
 * permission failures left stale `.bak` files with nothing in the logs to
 * explain them.
 */
export class FileBackupError extends Error {
  filePath: string

  constructor(filePath: string, options?: { cause?: unknown }) {
    super(`Could not back up ${filePath}.`, options)
    this.name = "FileBackupError"
    this.filePath = filePath
  }
}

export class FileRestoreError extends Error {
  filePath: string

  constructor(filePath: string, options?: { cause?: unknown }) {
    super(`Could not restore the backup of ${filePath}.`, options)
    this.name = "FileRestoreError"
    this.filePath = filePath
  }
}

export class FileBackupCleanupError extends Error {
  filePath: string

  constructor(filePath: string, options?: { cause?: unknown }) {
    super(`Could not delete the backup of ${filePath}.`, options)
    this.name = "FileBackupCleanupError"
    this.filePath = filePath
  }
}

/**
 * Moves `filePath` aside to `filePath.bak`.
 *
 * @returns the backup path, or null when there was no file to back up.
 * @throws FileBackupError when the file exists but could not be moved.
 */
export function createFileBackup(filePath: string): string | null {
  if (!fsExtra.existsSync(filePath)) {
    return null
  }

  const backupPath = `${filePath}${FILE_BACKUP_SUFFIX}`
  try {
    fsExtra.renameSync(filePath, backupPath)
    return backupPath
  } catch (error) {
    throw new FileBackupError(filePath, { cause: error })
  }
}

/**
 * Moves `filePath.bak` back over `filePath`.
 *
 * @returns true when a backup was restored, false when there was none.
 * @throws FileRestoreError when a backup exists but could not be moved back.
 */
export function restoreFileBackup(filePath: string): boolean {
  const backupPath = `${filePath}${FILE_BACKUP_SUFFIX}`

  if (!fsExtra.existsSync(backupPath)) {
    return false
  }

  try {
    fsExtra.renameSync(backupPath, filePath)
    return true
  } catch (error) {
    throw new FileRestoreError(filePath, { cause: error })
  }
}

/**
 * Deletes `filePath.bak`.
 *
 * @returns true when a backup was deleted, false when there was none.
 * @throws FileBackupCleanupError when a backup exists but could not be
 *   deleted. Cleanup callers that must not fail the surrounding operation
 *   catch this and log it — see `withFileBackup`.
 */
export function deleteFileBackup(filePath: string): boolean {
  const backupPath = `${filePath}${FILE_BACKUP_SUFFIX}`

  if (!fsExtra.existsSync(backupPath)) {
    return false
  }

  try {
    fsExtra.unlinkSync(backupPath)
    return true
  } catch (error) {
    throw new FileBackupCleanupError(filePath, { cause: error })
  }
}

/**
 * Runs `task` with `filePath` backed up, restoring it if the task throws.
 *
 * The task's own error is always what propagates — a cleanup failure never
 * masks it, but it is no longer silent either: both cleanup paths log at
 * debug level so a stale `.bak` file has a trail explaining itself.
 */
export async function withFileBackup<T>(
  filePath: string,
  task: () => Promise<T>
) {
  if (!fsExtra.existsSync(filePath)) {
    return task()
  }

  const backupPath = createFileBackup(filePath)

  if (!backupPath) {
    throw new FileBackupError(filePath)
  }

  const restoreBackupOnExit = () => {
    try {
      restoreFileBackup(filePath)
    } catch (error) {
      // Process is already exiting — there is nowhere to propagate to.
      logger.debug(`${String(error)} (cause: ${String((error as Error).cause)})`)
    }
  }

  process.on("exit", restoreBackupOnExit)

  try {
    const result = await task()
    process.removeListener("exit", restoreBackupOnExit)
    cleanUpBackup(filePath)
    return result
  } catch (error) {
    process.removeListener("exit", restoreBackupOnExit)
    try {
      restoreFileBackup(filePath)
    } catch (restoreError) {
      // The task's error is the interesting one — surface the restore
      // failure as a warning (the user's original file is still at
      // `filePath.bak`) and rethrow the original.
      logger.warn(
        `${String(restoreError)} The original file is preserved at ${filePath}${FILE_BACKUP_SUFFIX}.`
      )
    }
    throw error
  }
}

// Best-effort backup removal: a failure here means a stale `.bak` file, not
// a failed operation, so it is logged rather than thrown — but it IS logged.
function cleanUpBackup(filePath: string) {
  try {
    deleteFileBackup(filePath)
  } catch (error) {
    logger.debug(`${String(error)} (cause: ${String((error as Error).cause)})`)
  }
}
