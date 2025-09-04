import React from "react";
import { useNavigate } from "react-router-dom";
import { MdManageAccounts, MdOutlineFactCheck } from "react-icons/md";

export default function Lobby() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleManageClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  };

  const handleVoteClick = () => {
    navigate("/score");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc", // เปลี่ยนเป็นสีขาว
        padding: "0 0 64px 0",
        width: "100vw",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Kanit', 'Prompt', sans-serif"
      }}
    >
      <h1 style={{
        fontSize: "2.5rem",
        fontWeight: 700,
        color: "#1976d2",
        marginBottom: "2rem",
        letterSpacing: "2px"
      }}>
        Medicine Smart House
      </h1>
      <p>ระบบจัดการบ้านพักและลงคะแนนเข้าพัก</p>
      <div style={{
        display: "flex",
        gap: "2rem"
      }}>
        <div
          style={{
            border: "2px solid #1976d2",
            borderRadius: "24px",
            padding: "2.5rem 2rem",
            width: "320px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(25, 118, 210, 0.08)",
            background: "#fff",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onClick={handleManageClick}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(25, 118, 210, 0.18)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(25, 118, 210, 0.08)";
          }}
        >
          <MdManageAccounts size={48} color="#1976d2" style={{ marginBottom: "12px" }} />
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>จัดการข้อมูล</h2>
          <p style={{ color: "#1976d2", fontWeight: 500 }}>สำหรับเจ้าหน้าที่/ผู้ดูแล</p>
        </div>
        <div
          style={{
            border: "2px solid #43a047",
            borderRadius: "24px",
            padding: "2.5rem 2rem",
            width: "320px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(67, 160, 71, 0.08)",
            background: "#fff",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onClick={handleVoteClick}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(67, 160, 71, 0.18)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(67, 160, 71, 0.08)";
          }}
        >
          <MdOutlineFactCheck size={48} color="#43a047" style={{ marginBottom: "12px" }} />
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>ลงคะแนนเข้าพัก</h2>
          <p style={{ color: "#43a047", fontWeight: 500 }}>สำหรับผู้ใช้ทั่วไป</p>
        </div>
      </div>
    </div>
  );
}