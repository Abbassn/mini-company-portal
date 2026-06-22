export function validateCreateUser(data) {
  const errors = [];

  if (!data.fullName) {
    errors.push("Full name is required");
  }

  if (!data.email) {
    errors.push("Email is required");
  }

  if (!data.password) {
    errors.push("Password is required");
  }

  if (data.password && data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (!data.role) {
    errors.push("Role is required");
  }

  const allowedRoles = ["HR", "EMPLOYEE"];

  if (data.role && !allowedRoles.includes(data.role)) {
    errors.push("Admin can only create HR or EMPLOYEE users");
  }

  return errors;
}