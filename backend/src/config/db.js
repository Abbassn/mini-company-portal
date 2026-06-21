import "./env.js";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function testDbConnection() {
  const result = await pool.query("SELECT NOW()");
  return result.rows[0];
}

export default pool;