import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { saveAuthData } from "../auth/authStorage";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const authData = await loginUser(formData);

      saveAuthData(authData.token, authData.user);

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <h1>Login</h1>
      <p>Sign in to access the company portal.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;