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
  const [employeeFormData, setEmployeeFormData] = useState({
    userId: "",
    fullName: "",
    department: "",
    jobTitle: "",
    baseSalary: "",
    marketMidpoint: "",
    workingDays: "",
    absentDays: "",
  });

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
      const createdUser = await createUser({
        fullName: userFormData.fullName.trim(),
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
      setEmployeeFormData({
        userId: "",
        fullName: "",
        department: "",
        jobTitle: "",
        baseSalary: "",
        marketMidpoint: "",
        workingDays: "",
        absentDays: "",
      });
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
        <h2>Employees</h2>
        <p>Loading employees...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Employees</h2>

      {successMessage && <p>{successMessage}</p>}

      {errors.length > 0 && (
        <div>
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {canCreateUser && (
        <form onSubmit={handleCreateUser} noValidate>
          <h3>Create User</h3>

          <div>
            <label htmlFor="userFullName">Full Name</label>
            <br />
            <input
              id="userFullName"
              name="fullName"
              type="text"
              value={userFormData.fullName}
              onChange={handleUserFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="userEmail">Email</label>
            <br />
            <input
              id="userEmail"
              name="email"
              type="email"
              value={userFormData.email}
              onChange={handleUserFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="userPassword">Password</label>
            <br />
            <input
              id="userPassword"
              name="password"
              type="password"
              value={userFormData.password}
              onChange={handleUserFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="userRole">Role</label>
            <br />
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

          <br />

          <button type="submit" disabled={isCreatingUser}>
            {isCreatingUser ? "Creating..." : "Create User"}
          </button>
        </form>
      )}

      {canManageEmployees && (
        <form onSubmit={handleCreateEmployee} noValidate>
          <h3>Create Employee Profile</h3>

          <div>
            <label htmlFor="employeeUserId">User ID</label>
            <br />
            <input
              id="employeeUserId"
              name="userId"
              type="number"
              value={employeeFormData.userId}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="employeeFullName">Full Name</label>
            <br />
            <input
              id="employeeFullName"
              name="fullName"
              type="text"
              value={employeeFormData.fullName}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="employeeDepartment">Department</label>
            <br />
            <input
              id="employeeDepartment"
              name="department"
              type="text"
              value={employeeFormData.department}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="employeeJobTitle">Job Title</label>
            <br />
            <input
              id="employeeJobTitle"
              name="jobTitle"
              type="text"
              value={employeeFormData.jobTitle}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="employeeBaseSalary">Base Salary</label>
            <br />
            <input
              id="employeeBaseSalary"
              name="baseSalary"
              type="number"
              value={employeeFormData.baseSalary}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="employeeMarketMidpoint">Market Midpoint</label>
            <br />
            <input
              id="employeeMarketMidpoint"
              name="marketMidpoint"
              type="number"
              value={employeeFormData.marketMidpoint}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="employeeWorkingDays">Working Days</label>
            <br />
            <input
              id="employeeWorkingDays"
              name="workingDays"
              type="number"
              value={employeeFormData.workingDays}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="employeeAbsentDays">Absent Days</label>
            <br />
            <input
              id="employeeAbsentDays"
              name="absentDays"
              type="number"
              value={employeeFormData.absentDays}
              onChange={handleEmployeeFormChange}
              required
            />
          </div>

          <br />

          <button type="submit" disabled={isCreatingEmployee}>
            {isCreatingEmployee ? "Creating..." : "Create Employee Profile"}
          </button>
        </form>
      )}

      <h3>Employee List</h3>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <ul>
          {employees.map((employee) => (
            <li key={employee.id}>
              <strong>
                <Link to={`/employees/${employee.id}`}>
                  {employee.full_name}
                </Link>
              </strong>{" "}
              - {employee.job_title} - {employee.department}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default EmployeesPage;
