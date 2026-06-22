export function validateCreateSalaryReview(data) {
  const errors = [];

  if (!data.employeeId) {
    errors.push("Employee id is required");
  }

  if (data.proposedSalary === undefined || Number(data.proposedSalary) <= 0) {
    errors.push("Proposed salary must be greater than 0");
  }

  if (!data.reason) {
    errors.push("Reason is required");
  }

  return errors;
}