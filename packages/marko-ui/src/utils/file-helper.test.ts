import os from "os"
import path from "path"
import fs from "fs-extra"
import { afterEach, describe, expect, it, vi } from "vitest"

import { logger } from "@/src/utils/logger"

import {
  FILE_BACKUP_SUFFIX,
  FileBackupCleanupError,
  FileBackupError,
  FileRestoreError,
  createFileBackup,
  deleteFileBackup,
  restoreFileBackup,
  withFileBackup,
} from "./file-helper"

const tempDirs: string[] = []

async function createTempFile() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "marko-ui-file-helper-"))
  tempDirs.push(dir)

  const filePath = path.join(dir, "components.json")
  await fs.writeFile(filePath, '{"style":"before"}\n', "utf8")

  return filePath
}

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)))
})

describe("withFileBackup", () => {
  it("should restore the original file when the task throws", async () => {
    const filePath = await createTempFile()

    await expect(
      withFileBackup(filePath, async () => {
        await fs.writeFile(filePath, '{"style":"after"}\n', "utf8")
        throw new Error("boom")
      })
    ).rejects.toThrow("boom")

    expect(await fs.readFile(filePath, "utf8")).toBe('{"style":"before"}\n')
    expect(await fs.pathExists(`${filePath}${FILE_BACKUP_SUFFIX}`)).toBe(false)
  })

  it("should remove the backup after a successful task", async () => {
    const filePath = await createTempFile()

    await withFileBackup(filePath, async () => {
      await fs.writeFile(filePath, '{"style":"after"}\n', "utf8")
    })

    expect(await fs.readFile(filePath, "utf8")).toBe('{"style":"after"}\n')
    expect(await fs.pathExists(`${filePath}${FILE_BACKUP_SUFFIX}`)).toBe(false)
  })

  it("should abort when backup creation fails", async () => {
    const filePath = await createTempFile()
    const task = vi.fn(async () => {
      await fs.writeFile(filePath, '{"style":"after"}\n', "utf8")
    })
    const renameSyncSpy = vi.spyOn(fs, "renameSync").mockImplementation(() => {
      throw new Error("boom")
    })

    await expect(withFileBackup(filePath, task)).rejects.toThrow(
      FileBackupError
    )

    expect(task).not.toHaveBeenCalled()
    expect(await fs.readFile(filePath, "utf8")).toBe('{"style":"before"}\n')
    expect(await fs.pathExists(`${filePath}${FILE_BACKUP_SUFFIX}`)).toBe(false)

    renameSyncSpy.mockRestore()
  })
})

describe("error conventions", () => {
  it("returns null (not an error) when there is nothing to back up", () => {
    // "Nothing to do" is an expected outcome, reported by the return value.
    expect(createFileBackup("/definitely/not/here.json")).toBeNull()
  })

  it("returns false (not an error) when there is no backup to restore", async () => {
    const filePath = await createTempFile()
    expect(restoreFileBackup(filePath)).toBe(false)
  })

  it("returns false (not an error) when there is no backup to delete", async () => {
    const filePath = await createTempFile()
    expect(deleteFileBackup(filePath)).toBe(false)
  })

  it("throws when a backup that was asked for cannot be created", async () => {
    const filePath = await createTempFile()
    vi.spyOn(fs, "renameSync").mockImplementation(() => {
      throw new Error("EACCES")
    })

    // A requested operation that failed throws, rather than returning null
    // and leaving the caller unable to tell "absent" from "broken".
    expect(() => createFileBackup(filePath)).toThrow(FileBackupError)
  })

  it("throws when an existing backup cannot be restored", async () => {
    const filePath = await createTempFile()
    createFileBackup(filePath)
    vi.spyOn(fs, "renameSync").mockImplementation(() => {
      throw new Error("EACCES")
    })

    expect(() => restoreFileBackup(filePath)).toThrow(FileRestoreError)
  })

  it("throws when an existing backup cannot be deleted", async () => {
    const filePath = await createTempFile()
    createFileBackup(filePath)
    vi.spyOn(fs, "unlinkSync").mockImplementation(() => {
      throw new Error("EACCES")
    })

    expect(() => deleteFileBackup(filePath)).toThrow(FileBackupCleanupError)
  })

  it("logs, rather than silently swallowing, a failed backup cleanup", async () => {
    const filePath = await createTempFile()
    const debug = vi.spyOn(logger, "debug").mockImplementation(() => {})
    vi.spyOn(fs, "unlinkSync").mockImplementation(() => {
      throw new Error("EACCES")
    })

    // The task still succeeds — a stale .bak must not fail the operation —
    // but it no longer vanishes without a trace.
    await expect(withFileBackup(filePath, async () => "ok")).resolves.toBe("ok")
    expect(debug).toHaveBeenCalled()
  })
})
