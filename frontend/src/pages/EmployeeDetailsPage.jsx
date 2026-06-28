import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEmployeeById, updateEmployee } from "../api/employeesApi";
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

function EmployeeDetailsPage() {
  const { id } = useParams();
  const user = getUser();
  const canUpdateEmployee = user?.role === "ADMIN" || user?.role === "HR";

  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    jobTitle: "",
    marketMidpoint: "",
    workingDays: "",
    absentDays: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const loadEmployee = useCallback(async () => {
    const employeeData = await getEmployeeById(id);

    setEmployee(employeeData);
    setFormData({
      fullName: employeeData.full_name || "",
      department: employeeData.department || "",
      jobTitle: employeeData.job_title || "",
      marketMidpoint: employeeData.market_midpoint || "",
      workingDays: employeeData.working_days || "",
      absentDays: employeeData.absent_days ?? "",
    });
  }, [id]);

  useEffect(() => {
    async function fetchEmployee() {
      setIsLoading(true);
      setErrors([]);

      try {
        await loadEmployee();
      } catch (error) {
        setErrors(getErrorMessages(error, "Failed to load employee."));
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployee();
  }, [loadEmployee]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function validateUpdateForm() {
    const validationErrors = [];
    const marketMidpoint = Number(formData.marketMidpoint);
    const workingDays = Number(formData.workingDays);
    const absentDays = Number(formData.absentDays);

    if (!formData.fullName.trim()) {
      validationErrors.push("Full name cannot be empty.");
    }

    if (!formData.department.trim()) {
      validationErrors.push("Department cannot be empty.");
    }

    if (!formData.jobTitle.trim()) {
      validationErrors.push("Job title cannot be empty.");
    }

    if (!formData.marketMidpoint) {
      validationErrors.push("Market midpoint is required.");
    } else if (!Number.isFinite(marketMidpoint) || marketMidpoint <= 0) {
      validationErrors.push("Market midpoint must be greater than 0.");
    }

    if (!formData.workingDays) {
      validationErrors.push("Working days is required.");
    } else if (!Number.isFinite(workingDays) || workingDays <= 0) {
      validationErrors.push("Working days must be greater than 0.");
    }

    if (formData.absentDays === "") {
      validationErrors.push("Absent days is required.");
    } else if (!Number.isFinite(absentDays) || absentDays < 0) {
      validationErrors.push("Absent days must be 0 or greater.");
    }

    return validationErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    const validationErrors = validateUpdateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEmployee(id, {
        fullName: formData.fullName.trim(),
        department: formData.department.trim(),
        jobTitle: formData.jobTitle.trim(),
        marketMidpoint: Number(formData.marketMidpoint),
        workingDays: Number(formData.workingDays),
        absentDays: Number(formData.absentDays),
      });

      setSuccessMessage("Employee profile updated successfully.");
      await loadEmployee();
    } catch (error) {
      setErrors(getErrorMessages(error, "Failed to update employee."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <div className="page-header">
          <h2>Employee Details</h2>
        </div>
        <div className="card">
          <p>Loading employee...</p>
        </div>
      </section>
    );
  }

  if (!employee) {
    return (
      <section>
        <div className="page-header">
          <h2>Employee Details</h2>
        </div>
        {errors.length > 0 && (
          <div className="alert alert-error">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        <Link to="/employees" className="button button-secondary">
          Back to employees
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h2>Employee Details</h2>
        <p>
          <Link to="/employees" className="button button-secondary">
            Back to employees
          </Link>
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

      <div className="grid detail-grid">
        <div className="card">
          <h3>Basic Info</h3>

          <div className="label-value">
            <strong>Name</strong>
            <span>{employee.full_name}</span>
          </div>

          <div className="label-value">
            <strong>Department</strong>
            <span>{employee.department}</span>
          </div>

          <div className="label-value">
            <strong>Job Title</strong>
            <span>{employee.job_title}</span>
          </div>
        </div>

        <div className="card">
          <h3>Salary Info</h3>

          <div className="label-value">
            <strong>Base Salary</strong>
            <span>{employee.base_salary}</span>
          </div>

          <div className="label-value">
            <strong>Market Midpoint</strong>
            <span>{employee.market_midpoint}</span>
          </div>

          <div className="label-value">
            <strong>Working Days</strong>
            <span>{employee.working_days}</span>
          </div>

          <div className="label-value">
            <strong>Absent Days</strong>
            <span>{employee.absent_days}</span>
          </div>
        </div>

        <div className="card">
          <h3>Salary Calculation</h3>

          <div className="label-value">
            <strong>Compa-Ratio</strong>
            <span>{employee.salary_calculation?.compaRatio ?? "N/A"}%</span>
          </div>

          <div className="label-value">
            <strong>Daily Salary</strong>
            <span>{employee.salary_calculation?.dailySalary ?? "N/A"}</span>
          </div>

          <div className="label-value">
            <strong>Deduction</strong>
            <span>{employee.salary_calculation?.deduction ?? "N/A"}</span>
          </div>

          <div className="label-value">
            <strong>Final Salary</strong>
            <span>{employee.salary_calculation?.finalSalary ?? "N/A"}</span>
          </div>
        </div>
      </div>

      {canUpdateEmployee && (
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <h3>Update Employee Profile</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="marketMidpoint">Market Midpoint</label>
                <input
                  id="marketMidpoint"
                  name="marketMidpoint"
                  type="number"
                  value={formData.marketMidpoint}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="workingDays">Working Days</label>
                <input
                  id="workingDays"
                  name="workingDays"
                  type="number"
                  value={formData.workingDays}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="absentDays">Absent Days</label>
                <input
                  id="absentDays"
                  name="absentDays"
                  type="number"
                  value={formData.absentDays}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={isSubmitting}
                className="button button-primary"
              >
                {isSubmitting ? "Updating..." : "Update Employee Profile"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default EmployeeDetailsPage;
