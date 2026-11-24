
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
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
          <span className="auth-eyebrow">JOIN THE EXPERIENCE</span>
          <h1>Create your account.</h1>
          <p>Sign up and start discovering experiences worth remembering.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to homepage
        </Link>
      </div>

      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200"
          alt="Concert experience"
        />
        <div className="auth-image-overlay">
          <span>DISCOVER SOMETHING NEW</span>
          <h2>Find your people. Find your next experience.</h2>
        </div>
      </div>
    </div>
  );
}

export default Signup;
