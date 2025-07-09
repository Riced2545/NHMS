import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Navbar() {
  const navigate = useNavigate();
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
        {/* รูปภาพจะแสดงถ้าไฟล์ anchor.png อยู่ใน public */}
        <img src="/anchor.png" alt="logo" style={{ width: 36, height: 36 }} />
        <span style={{ fontWeight: "bold", fontSize: 22 }}>Naval Base Management System ( NBMS )</span>
      </div>
      <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0 }}>
        <li style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>กลับ</li>
      </ul>
    </nav>
  );
}