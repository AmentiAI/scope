import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy singleton — safe during Next.js builds where DATABASE_URL may not be present
let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle(neon(url), { schema });
}

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

// Named export for convenience — lazily created on first use
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
  apply(_, thisArg, args) {
    return (getDb() as any)(...args);
  },
});

export type DB = ReturnType<typeof createDb>;
export * from "./schema";
