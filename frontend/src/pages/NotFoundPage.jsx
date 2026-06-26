import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section>
      <h2>Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <Link to="/dashboard">Go to dashboard</Link>
    </section>
  );
}

export default NotFoundPage;