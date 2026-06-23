export function validateCreateEmployee(data) {
  const errors = [];

  if (data.user_id !== undefined) {
    errors.push("Use userId, not user_id");
  }

  if (data.userId === undefined || data.userId === null || data.userId === "") {
    errors.push("Employee userId is required");
  }

  if (
    data.userId !== undefined &&
    data.userId !== null &&
    data.userId !== "" &&
    (!Number.isInteger(Number(data.userId)) || Number(data.userId) <= 0)
  ) {
    errors.push("Employee userId must be a valid user id");
  }

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

export function validateUpdateEmployee(data) {
  const errors = [];

  const allowedFields = [
    "fullName",
    "department",
    "jobTitle",
    "marketMidpoint",
    "workingDays",
    "absentDays",
  ];

  const hasAtLeastOneField = allowedFields.some(
    (field) => data[field] !== undefined
  );

  if (!hasAtLeastOneField) {
    errors.push("At least one field is required to update");
  }

  if (data.baseSalary !== undefined) {
    errors.push("Base salary cannot be updated directly. Use salary review flow");
  }

  if (data.userId !== undefined) {
    errors.push("User account link cannot be updated from this endpoint");
  }

  if (data.fullName !== undefined && data.fullName.trim() === "") {
    errors.push("Full name cannot be empty");
  }

  if (data.department !== undefined && data.department.trim() === "") {
    errors.push("Department cannot be empty");
  }

  if (data.jobTitle !== undefined && data.jobTitle.trim() === "") {
    errors.push("Job title cannot be empty");
  }

  if (data.marketMidpoint !== undefined && Number(data.marketMidpoint) <= 0) {
    errors.push("Market midpoint must be greater than 0");
  }

  if (data.workingDays !== undefined && Number(data.workingDays) <= 0) {
    errors.push("Working days must be greater than 0");
  }

  if (data.absentDays !== undefined && Number(data.absentDays) < 0) {
    errors.push("Absent days must be 0 or greater");
  }

  return errors;
}
