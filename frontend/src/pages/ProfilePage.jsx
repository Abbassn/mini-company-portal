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
        <h1>Profile</h1>
        <p>Loading profile...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1>Profile</h1>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Profile</h1>

      <p>
        <strong>Name:</strong> {user.full_name}
      </p>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <p>
        <strong>Role:</strong> {user.role}
      </p>

      <p>
        <strong>Company ID:</strong> {user.company_id}
      </p>
    </section>
  );
}

export default ProfilePage;