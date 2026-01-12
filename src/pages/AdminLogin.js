import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;

    if (password === adminPassword) {
      localStorage.setItem("isAdminAuthenticated", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <h2>🔐 Admin Access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </main>
  );
}

export default AdminLogin;
