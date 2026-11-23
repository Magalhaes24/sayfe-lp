import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import "./Admin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const siteName = t("seo.siteName") || "AllerCarte";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.adminLogin") || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      // Who is the admin is decided by the Firestore rules, not by this page.
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/analytics");
    } catch (err) {
      console.error("Admin login failed:", err);
      setError("Invalid credentials or account not permitted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login">
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/admin"
        siteName={siteName}
        noindex={Boolean(seo.noindex)}
      />
      <div className="admin-login-card">
        <h2>🔐 Admin Access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </main>
  );
}

export default AdminLogin;
