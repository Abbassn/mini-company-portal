import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createEmployee, getEmployees } from "../api/employeesApi";
import { createUser } from "../api/usersApi";
import { getUser } from "../auth/authStorage";

function getErrorMessages(error, fallbackMessage) {
  const backendData = error.response?.data;
  const backendErrors = backendData?.errors;

  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    return backendErrors.map((backendError) => {
      if (typeof backendError === "string") {
        return backendError;
      }

      if (backendError.field && backendError.message) {
        return `${backendError.field}: ${backendError.message}`;
      }

      if (backendError.path && backendError.msg) {
        return `${backendError.path}: ${backendError.msg}`;
      }

      return (
        backendError.message ||
        backendError.msg ||
        JSON.stringify(backendError)
      );
    });
  }

  return [
    backendData?.message ||
      backendData?.error ||
      fallbackMessage ||
      "Something went wrong. Please try again.",
  ];
}

const initialEmployeeFormData = {
  userId: "",
  fullName: "",
  department: "",
  jobTitle: "",
  baseSalary: "",
  marketMidpoint: "",
  workingDays: "22",
  absentDays: "0",
};

function EmployeesPage() {
  const user = getUser();
  const canCreateUser = user?.role === "ADMIN";
  const canManageEmployees = user?.role === "ADMIN" || user?.role === "HR";

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [userFormData, setUserFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });
  const [employeeFormData, setEmployeeFormData] = useState(
    initialEmployeeFormData
  );

  const loadEmployees = useCallback(async () => {
    const employeesData = await getEmployees();

    setEmployees(employeesData);
  }, []);

  useEffect(() => {
    async function fetchEmployees() {
      setIsLoading(true);
      setErrors([]);

      try {
        await loadEmployees();
      } catch (error) {
        setErrors(getErrorMessages(error, "Failed to load employees."));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployees();
  }, [loadEmployees]);

  function handleUserFormChange(event) {
    const { name, value } = event.target;

    setUserFormData({
      ...userFormData,
      [name]: value,
    });
  }

  function handleEmployeeFormChange(event) {
    const { name, value } = event.target;

    setEmployeeFormData({
      ...employeeFormData,
      [name]: value,
    });
  }

  function validateUserForm() {
    const validationErrors = [];

    if (!userFormData.fullName.trim()) {
      validationErrors.push("Full name is required.");
    }

    if (!userFormData.email.trim()) {
      validationErrors.push("Email is required.");
    }

    if (!userFormData.password) {
      validationErrors.push("Password is required.");
    } else if (userFormData.password.length < 6) {
      validationErrors.push("Password must be at least 6 characters.");
    }

    if (!userFormData.role) {
      validationErrors.push("Role is required.");
    } else if (!["HR", "EMPLOYEE"].includes(userFormData.role)) {
      validationErrors.push("Role must be HR or EMPLOYEE.");
    }

    return validationErrors;
  }

  function validateEmployeeForm() {
    const validationErrors = [];
    const userId = Number(employeeFormData.userId);
    const baseSalary = Number(employeeFormData.baseSalary);
    const marketMidpoint = Number(employeeFormData.marketMidpoint);
    const workingDays = Number(employeeFormData.workingDays);
    const absentDays = Number(employeeFormData.absentDays);

    if (!employeeFormData.userId) {
      validationErrors.push("Employee userId is required.");
    } else if (!Number.isInteger(userId) || userId <= 0) {
      validationErrors.push("Employee userId must be a valid user id.");
    }

    if (!employeeFormData.fullName.trim()) {
      validationErrors.push("Full name is required.");
    }

    if (!employeeFormData.department.trim()) {
      validationErrors.push("Department is required.");
    }

    if (!employeeFormData.jobTitle.trim()) {
      validationErrors.push("Job title is required.");
    }

    if (!employeeFormData.baseSalary) {
      validationErrors.push("Base salary is required.");
    } else if (!Number.isFinite(baseSalary) || baseSalary <= 0) {
      validationErrors.push("Base salary must be greater than 0.");
    }

    if (!employeeFormData.marketMidpoint) {
      validationErrors.push("Market midpoint is required.");
    } else if (!Number.isFinite(marketMidpoint) || marketMidpoint <= 0) {
      validationErrors.push("Market midpoint must be greater than 0.");
    }

    if (!employeeFormData.workingDays) {
      validationErrors.push("Working days is required.");
    } else if (!Number.isFinite(workingDays) || workingDays <= 0) {
      validationErrors.push("Working days must be greater than 0.");
    }

    if (employeeFormData.absentDays === "") {
      validationErrors.push("Absent days is required.");
    } else if (!Number.isFinite(absentDays) || absentDays < 0) {
      validationErrors.push("Absent days must be 0 or greater.");
    }

    return validationErrors;
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    const validationErrors = validateUserForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsCreatingUser(true);

    try {
      const submittedFullName = userFormData.fullName.trim();
      const createdUser = await createUser({
        fullName: submittedFullName,
        email: userFormData.email.trim(),
        password: userFormData.password,
        role: userFormData.role,
      });

      setSuccessMessage(`User created successfully. User ID: ${createdUser.id}`);
      setUserFormData({
        fullName: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
      });
      setEmployeeFormData({
        ...employeeFormData,
        userId: String(createdUser.id),
        fullName: createdUser.full_name || createdUser.fullName || submittedFullName,
        workingDays: "22",
        absentDays: "0",
      });
    } catch (error) {
      setErrors(getErrorMessages(error, "Failed to create user."));
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function handleCreateEmployee(event) {
    event.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    const validationErrors = validateEmployeeForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsCreatingEmployee(true);

    try {
      await createEmployee({
        userId: Number(employeeFormData.userId),
        fullName: employeeFormData.fullName.trim(),
        department: employeeFormData.department.trim(),
        jobTitle: employeeFormData.jobTitle.trim(),
        baseSalary: Number(employeeFormData.baseSalary),
        marketMidpoint: Number(employeeFormData.marketMidpoint),
        workingDays: Number(employeeFormData.workingDays),
        absentDays: Number(employeeFormData.absentDays),
      });

      setSuccessMessage("Employee profile created successfully.");
      setEmployeeFormData(initialEmployeeFormData);
      await loadEmployees();
    } catch (error) {
      setErrors(getErrorMessages(error, "Failed to create employee profile."));
    } finally {
      setIsCreatingEmployee(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <div className="page-header">
          <h2>Employees</h2>
        </div>
        <div className="card">
          <p>Loading employees...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h2>Employees</h2>
        <p className="muted">
          Manage company users and employee profiles from one place.
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <p>{successMessage}</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="alert alert-error">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {canManageEmployees && (
        <div className="grid">
          {canCreateUser && (
            <div className="card workflow-card">
              <form onSubmit={handleCreateUser} noValidate>
                <h3>Create User</h3>
                <p className="card-subtitle">
                  Create login accounts for HR or employees.
                </p>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="userFullName">Full Name</label>
                    <input
                      id="userFullName"
                      name="fullName"
                      type="text"
                      value={userFormData.fullName}
                      onChange={handleUserFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="userEmail">Email</label>
                    <input
                      id="userEmail"
                      name="email"
                      type="email"
                      value={userFormData.email}
                      onChange={handleUserFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="userPassword">Password</label>
                    <input
                      id="userPassword"
                      name="password"
                      type="password"
                      value={userFormData.password}
                      onChange={handleUserFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="userRole">Role</label>
                    <select
                      id="userRole"
                      name="role"
                      value={userFormData.role}
                      onChange={handleUserFormChange}
                      required
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="button button-primary"
                  >
                    {isCreatingUser ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card workflow-card">
            <form onSubmit={handleCreateEmployee} noValidate>
              <h3>Create Employee Profile</h3>
              <p className="card-subtitle">
                Attach company profile and salary data to a user.
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="employeeUserId">User ID</label>
                  <input
                    id="employeeUserId"
                    name="userId"
                    type="number"
                    value={employeeFormData.userId}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeFullName">Full Name</label>
                  <input
                    id="employeeFullName"
                    name="fullName"
                    type="text"
                    value={employeeFormData.fullName}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeDepartment">Department</label>
                  <input
                    id="employeeDepartment"
                    name="department"
                    type="text"
                    value={employeeFormData.department}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeJobTitle">Job Title</label>
                  <input
                    id="employeeJobTitle"
                    name="jobTitle"
                    type="text"
                    value={employeeFormData.jobTitle}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeBaseSalary">Base Salary</label>
                  <input
                    id="employeeBaseSalary"
                    name="baseSalary"
                    type="number"
                    value={employeeFormData.baseSalary}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeMarketMidpoint">Market Midpoint</label>
                  <input
                    id="employeeMarketMidpoint"
                    name="marketMidpoint"
                    type="number"
                    value={employeeFormData.marketMidpoint}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeWorkingDays">Working Days</label>
                  <input
                    id="employeeWorkingDays"
                    name="workingDays"
                    type="number"
                    value={employeeFormData.workingDays}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeAbsentDays">Absent Days</label>
                  <input
                    id="employeeAbsentDays"
                    name="absentDays"
                    type="number"
                    value={employeeFormData.absentDays}
                    onChange={handleEmployeeFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isCreatingEmployee}
                  className="button button-primary"
                >
                  {isCreatingEmployee
                    ? "Creating..."
                    : "Create Employee Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Employee List</h3>

        {employees.length === 0 ? (
          <div className="empty-state">No employees found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <Link to={`/employees/${employee.id}`}>
                        {employee.full_name}
                      </Link>
                    </td>
                    <td>{employee.job_title}</td>
                    <td>{employee.department}</td>
                    <td>
                      <Link
                        to={`/employees/${employee.id}`}
                        className="button button-secondary button-small"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default EmployeesPage;
