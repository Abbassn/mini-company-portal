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
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="muted">
          A quick view of the actions available for your role.
        </p>
      </div>

      {role && <h3>{role} Dashboard</h3>}

      {items.length > 0 ? (
        <div className="grid">
          {items.map((item) => (
            <div className="card" key={item}>
              <h3>{item}</h3>
              <p className="muted">Available from the portal navigation.</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No dashboard options available.</div>
      )}
    </section>
  );
}

export default DashboardPage;
