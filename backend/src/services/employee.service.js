import pool from "../config/db.js";
import { attachSalaryCalculation } from "./salary.service.js";

export async function getEmployeesService(currentUser) {
  const result = await pool.query(
    `
    SELECT
      id,
      company_id,
      user_id,
      full_name,
      department,
      job_title,
      base_salary,
      market_midpoint,
      working_days,
      absent_days,
      created_at
    FROM employees
    WHERE company_id = $1
    ORDER BY id ASC
    `,
    [currentUser.companyId]
  );

  return result.rows.map(attachSalaryCalculation);
}

export async function getEmployeeByIdService(employeeId, currentUser) {
  const result = await pool.query(
    `
    SELECT
      id,
      company_id,
      user_id,
      full_name,
      department,
      job_title,
      base_salary,
      market_midpoint,
      working_days,
      absent_days,
      created_at
    FROM employees
    WHERE id = $1
    AND company_id = $2
    `,
    [employeeId, currentUser.companyId]
  );

  const employee = result.rows[0];

  if (!employee) {
    const error = new Error("Employee not found in your company");
    error.statusCode = 404;
    throw error;
  }

  return attachSalaryCalculation(employee);
}

export async function createEmployeeService(data, currentUser) {
  const {
    userId,
    fullName,
    department,
    jobTitle,
    baseSalary,
    marketMidpoint,
    workingDays,
    absentDays,
  } = data;

  if (userId) {
    const userResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      AND company_id = $2
      `,
      [userId, currentUser.companyId]
    );

    const user = userResult.rows[0];

    if (!user) {
      const error = new Error("User account not found in your company");
      error.statusCode = 404;
      throw error;
    }

    if (user.role !== "EMPLOYEE") {
      const error = new Error("Employee profile can only be linked to an EMPLOYEE user");
      error.statusCode = 400;
      throw error;
    }
  }

  const result = await pool.query(
    `
    INSERT INTO employees (
      company_id,
      user_id,
      full_name,
      department,
      job_title,
      base_salary,
      market_midpoint,
      working_days,
      absent_days
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING
      id,
      company_id,
      user_id,
      full_name,
      department,
      job_title,
      base_salary,
      market_midpoint,
      working_days,
      absent_days,
      created_at
    `,
    [
      currentUser.companyId,
      userId || null,
      fullName,
      department,
      jobTitle,
      baseSalary,
      marketMidpoint,
      workingDays,
      absentDays,
    ]
  );

  return attachSalaryCalculation(result.rows[0]);
}

export async function getMyEmployeeProfileService(currentUser) {
  const result = await pool.query(
    `
    SELECT
      id,
      company_id,
      user_id,
      full_name,
      department,
      job_title,
      base_salary,
      market_midpoint,
      working_days,
      absent_days,
      created_at
    FROM employees
    WHERE user_id = $1
    AND company_id = $2
    `,
    [currentUser.userId, currentUser.companyId]
  );

  const employee = result.rows[0];

  if (!employee) {
    const error = new Error("Employee profile not found");
    error.statusCode = 404;
    throw error;
  }

  return attachSalaryCalculation(employee);
}

