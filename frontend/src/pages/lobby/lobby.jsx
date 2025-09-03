import React from "react";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const navigate = useNavigate();

  // สมมติว่ามีตัวแปร isLoggedIn จาก context หรือ localStorage
  const isLoggedIn = !!localStorage.getItem("token");

  const handleManageClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/");
    }
  };

  const handleVoteClick = () => {
    navigate("/score");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "5rem" }}>
      <div
        style={{
          border: "2px solid #1976d2",
          borderRadius: "16px",
          padding: "2rem",
          width: "250px",
          textAlign: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
        onClick={handleManageClick}
      >
        <h2>จัดการข้อมูล</h2>
        <p>สำหรับเจ้าหน้าที่/ผู้ดูแล</p>
      </div>
      <div
        style={{
          border: "2px solid #43a047",
          borderRadius: "16px",
          padding: "2rem",
          width: "250px",
          textAlign: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
        onClick={handleVoteClick}
      >
        <h2>ลงคะแนนเข้าพัก</h2>
        <p>สำหรับผู้ใช้ทั่วไป</p>
      </div>
    </div>
  );
}