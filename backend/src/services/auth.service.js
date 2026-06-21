import bcrypt from "bcrypt";
import pool from "../config/db.js";

export async function registerCompanyService(data) {
  const { companyName, fullName, email, password } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const companyResult = await client.query(
      `
      INSERT INTO companies (name)
      VALUES ($1)
      RETURNING id, name, created_at
      `,
      [companyName]
    );

    const company = companyResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
      INSERT INTO users (company_id, full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'ADMIN')
      RETURNING id, company_id, full_name, email, role, created_at
      `,
      [company.id, fullName, email.toLowerCase(), passwordHash]
    );

    const admin = userResult.rows[0];

    await client.query("COMMIT");

    return {
      company,
      admin
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}