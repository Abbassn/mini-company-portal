export function validateCreateEmployee(data) {
  const errors = [];

  if (!data.fullName) {
    errors.push("Full name is required");
  }

  if (!data.department) {
    errors.push("Department is required");
  }

  if (!data.jobTitle) {
    errors.push("Job title is required");
  }

  if (data.baseSalary === undefined || Number(data.baseSalary) <= 0) {
    errors.push("Base salary must be greater than 0");
  }

  if (data.marketMidpoint === undefined || Number(data.marketMidpoint) <= 0) {
    errors.push("Market midpoint must be greater than 0");
  }

  if (data.workingDays === undefined || Number(data.workingDays) <= 0) {
    errors.push("Working days must be greater than 0");
  }

  if (data.absentDays === undefined || Number(data.absentDays) < 0) {
    errors.push("Absent days must be 0 or greater");
  }

  return errors;
}