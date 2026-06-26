import { Link, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="app">
      <header className="navbar">
        <h1>Mini Company Portal</h1>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/employees">Employees</Link>
          <Link to="/salary-reviews">Salary Reviews</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;