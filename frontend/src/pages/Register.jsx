import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Confirm password must match password");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage(data.message || "Registration successful");
      navigate("/dashboard");
    } catch (err) {
      const payload = err.response?.data;
      const msg = payload?.message || "Registration failed";
      const details = Array.isArray(payload?.details) ? payload.details.join("\n") : "";
      setError(details ? `${msg}\n${details}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Register</h1>
        <p className="muted">Create your account to manage tasks.</p>
        <form onSubmit={onSubmit} className="form">
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
            />
          </label>
          <p className="muted">
            Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
          </p>
          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={onChange}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
