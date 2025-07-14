import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Sidebar"; // เปลี่ยนจาก ".././Sidebar" เป็น "../Sidebar"
import { useNavigate } from "react-router-dom";

export default function RetirementPage() {
  const [retirementData, setRetirementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRetirementData();
  }, []);

  const fetchRetirementData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/retirement");
      setRetirementData(response.data);
    } catch (error) {
      console.error("Error fetching retirement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysMessage = (days) => {
    if (days <= 0) return "เกษียณแล้ว";
    if (days <= 30) return `เหลือ ${days} วัน (เกือบจะเกษียณ!)`;
    if (days <= 60) return `เหลือ ${days} วัน`;
    return `เหลือ ${days} วัน`;
  };

  const getStatusColor = (days) => {
    if (days <= 0) return "#ef4444"; // แดง - เกษียณแล้ว
    if (days <= 30) return "#f59e0b"; // ส้ม - เกือบเกษียณ
    if (days <= 60) return "#10b981"; // เขียว - ใกล้เกษียณ
    return "#6b7280"; // เทา
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#fafbff", 
      padding: "0 0 64px 0",
      width: "100vw",
      margin: 0,
      overflow: "hidden"
    }}>
      <Navbar />
      <div style={{ 
        padding: "32px",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box"
      }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginTop: "24px",
          marginBottom: "32px",
          width: "100%"
        }}>
          <div style={{
            background: "#19b0d9", 
            color: "#fff", 
            fontWeight: "bold", 
            fontSize: "clamp(18px, 4vw, 36px)", // responsive font size
            padding: "18px 48px", 
            borderRadius: "8px", 
            border: "6px solid #31c3e7",
            boxShadow: "4px 4px 0 #31c3e7, 8px 8px 0 #2b2b3d",
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            letterSpacing: "2px", 
            textShadow: "2px 2px 0 #31c3e7", 
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
            maxWidth: "90%"
          }}>
            🕐 รายชื่อผู้ใกล้เกษียณอายุ (60 ปี)
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            color: "#19b0d9", 
            fontWeight: "bold",
            fontSize: "18px",
            marginTop: "64px",
            width: "100%"
          }}>
            กำลังโหลดข้อมูล...
          </div>
        ) : retirementData.length === 0 ? (
          <div style={{
            textAlign: "center",
            backgroundColor: "#fff",
            padding: "48px",
            borderRadius: "18px",
            boxShadow: "0 4px 24px #e5e7eb",
            maxWidth: "600px",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <div style={{ 
              fontSize: "20px", 
              color: "#10b981", 
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              ไม่มีผู้ใกล้เกษียณในช่วง 2 เดือนข้างหน้า
            </div>
            <div style={{ color: "#6b7280" }}>
              ผู้พักอาศัยทุกคนยังห่างจากการเกษียณอายุ
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            boxSizing: "border-box"
          }}>
            {retirementData.map((person, index) => (
              <div
                key={person.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 4px 24px #e5e7eb",
                  border: "1px solid #e5e7eb",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px #e5e7eb";
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "16px"
                }}>
                  <div style={{ 
                    flex: 1, 
                    minWidth: "300px",
                    width: "100%"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px"
                    }}>
                      <div style={{ fontSize: "24px" }}>👤</div>
                      <div>
                        <h3 style={{
                          margin: "0",
                          fontSize: "20px",
                          color: "#1f2937",
                          fontWeight: "600"
                        }}>
                          {person.rank_name} {person.name} {person.lname}
                        </h3>
                        <div style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginTop: "4px"
                        }}>
                          อายุปัจจุบัน: {person.current_age} ปี
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "16px",
                      marginBottom: "16px",
                      width: "100%"
                    }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                          📍 ที่อยู่
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          {person.Address} ({person.home_type_name})
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                          🎂 วันเกิด
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          {formatDate(person.dob)}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                          🏆 วันเกษียณอายุ
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          {formatDate(person.retirement_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    textAlign: "center",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    minWidth: "160px",
                    flexShrink: 0
                  }}>
                    <div style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: getStatusColor(person.days_to_retirement),
                      marginBottom: "8px"
                    }}>
                      {person.days_to_retirement}
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: getStatusColor(person.days_to_retirement),
                      fontWeight: "600"
                    }}>
                      {getDaysMessage(person.days_to_retirement)}
                    </div>
                  </div>
                </div>

                {person.days_to_retirement <= 30 && (
                  <div style={{
                    marginTop: "16px",
                    padding: "12px",
                    backgroundColor: "#fef3c7",
                    borderRadius: "8px",
                    border: "1px solid #f59e0b",
                    color: "#92400e",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    boxSizing: "border-box"
                  }}>
                    ⚠️ ต้องเตรียมการสำหรับการเกษียณอายุ
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}