import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../api/employeesApi";

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const employeesData = await getEmployees();

        setEmployees(employeesData);
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load employees.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  if (isLoading) {
    return (
      <section>
        <h2>Employees</h2>
        <p>Loading employees...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Employees</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Employees</h2>

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
