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
        <h2>Salary Reviews</h2>
        <p>Loading salary reviews...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Salary Reviews</h2>

      {message && <p>{message}</p>}

      {errors.length > 0 && (
        <div>
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {canCreateReview && (
        <form onSubmit={handleSubmit} noValidate>
          <h3>Create Salary Review</h3>

          <div>
            <label htmlFor="employeeId">Employee</label>
            <br />
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

          <br />

          <div>
            <label htmlFor="proposedSalary">Proposed Salary</label>
            <br />
            <input
              id="proposedSalary"
              name="proposedSalary"
              type="number"
              value={formData.proposedSalary}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="reason">Reason</label>
            <br />
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Salary Review"}
          </button>
        </form>
      )}

      <h3>Reviews</h3>

      {reviews.length === 0 ? (
        <p>No salary reviews found.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <p>
                <strong>Employee:</strong> {review.employee_name}
              </p>
              <p>
                <strong>Department:</strong> {review.department}
              </p>
              <p>
                <strong>Job Title:</strong> {review.job_title}
              </p>
              <p>
                <strong>Old Salary:</strong> {review.old_salary}
              </p>
              <p>
                <strong>Proposed Salary:</strong> {review.proposed_salary}
              </p>
              <p>
                <strong>Reason:</strong> {review.reason}
              </p>
              <p>
                <strong>Status:</strong> {review.status}
              </p>
              <p>
                <strong>Created At:</strong> {review.created_at}
              </p>
              <p>
                <strong>Increase Amount:</strong>{" "}
                {review.review_calculation?.increaseAmount}
              </p>
              <p>
                <strong>Increase Percent:</strong>{" "}
                {review.review_calculation?.increasePercent}
              </p>
              <p>
                <strong>Old Compa Ratio:</strong>{" "}
                {review.review_calculation?.oldCompaRatio}
              </p>
              <p>
                <strong>Proposed Compa Ratio:</strong>{" "}
                {review.review_calculation?.proposedCompaRatio}
              </p>

              {canApproveOrReject && review.status === "PENDING" && (
                <div>
                  <button
                    type="button"
                    onClick={() => handleApprove(review.id)}
                  >
                    Approve
                  </button>{" "}
                  <button type="button" onClick={() => handleReject(review.id)}>
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SalaryReviewsPage;
