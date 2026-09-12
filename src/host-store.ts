import {
  closeSync,
  constants,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join } from "node:path";
import { randomUUID } from "node:crypto";

export class HostError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

/** Private on-disk state; no model-supplied paths or filenames. */
export class HostStore {
  constructor(readonly root: string) {
    if (!isAbsolute(root)) throw new HostError("private_directory_required");
    mkdirSync(root, { recursive: true, mode: 0o700 });
    this.checkDirectory(root);
  }
  private checkDirectory(path: string) {
    const stat = lstatSync(path);
    if (
      !stat.isDirectory() ||
      (stat.mode & 0o077) !== 0 ||
      (process.getuid && stat.uid !== process.getuid())
    )
      throw new HostError("private_directory_required");
  }
  directory(id: string) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      throw new HostError("invalid_purchase_id");
    const path = join(this.root, id);
    const created = mkdirSync(path, { mode: 0o700, recursive: true });
    this.checkDirectory(path);
    if (created) {
      const fd = openSync(this.root, "r");
      try {
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
    }
    return path;
  }
  path(id: string, name: string) {
    return join(this.directory(id), name);
  }
  read<T>(id: string, name: string): T | null {
    const path = this.path(id, name);
    let fd: number;
    try {
      fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw new HostError("private_state_unreadable");
    }
    try {
      const stat = fstatSync(fd);
      if (
        !stat.isFile() ||
        stat.size > 10 * 1024 * 1024 ||
        (stat.mode & 0o077) !== 0
      )
        throw new HostError("private_state_unreadable");
      return JSON.parse(readFileSync(fd, "utf8")) as T;
    } finally {
      closeSync(fd);
    }
  }
  /** Exclusive creation is also the cross-process, one-signature gate. */
  create(id: string, name: string, value: unknown): boolean {
    let fd: number;
    try {
      fd = openSync(this.path(id, name), "wx", 0o600);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
      throw error;
    }
    try {
      writeFileSync(fd, JSON.stringify(value) + "\n");
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    this.sync(id);
    return true;
  }
  write(id: string, name: string, value: unknown) {
    const temporary = `.state-${randomUUID()}.tmp`;
    this.create(id, temporary, value);
    try {
      renameSync(this.path(id, temporary), this.path(id, name));
      this.sync(id);
    } finally {
      try {
        unlinkSync(this.path(id, temporary));
      } catch {
        /* renamed */
      }
    }
  }
  private sync(id: string) {
    const fd = openSync(this.directory(id), "r");
    try {
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  }
}
