import { getUser } from "../auth/authStorage";

function DashboardPage() {
  const user = getUser();
  const role = user?.role;

  const dashboardItems = {
    ADMIN: [
      "Manage employees",
      "Create users",
      "Review salary requests",
      "Approve or reject salary reviews",
    ],
    HR: [
      "View and manage employees",
      "Create salary reviews",
      "View salary reviews",
    ],
    EMPLOYEE: ["View profile", "View own salary reviews"],
  };

  const items = dashboardItems[role] || [];

  return (
    <section>
      <h2>Dashboard</h2>

      {role && <h3>{role} Dashboard</h3>}

      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No dashboard options available.</p>
      )}
    </section>
  );
}

export default DashboardPage;
