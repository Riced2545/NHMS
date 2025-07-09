import { useNavigate, useLocation } from "react-router-dom";
import "./index.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role_id = localStorage.getItem("role_id");

  // ฟังก์ชันเช็ค active
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        width: "100%",
        background: "#4B2673",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        boxShadow: "0 4px 12px #e5e7eb1a",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/anchor.png" alt="logo" style={{ width: 36, height: 36 }} />
        <span style={{ fontWeight: "bold", fontSize: 22 }}>Naval Base Management System ( NBMS )</span>
      </div>
      <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
        <li
          style={{
            cursor: "pointer",
            borderBottom: isActive("/") ? "3px solid #fff" : "none",
            fontWeight: isActive("/") ? "bold" : "normal",
            color: isActive("/") ? "#ffe066" : "#fff",
          }}
          onClick={() => navigate("/")}
        >
          หน้าหลัก
        </li>
        {role_id === "1" && (
          <li
            style={{
              cursor: "pointer",
              borderBottom: isActive("/addhome") ? "3px solid #fff" : "none",
              fontWeight: isActive("/addhome") ? "bold" : "normal",
              color: isActive("/addhome") ? "#ffe066" : "#fff",
            }}
            onClick={() => navigate("/addhome")}
          >
            เพิ่มบ้านพัก
          </li>
        )}
        <li
          style={{
            cursor: "pointer",
            borderBottom: isActive("/search") ? "3px solid #fff" : "none",
            fontWeight: isActive("/search") ? "bold" : "normal",
            color: isActive("/search") ? "#ffe066" : "#fff",
          }}
          onClick={() => navigate("/search")}
        >
          ค้นหา
        </li>
        {role_id === "1" && (
          <li
            style={{
              cursor: "pointer",
              borderBottom: isActive("/auditlog") ? "3px solid #fff" : "none",
              fontWeight: isActive("/auditlog") ? "bold" : "normal",
              color: isActive("/auditlog") ? "#ffe066" : "#fff",
            }}
            onClick={() => navigate("/auditlog")}
          >
            แสดงประวัติการเข้าพัก
          </li>
        )}
      </ul>
    </nav>
  );
}