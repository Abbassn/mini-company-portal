import { useParams } from "react-router-dom";

function EmployeeDetailsPage() {
  const { id } = useParams();

  return (
    <section>
      <h2>Employee Details</h2>
      <p>Employee ID from URL: {id}</p>
    </section>
  );
}

export default EmployeeDetailsPage;