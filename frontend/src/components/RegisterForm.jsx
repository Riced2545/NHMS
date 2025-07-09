import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function RegisterFormTH() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    const passwordPattern = /^[A-Za-z0-9_-]+$/;
    if (!passwordPattern.test(password)) {
      setError("ห้ามใช้อักษรพิเศษในรหัสผ่าน");
      return;
    }
    try {
      await axios.post("http://localhost:3001/api/register", {
        username,
        password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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
        <h2 className="text-center mb-3" style={{ color: "#3b2566", fontWeight: "bold" }}>สมัครสมาชิก</h2>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              className="form-control"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-danger text-center mb-2">{error}</div>}
          {success && <div className="text-success text-center mb-2">สมัครสำเร็จ! กำลังเปลี่ยนหน้า...</div>}
          <button type="submit" className="btn w-100" style={{ background: "#a78bfa", color: "#fff", fontWeight: "bold" }}
          onClick={() => navigate("/login")}>
           
            สมัครสมาชิก
          </button>
        </form>
        <div className="text-center mt-3">
          <span>มีบัญชีอยู่แล้ว? </span>
          <button
            type="button"
            className="btn btn-link p-0"
            style={{ color: "#7c3aed", textDecoration: "underline" }}
            onClick={() => navigate("/login")}
          >
            เข้าสู่ระบบที่นี่
          </button>
        </div>
      </div>
    </div>
  );
}