export function validateRegisterCompany(data) {
  const errors = [];

  if (!data.companyName || data.companyName.trim() === "") {
    errors.push("Company name is required");
  }

  if (!data.fullName || data.fullName.trim() === "") {
    errors.push("Full name is required");
  }

  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required");
  }

  if (!data.password || data.password.trim() === "") {
    errors.push("Password is required");
  }

  if (data.password && data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
}