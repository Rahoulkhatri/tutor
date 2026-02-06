import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://localhost:5432/tutorconnect";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
    });
  }
  return pool;
}

export async function query<T = unknown>(
  text: string,
  params?: (string | number | Date | null)[]
): Promise<{ rows: T[]; rowCount: number }> {
  const res = await getPool().query(text, params);
  return { rows: (res.rows as T[]) || [], rowCount: res.rowCount ?? 0 };
}

export async function queryOne<T = unknown>(
  text: string,
  params?: (string | number | Date | null)[]
): Promise<T | null> {
  const { rows } = await query<T>(text, params);
  return rows[0] ?? null;
}
