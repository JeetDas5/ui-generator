import { Pool } from "pg";

export interface VersionMeta {
  id: number;
  createdAt: number;
  codeExcerpt: string;
}

export interface VersionRecord extends VersionMeta {
  code: string;
}

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Version storage will fail.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

let isInitialized = false;

const ensureSchema = async () => {
  if (isInitialized) return;

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS versions (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_versions_created_at ON versions(created_at DESC);
    `);
    isInitialized = true;
  } finally {
    client.release();
  }
};

export const listVersions = async (limit = 50): Promise<VersionMeta[]> => {
  await ensureSchema();
  const res = await pool.query(
    `SELECT id, created_at as "createdAt", substring(code, 1, 140) as "codeExcerpt"
     FROM versions
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return res.rows.map(row => ({
    ...row,
    createdAt: Number(row.createdAt)
  }));
};

export const getVersion = async (id: number): Promise<VersionRecord | null> => {
  await ensureSchema();
  const res = await pool.query(
    `SELECT id, created_at as "createdAt", code, substring(code, 1, 140) as "codeExcerpt"
     FROM versions
     WHERE id = $1`,
    [id]
  );
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    ...row,
    createdAt: Number(row.createdAt)
  };
};

export const getLatestVersion = async (): Promise<VersionRecord | null> => {
  await ensureSchema();
  const res = await pool.query(
    `SELECT id, created_at as "createdAt", code, substring(code, 1, 140) as "codeExcerpt"
     FROM versions
     ORDER BY created_at DESC
     LIMIT 1`
  );
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    ...row,
    createdAt: Number(row.createdAt)
  };
};

export const createVersion = async (code: string): Promise<VersionRecord> => {
  await ensureSchema();
  const now = Date.now();
  const res = await pool.query(
    `INSERT INTO versions (code, created_at)
     VALUES ($1, $2)
     RETURNING id`,
    [code, now]
  );
  
  return {
    id: res.rows[0].id,
    createdAt: now,
    code,
    codeExcerpt: code.slice(0, 140),
  };
};
