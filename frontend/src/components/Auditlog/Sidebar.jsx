import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Navbar() {
  const navigate = useNavigate();
  const role_id = localStorage.getItem("role_id");
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
        <li style={{ cursor: "pointer" }} onClick={() => navigate("/")}>หน้าหลัก</li>
        <li style={{ cursor: "pointer" }} onClick={() => navigate("/addhome")}>เพิ่มบ้านพัก</li>
        <li style={{ cursor: "pointer" }} onClick={() => navigate("/search")}>ค้นหา</li>
        {role_id === "1" && (
          <li style={{ cursor: "pointer" }} onClick={() => navigate("/auditlog")}>
            แสดงประวัติการเข้าพัก
          </li>
        )}
        
      </ul>
    </nav>
  );
}