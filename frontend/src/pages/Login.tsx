import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <CalendarDays size={27} />
          eventra<span>.</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h1>Good to see you again.</h1>
          <p>Log in to discover and book amazing experiences.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to homepage
        </Link>
      </div>

      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200"
          alt="Live event"
        />
        <div className="auth-image-overlay">
          <span>MAKE EVERY MOMENT COUNT</span>
          <h2>Your next unforgettable experience starts here.</h2>
        </div>
      </div>
    </div>
  );
}

export default Login;
