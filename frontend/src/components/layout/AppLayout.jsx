import { Link, Outlet, useNavigate } from "react-router-dom";
import { clearAuthData, getUser } from "../../auth/authStorage";

function AppLayout() {
  const navigate = useNavigate();
  const user = getUser();
  const canViewEmployees = user?.role === "ADMIN" || user?.role === "HR";

  function handleLogout() {
    clearAuthData();
    navigate("/login");
  }

  return (
    <div className="app">
      <header className="navbar">
        <h1>Mini Company Portal</h1>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          {canViewEmployees && <Link to="/employees">Employees</Link>}
          <Link to="/salary-reviews">Salary Reviews</Link>
          <Link to="/profile">Profile</Link>

          <button type="button" onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </nav>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
