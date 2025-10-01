import { useState, useEffect } from "react";
import axios from "axios";

export function RegisterFormTH({ open, onClose, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("2");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername("");
      setPassword("");
      setRole("2");
      setError("");
      setSuccess(false);
      axios.get("http://localhost:3001/api/roles")
        .then(res => setRoles(res.data))
        .catch(() => setRoles([
          { id: 2, name: "user" },
          { id: 1, name: "admin" }
        ]));
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordPattern = /^[A-Za-z0-9_-]+$/;
    if (!passwordPattern.test(password)) {
      setError("ห้ามใช้อักษรพิเศษในรหัสผ่าน");
      return;
    }
    try {
      await axios.post("http://localhost:3001/api/register", {
        username,
        password,
        role_id: role
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.18)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: 32, // ปรับ padding ตรงนี้
          minWidth: 420,
          position: "relative"
        }}
      >
        <button
          style={{
            position: "absolute",
            top: 18,
            right: 24,
            background: "transparent",
            border: "none",
            fontSize: 32,
            color: "#6b7280",
            cursor: "pointer",
            zIndex: 10,
            lineHeight: 1
          }}
          aria-label="ปิด"
          onClick={onClose}
        >
          &#10005;
        </button>
        <h2 className="text-center mb-3" style={{ color: "#3b2566", fontWeight: "bold", marginBottom: 24 }}>เพิ่มผู้ใช้งาน</h2>
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
            <label className="form-label">สิทธิ์ของผู้ใช้งาน</label>
            <select
              className="form-control"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name === "admin" ? "Admin" : "User"}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-danger text-center mb-2">{error}</div>}
          {success && <div className="text-success text-center mb-2">สมัครสำเร็จ! กำลังปิดหน้าต่าง...</div>}
          <button type="submit" className="btn w-100" style={{ background: "#a78bfa", color: "#fff", fontWeight: "bold" }}>
            เพิ่มผู้ใช้งาน
          </button>
        </form>
      </div>
    </div>
  );
}