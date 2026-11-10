import { promises as fs } from "fs";
import path from "path";
import type { Signup } from "../types";
import type { Store } from "./index";

/** JSON file store for local preview (data/waitlist.json, gitignored). Writes are atomic and serialised. */
export class FileStore implements Store {
  readonly name = "file";
  private file: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(file: string) {
    this.file = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  }

  private async read(): Promise<Signup[]> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  private async write(list: Signup[]) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(list, null, 2));
    await fs.rename(tmp, this.file);
  }

  private lock<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.catch(() => undefined);
    return run;
  }

  async get(id: string) {
    return (await this.read()).find((s) => s.id === id) || null;
  }
  async findByEmail(email: string) {
    const e = email.toLowerCase();
    return (await this.read()).find((s) => s.email === e) || null;
  }
  async list() {
    return this.read();
  }
  put(s: Signup) {
    return this.lock(async () => {
      const list = await this.read();
      const i = list.findIndex((x) => x.id === s.id);
      if (i >= 0) list[i] = s;
      else list.push(s);
      await this.write(list);
    });
  }
  remove(id: string) {
    return this.lock(async () => {
      await this.write((await this.read()).filter((s) => s.id !== id));
    });
  }
}
