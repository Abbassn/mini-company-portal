import pool from "../config/db.js";

function buildReviewCalculation(review) {
  const oldSalary = Number(review.old_salary);
  const proposedSalary = Number(review.proposed_salary);
  const marketMidpoint = Number(review.market_midpoint);

  const increaseAmount = proposedSalary - oldSalary;
  const increasePercent = (increaseAmount / oldSalary) * 100;

  const oldCompaRatio = (oldSalary / marketMidpoint) * 100;
  const proposedCompaRatio = (proposedSalary / marketMidpoint) * 100;

  return {
    increaseAmount: Number(increaseAmount.toFixed(2)),
    increasePercent: Number(increasePercent.toFixed(2)),
    oldCompaRatio: Number(oldCompaRatio.toFixed(2)),
    proposedCompaRatio: Number(proposedCompaRatio.toFixed(2)),
  };
}

function attachReviewCalculation(review) {
  return {
    ...review,
    review_calculation: buildReviewCalculation(review),
  };
}

export async function getSalaryReviewsService(currentUser) {
  const result = await pool.query(
    `
    SELECT
      sr.id,
      sr.company_id,
      sr.employee_id,
      sr.created_by,
      sr.old_salary,
      sr.proposed_salary,
      sr.reason,
      sr.status,
      sr.created_at,
      e.full_name AS employee_name,
      e.department,
      e.job_title,
      e.market_midpoint
    FROM salary_reviews sr
    JOIN employees e ON e.id = sr.employee_id
    WHERE sr.company_id = $1
    ORDER BY sr.created_at DESC
    `,
    [currentUser.companyId]
  );

  return result.rows.map(attachReviewCalculation);
}

export async function createSalaryReviewService(data, currentUser) {
  const { employeeId, proposedSalary, reason } = data;

  const employeeResult = await pool.query(
    `
    SELECT
      id,
      company_id,
      full_name,
      base_salary,
      market_midpoint
    FROM employees
    WHERE id = $1
    AND company_id = $2
    `,
    [employeeId, currentUser.companyId]
  );

  const employee = employeeResult.rows[0];

  if (!employee) {
    const error = new Error("Employee not found in your company");
    error.statusCode = 404;
    throw error;
  }

  const result = await pool.query(
    `
    INSERT INTO salary_reviews (
      company_id,
      employee_id,
      created_by,
      old_salary,
      proposed_salary,
      reason,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
    RETURNING
      id,
      company_id,
      employee_id,
      created_by,
      old_salary,
      proposed_salary,
      reason,
      status,
      created_at
    `,
    [
      currentUser.companyId,
      employee.id,
      currentUser.userId,
      employee.base_salary,
      proposedSalary,
      reason,
    ]
  );

  const review = {
    ...result.rows[0],
    employee_name: employee.full_name,
    market_midpoint: employee.market_midpoint,
  };

  return attachReviewCalculation(review);
}

export async function getMySalaryReviewsService(currentUser) {
  const result = await pool.query(
    `
    SELECT
      sr.id,
      sr.company_id,
      sr.employee_id,
      sr.created_by,
      sr.old_salary,
      sr.proposed_salary,
      sr.reason,
      sr.status,
      sr.created_at,
      e.full_name AS employee_name,
      e.department,
      e.job_title,
      e.market_midpoint
    FROM salary_reviews sr
    JOIN employees e ON e.id = sr.employee_id
    WHERE e.user_id = $1
    AND sr.company_id = $2
    ORDER BY sr.created_at DESC
    `,
    [currentUser.userId, currentUser.companyId]
  );

  return result.rows.map(attachReviewCalculation);
}

export async function approveSalaryReviewService(reviewId, currentUser) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reviewResult = await client.query(
      `
      SELECT
        sr.id,
        sr.company_id,
        sr.employee_id,
        sr.created_by,
        sr.old_salary,
        sr.proposed_salary,
        sr.reason,
        sr.status,
        sr.created_at,
        e.full_name AS employee_name,
        e.department,
        e.job_title,
        e.market_midpoint
      FROM salary_reviews sr
      JOIN employees e ON e.id = sr.employee_id
      WHERE sr.id = $1
      AND sr.company_id = $2
      FOR UPDATE
      `,
      [reviewId, currentUser.companyId]
    );

    const review = reviewResult.rows[0];

    if (!review) {
      const error = new Error("Salary review not found in your company");
      error.statusCode = 404;
      throw error;
    }

    if (review.status !== "PENDING") {
      const error = new Error("Only pending salary reviews can be approved");
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      `
      UPDATE salary_reviews
      SET status = 'APPROVED'
      WHERE id = $1
      AND company_id = $2
      `,
      [reviewId, currentUser.companyId]
    );

    await client.query(
      `
      UPDATE employees
      SET base_salary = $1
      WHERE id = $2
      AND company_id = $3
      `,
      [review.proposed_salary, review.employee_id, currentUser.companyId]
    );

    await client.query("COMMIT");

    return attachReviewCalculation({
      ...review,
      status: "APPROVED",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function rejectSalaryReviewService(reviewId, currentUser) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reviewResult = await client.query(
      `
      SELECT
        sr.id,
        sr.company_id,
        sr.employee_id,
        sr.created_by,
        sr.old_salary,
        sr.proposed_salary,
        sr.reason,
        sr.status,
        sr.created_at,
        e.full_name AS employee_name,
        e.department,
        e.job_title,
        e.market_midpoint
      FROM salary_reviews sr
      JOIN employees e ON e.id = sr.employee_id
      WHERE sr.id = $1
      AND sr.company_id = $2
      FOR UPDATE
      `,
      [reviewId, currentUser.companyId]
    );

    const review = reviewResult.rows[0];

    if (!review) {
      const error = new Error("Salary review not found in your company");
      error.statusCode = 404;
      throw error;
    }

    if (review.status !== "PENDING") {
      const error = new Error("Only pending salary reviews can be rejected");
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      `
      UPDATE salary_reviews
      SET status = 'REJECTED'
      WHERE id = $1
      AND company_id = $2
      `,
      [reviewId, currentUser.companyId]
    );

    await client.query("COMMIT");

    return attachReviewCalculation({
      ...review,
      status: "REJECTED",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}