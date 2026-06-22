import bcrypt from "bcrypt";
import pool from "../config/db.js";

export async function createUserService(data, currentUser) {
  const { fullName, email, password, role } = data;

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (
      company_id,
      full_name,
      email,
      password_hash,
      role
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      company_id,
      full_name,
      email,
      role,
      created_at
    `,
    [
      currentUser.companyId,
      fullName,
      email,
      passwordHash,
      role,
    ]
  );

  return result.rows[0];
}