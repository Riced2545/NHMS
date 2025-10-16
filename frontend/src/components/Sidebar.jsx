import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./index.css";
import FileDownloadModal from "../pages/typepage/PDF/filedownload";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role_id = localStorage.getItem("role_id");
  const username = localStorage.getItem("username") || "ผู้ใช้";
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const dropdownRef = useRef(null);

  // เพิ่มส่วนนี้เพื่อ redirect ถ้าไม่ได้ login
  useEffect(() => {
    const token = localStorage.getItem("token");
    // ถ้าไม่มี token และไม่ได้อยู่ที่หน้า login หรือ register ให้ redirect
    if (!token && location.pathname !== "/login" && location.pathname !== "/register") {
      navigate("/login");
    }
  }, [location, navigate]);
  
  // Debug - ดูว่า username มีค่าอะไร
  useEffect(() => {
    console.log("Current username from localStorage:", username);
    console.log("All localStorage items:", {
      token: localStorage.getItem("token"),
      role_id: localStorage.getItem("role_id"),
      username: localStorage.getItem("username")
    });
  }, [username]);

  // ฟังก์ชันเช็ค active
  const isActive = (path) => location.pathname === path;

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <nav
      style={{
        width: "100%",
        height:"100%",
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
        <span style={{ fontWeight: "bold", fontSize: 22 }}>ระบบจัดการบ้านพักกรมแพทย์ทหารเรือ (พื้นที่บุคคโล)</span>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Menu Items */}
        <ul style={{ display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0 , fontSize: 17 }}>
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
                borderBottom: isActive("/home") ? "3px solid #fff" : "none",
                fontWeight: isActive("/home") ? "bold" : "normal",
                color: isActive("/home") ? "#ffe066" : "#fff",
              }}
              onClick={() => navigate("/home")}
            >
              ดูบ้านพักทั้งหมด
            </li>
          )}
          
          
           {role_id === "1" && (
            <li
              style={{
                cursor: "pointer",
                borderBottom: isActive("/viewscore") ? "3px solid #fff" : "none",
                fontWeight: isActive("/viewscore") ? "bold" : "normal",
                color: isActive("/viewscore") ? "#ffe066" : "#fff",
              }}
              onClick={() => navigate("/viewscore")}
            >
              ดูคะแนน
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
          
          {/* เพิ่มเมนูใกล้เกษียณ */}
           {role_id === "1" && (
          <li
            style={{
              cursor: "pointer",
              borderBottom: isActive("/retirement") ? "3px solid #fff" : "none",
              fontWeight: isActive("/retirement") ? "bold" : "normal",
              color: isActive("/retirement") ? "#ffe066" : "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={() => navigate("/retirement")}
          >
            🕐 ใกล้เกษียณ
          </li>
          )}
          
          {/* {role_id === "1" && (
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
          )} */}

          {/* ดาวน์โหลดไฟล์ */}
          {role_id === "1" && (
          <li
            style={{
              cursor: "pointer",
              borderBottom: showDownloadModal ? "3px solid #fff" : "none",
              fontWeight: showDownloadModal ? "bold" : "normal",
              color: showDownloadModal ? "#ffe066" : "#fff",
            }}
            onClick={() => setShowDownloadModal(true)}
          >
            ดาวน์โหลดไฟล์
          </li>
           )}
        </ul>

        {/* User Profile Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor: showDropdown ? "rgba(255,255,255,0.1)" : "transparent",
              transition: "background-color 0.2s",
            }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {/* Avatar Circle */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "#ffe066",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4B2673",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              {username.substring(0, 2).toUpperCase()}
            </div>
            
            {/* Arrow */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                width: 180,
                backgroundColor: "#fff",
                color: "#333",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                zIndex: 9999, // เพิ่มเป็น 9999
              }}
            >
              {/* User Info Header */}
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontWeight: "600", fontSize: 14 }}>
                  {username}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {role_id === "1" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: "8px 0" }}>
                <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />


                {role_id === "1" && (
                  <div
                    style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: 14,
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#fef2f2"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                    onClick={() => navigate("/manageuser")}
                  >
                    จัดการบัญชี
                  </div>
                )}

                <div
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#fef2f2"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                >
                  Log out
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download Modal */}
      <FileDownloadModal open={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
    </nav>
  );
}