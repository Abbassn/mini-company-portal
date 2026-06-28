import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/authApi";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load profile.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  if (isLoading) {
    return (
      <section>
        <div className="page-header">
          <h1>Profile</h1>
        </div>
        <div className="card">
          <p>Loading profile...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="page-header">
          <h1>Profile</h1>
        </div>
        <div className="alert alert-error">{error}</div>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1>Profile</h1>
        <p className="muted">Your account details for this company portal.</p>
      </div>

      <div className="card">
        <div className="label-value">
          <strong>Name</strong>
          <span>{user.full_name}</span>
        </div>

        <div className="label-value">
          <strong>Email</strong>
          <span>{user.email}</span>
        </div>

        <div className="label-value">
          <strong>Role</strong>
          <span>{user.role}</span>
        </div>

        <div className="label-value">
          <strong>Company ID</strong>
          <span>{user.company_id}</span>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
