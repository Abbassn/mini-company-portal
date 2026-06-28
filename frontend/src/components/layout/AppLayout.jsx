import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <h1>Mini Company Portal</h1>
            <p>People operations dashboard</p>
          </div>
        </div>

        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          {canViewEmployees && <NavLink to="/employees">Employees</NavLink>}
          <NavLink to="/salary-reviews">Salary Reviews</NavLink>
          <NavLink to="/profile">Profile</NavLink>

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
