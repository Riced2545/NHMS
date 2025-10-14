import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Sidebar";
import Sidebar from "./Sidebars";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "../../components/Search/Search.css";
import "../../pages/dashboard/Dashboard.css";
import PDFDownload from "./PDF/pdf.jsx";
import ExcelDownloadButton from "./PDF/excel.jsx";

const getHomeTypeIcon = (homeTypeName) => {
  switch(homeTypeName) {
    case 'บ้านพักแฝด': return "🏘️";
    case 'บ้านพักเรือนแถว': return "🏠";
    case 'แฟลตสัญญาบัตร': return "🏢";
    case 'บ้านพักลูกจ้าง': return "🏡";
    default: return "🏗️";
  }
};

const getCardColor = (homeTypeName, index) => {
  const colors = [
    { bg: "#e0f2fe", border: "#0ea5e9", text: "#0369a1" },
    { bg: "#ecfdf5", border: "#10b981", text: "#047857" },
    { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
    { bg: "#fce7f3", border: "#ec4899", text: "#be185d" },
    { bg: "#ede9fe", border: "#8b5cf6", text: "#7c3aed" },
  ];
  return colors[index % colors.length];
};

export default function TypePage() {
  const [homeTypes, setHomeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homes, setHomes] = useState([]);
  const [homeUnits, setHomeUnits] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:3001/api/home_types"),
      axios.get("http://localhost:3001/api/homes")
    ])
      .then(([typeRes, homeRes]) => {
        setHomeTypes(typeRes.data);
        setHomes(homeRes.data);
        // ดึง home_units ของแต่ละประเภทบ้านพัก
        Promise.all(
          typeRes.data.map(type =>
            axios.get(`http://localhost:3001/api/home_units/${type.id}`)
          )
        ).then(unitResArr => {
          const unitsMap = {};
          typeRes.data.forEach((type, idx) => {
            unitsMap[type.id] = unitResArr[idx].data;
          });
          setHomeUnits(unitsMap);
        });
      })
      .catch(() => {
        setHomeTypes([]);
        setHomes([]);
        setHomeUnits({});
      })
      .finally(() => setLoading(false));
  }, []);

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
      <div style={{ display: "flex", minHeight: "calc(100vh - 84px)" }}>
        <Sidebar />
        <div style={{ flex: 1, position: "relative", padding: "32px" }}>
          {/* ปุ่มดาวน์โหลด Excel */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <ExcelDownloadButton />
          </div>

          <div style={{
            display: "flex", justifyContent: "center", marginTop: 24, marginBottom: 24,
          }}>
            <div style={{
              color: "#3b2566",
              fontWeight: "bold",
              fontSize: "35px",
              padding: "18px 48px",
              borderRadius: "8px",
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              letterSpacing: "2px",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textAlign: "center",
              maxWidth: "90%",
            }}>
              จัดการบ้านพักกรมแพทย์ทหารเรือ
            </div>
          </div>

          {/* ปุ่มเข้าหน้าจัดการประเภทบ้านพัก */}
          <div
            style={{
              position: "fixed",
              top: 100,
              right: 24,
              zIndex: 1000
            }}
          >
            <button
              onClick={() => navigate("/addtype")}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "500",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)",
                transition: "background 0.2s"
              }}
            >
              จัดการประเภทบ้านพัก
            </button>
          </div>
          
          {/* ส่วนการ์ดประเภทบ้าน */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 32,
            marginTop: 44,
            width: "100%",
            marginLeft: 0,
            marginRight: 0,
          }}>
            {loading ? (
              <div style={{ color: "#19b0d9", fontWeight: "bold", fontSize: 18 }}>
                กำลังโหลดข้อมูล...
              </div>
            ) : homeTypes.length === 0 ? (
              <div style={{ color: "#ef4444", fontWeight: "bold" }}>
                ไม่พบประเภทบ้านพัก
              </div>
            ) : (
              homeTypes.map((type, index) => {
                const cardColors = getCardColor(type.name, index);
                const units = homeUnits[type.id] || [];

                return (
                  <div
                    key={type.id}
                    className="type-card card-container"
                    style={{
                      border: `2px solid ${cardColors.border}`,
                      borderRadius: 18,
                      boxShadow: "0 4px 24px #e5e7eb",
                      width: 350,
                      padding: "46px 32px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: cardColors.bg,
                      cursor: "pointer",
                      transition: "transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s",
                      animationDelay: `${index * 0.1}s`
                    }}
                 
                  >
                    <div className="home-icon" style={{ fontSize: 64, marginBottom: 20 }}>
                      {getHomeTypeIcon(type.name)}
                    </div>
                    <h3 style={{
                      color: cardColors.text,
                      margin: "0 0 16px 0",
                      fontSize: 26,
                      fontWeight: "600",
                      textAlign: "center"
                    }}>
                      {type.name}
                    </h3>
                    {type.description && (
                      <p style={{
                        color: cardColors.text,
                        fontSize: 14,
                        margin: "0 0 12px 0",
                        textAlign: "center",
                        opacity: 0.8
                      }}>
                        {type.description}
                      </p>
                    )}
                    <div style={{
                      fontSize: 16,
                      marginBottom: 8,
                      color: "#374151"
                    }}>
                      ลักษณะอาคาร: <b style={{ color: cardColors.text }}>{type.subunit_name || "-"}</b>
                    </div>
                    <div style={{
                      fontSize: 16,
                      marginBottom: 8,
                      color: "#374151"
                    }}>
                      จำนวน: <b style={{ color: cardColors.text }}>{type.max_capacity || "-"} {type.subunit_name || "-"}</b>
                    </div>
                    {/* แสดงจำนวนบ้านแต่ละ home_unit */}
                    <div style={{
                      fontSize: 14,
                      marginBottom: 8,
                      color: "#374151",
                      width: "100%"
                    }}>
                      <b style={{ color: cardColors.text }}>บ้านแต่ละหน่วย:</b>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "4px 16px",
                        margin: "8px 0 0 0",
                        padding: 0,
                        width: "100%",
                        maxHeight: 120, // ปรับความสูงให้ scroll ได้
                        overflowY: units.length > 4 ? "auto" : "visible"
                      }}>
                        {units.length === 0 ? (
                          <div style={{ color: "#ef4444", width: "100%" }}>ไม่มีหน่วยบ้าน</div>
                        ) : (
                          units.map((unit, idx) => {
                            const homesInUnit = homes.filter(h => h.home_unit_id === unit.id);
                            const totalHomes = homesInUnit.length;
                            const vacantHomes = homesInUnit.filter(h => h.status_id === 2).length;
                            return (
                              <div
                                key={unit.id}
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "100%",
                                  marginBottom: 2
                                }}
                              >
                                <span
                                  style={{
                                    color: "#2563eb",
                                    fontWeight: 600,
                                    textDecoration: "underline",
                                    cursor: "pointer"
                                  }}
                                  onClick={() => navigate(`/homes?type=${encodeURIComponent(type.name)}&unit=${unit.id}`)}
                                  title={`ดูบ้านใน ${unit.unit_name}`}
                                >
                                  {unit.unit_name} : {totalHomes} หลัง
                                </span>
                                <span style={{ color: "#22c55e", fontWeight: 600 }}>
                                  ว่าง {vacantHomes} หลัง
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
