import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section>
      <div className="card">
        <h2>Page Not Found</h2>
        <p className="muted">The page you requested does not exist.</p>
        <Link to="/dashboard" className="button button-primary">
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
