import bcrypt from "bcrypt";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

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

export async function loginService(data) {
  const { email, password } = data;

  const result = await pool.query(
    `
    SELECT 
      id,
      company_id,
      full_name,
      email,
      password_hash,
      role,
      created_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const tokenPayload = {
    userId: user.id,
    companyId: user.company_id,
    role: user.role,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: user.id,
      company_id: user.company_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
  };
}

export async function getCurrentUserService(userId) {
  const result = await pool.query(
    `
    SELECT
      id,
      company_id,
      full_name,
      email,
      role,
      created_at
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
}