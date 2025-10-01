import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/login", { username, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role_id", res.data.role_id); // เพิ่มบรรทัดนี้
        localStorage.setItem("username", res.data.username); // เพิ่มบรรทัดนี้
        onLogin();
        window.location.href = "/dashboard"; // หรือ window.location.reload();
      } else {
        setError("Login failed: " + (res.data.error || "Server error"));
      }
    } catch (err) {
      setError("Login failed: " + (err.response?.data?.error || "Server error"));
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "#f8fafc",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <div className="card shadow p-4" style={{ width: 400, borderRadius: 20 }}>
        <h2 className="text-center mb-3" style={{ color: "#3b2566", fontWeight: "bold" }}>เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="you@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-danger text-center mb-2">{error}</div>}
          <button type="submit" className="btn w-100" style={{ background: "#a78bfa", color: "#fff", fontWeight: "bold" }}>
            เข้าสู่ระบบ
          </button>
        </form>
        <div className="text-center mt-3">
        </div>
      </div>
    </div>
  );
}

// เวลาจะเรียก API ที่ต้อง login
axios.get("http://localhost:3001/api/guests", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") }
});