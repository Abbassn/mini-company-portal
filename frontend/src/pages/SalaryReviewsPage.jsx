import { useCallback, useEffect, useState } from "react";
import { getEmployees } from "../api/employeesApi";
import {
  approveSalaryReview,
  createSalaryReview,
  getMySalaryReviews,
  getSalaryReviews,
  rejectSalaryReview,
} from "../api/salaryReviewsApi";
import { getUser } from "../auth/authStorage";

function getErrorMessages(error) {
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
      "Something went wrong. Please try again.",
  ];
}

function getStatusBadgeClass(status) {
  if (status === "APPROVED") {
    return "badge badge-approved";
  }

  if (status === "REJECTED") {
    return "badge badge-rejected";
  }

  return "badge badge-pending";
}

function SalaryReviewsPage() {
  const user = getUser();
  const role = user?.role;
  const canCreateReview = role === "ADMIN" || role === "HR";
  const canApproveOrReject = role === "ADMIN";

  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    proposedSalary: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const loadSalaryReviews = useCallback(async () => {
    if (role === "EMPLOYEE") {
      const reviewData = await getMySalaryReviews();

      setReviews(reviewData);
      return;
    }

    if (role === "ADMIN" || role === "HR") {
      const reviewData = await getSalaryReviews();

      setReviews(reviewData);
      return;
    }

    setReviews([]);
  }, [role]);

  useEffect(() => {
    async function loadPageData() {
      setIsLoading(true);
      setErrors([]);
      setMessage("");

      try {
        await loadSalaryReviews();

        if (canCreateReview) {
          const employeeData = await getEmployees();

          setEmployees(employeeData);
        }
      } catch (error) {
        setErrors(getErrorMessages(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, [canCreateReview, loadSalaryReviews]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrors([]);
    setMessage("");

    const proposedSalary = Number(formData.proposedSalary);
    const employeeId = Number(formData.employeeId);
    const reason = formData.reason.trim();
    const validationErrors = [];

    if (!formData.employeeId) {
      validationErrors.push("Employee is required.");
    } else if (!Number.isFinite(employeeId) || employeeId <= 0) {
      validationErrors.push("Employee must be valid.");
    }

    if (!formData.proposedSalary) {
      validationErrors.push("Proposed salary is required.");
    } else if (!Number.isFinite(proposedSalary) || proposedSalary <= 0) {
      validationErrors.push("Proposed salary must be greater than 0.");
    }

    if (!reason) {
      validationErrors.push("Reason is required.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await createSalaryReview({
        employeeId,
        proposedSalary,
        reason,
      });

      setMessage("Salary review created successfully.");
      setFormData({
        employeeId: "",
        proposedSalary: "",
        reason: "",
      });
      await loadSalaryReviews();
    } catch (error) {
      setErrors(getErrorMessages(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApprove(id) {
    setErrors([]);
    setMessage("");

    try {
      await approveSalaryReview(id);
      setMessage("Salary review approved successfully.");
      await loadSalaryReviews();
    } catch (error) {
      setErrors(getErrorMessages(error));
    }
  }

  async function handleReject(id) {
    setErrors([]);
    setMessage("");

    try {
      await rejectSalaryReview(id);
      setMessage("Salary review rejected successfully.");
      await loadSalaryReviews();
    } catch (error) {
      setErrors(getErrorMessages(error));
    }
  }

  if (isLoading) {
    return (
      <section>
        <div className="page-header">
          <h2>Salary Reviews</h2>
        </div>
        <div className="card">
          <p>Loading salary reviews...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h2>Salary Reviews</h2>
        <p className="muted">
          Review proposed salary changes and track approval status.
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          <p>{message}</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="alert alert-error">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {canCreateReview && (
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <h3>Create Salary Review</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="employeeId">Employee</label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="proposedSalary">Proposed Salary</label>
                <input
                  id="proposedSalary"
                  name="proposedSalary"
                  type="number"
                  value={formData.proposedSalary}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
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
                {isSubmitting ? "Creating..." : "Create Salary Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Reviews</h3>

        {reviews.length === 0 ? (
          <div className="empty-state">No salary reviews found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Job Title</th>
                  <th>Old Salary</th>
                  <th>Proposed Salary</th>
                  <th>Increase %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <strong>{review.employee_name}</strong>
                      <br />
                      <span className="muted">{review.department}</span>
                    </td>
                    <td>{review.job_title}</td>
                    <td className="number-cell">{review.old_salary}</td>
                    <td className="number-cell">{review.proposed_salary}</td>
                    <td className="number-cell">
                      {review.review_calculation?.increasePercent ?? "N/A"}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(review.status)}>
                        {review.status}
                      </span>
                    </td>
                    <td>
                      {canApproveOrReject && review.status === "PENDING" ? (
                        <div className="actions">
                          <button
                            type="button"
                            onClick={() => handleApprove(review.id)}
                            className="button button-primary button-small"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(review.id)}
                            className="button button-danger button-small"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="muted">No actions</span>
                      )}
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

export default SalaryReviewsPage;
