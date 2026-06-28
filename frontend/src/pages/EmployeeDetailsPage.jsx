import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEmployeeById } from "../api/employeesApi";

function EmployeeDetailsPage() {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const employeeData = await getEmployeeById(id);

        setEmployee(employeeData);
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load employee.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployee();
  }, [id]);

  if (isLoading) {
    return (
      <section>
        <h2>Employee Details</h2>
        <p>Loading employee...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Employee Details</h2>
        <p>{error}</p>
        <Link to="/employees">Back to employees</Link>
      </section>
    );
  }

  return (
    <section>
      <h2>Employee Details</h2>

      <p>
        <Link to="/employees">Back to employees</Link>
      </p>

      <h3>Basic Info</h3>

      <p>
        <strong>Name:</strong> {employee.full_name}
      </p>

      <p>
        <strong>Department:</strong> {employee.department}
      </p>

      <p>
        <strong>Job Title:</strong> {employee.job_title}
      </p>

      <h3>Salary Info</h3>

      <p>
        <strong>Base Salary:</strong> {employee.base_salary}
      </p>

      <p>
        <strong>Market Midpoint:</strong> {employee.market_midpoint}
      </p>

      <p>
        <strong>Working Days:</strong> {employee.working_days}
      </p>

      <p>
        <strong>Absent Days:</strong> {employee.absent_days}
      </p>

      <h3>Salary Calculation</h3>

      <p>
        <strong>Compa-Ratio:</strong>{" "}
        {employee.salary_calculation?.compaRatio ?? "N/A"}%
      </p>

      <p>
        <strong>Daily Salary:</strong>{" "}
        {employee.salary_calculation?.dailySalary ?? "N/A"}
      </p>

      <p>
        <strong>Deduction:</strong>{" "}
        {employee.salary_calculation?.deduction ?? "N/A"}
      </p>

      <p>
        <strong>Final Salary:</strong>{" "}
        {employee.salary_calculation?.finalSalary ?? "N/A"}
      </p>
    </section>
  );
}

export default EmployeeDetailsPage;