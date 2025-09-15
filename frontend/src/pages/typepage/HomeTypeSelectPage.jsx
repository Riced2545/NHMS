import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebars";
import Navbar from "../../components/Sidebar";
import axios from "axios";

export default function HomeTypeSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const homeTypeName = searchParams.get('type');

  const [homeTypeConfig, setHomeTypeConfig] = useState(null);
  const [filters, setFilters] = useState([]);
  const [counts, setCounts] = useState({});

  // ดึง config ประเภทบ้านจาก database
  useEffect(() => {
    axios.get("http://localhost:3001/api/home-types-full").then(res => {
      const found = res.data.find(t => t.name === homeTypeName);
      setHomeTypeConfig(found || null);
    });
  }, [homeTypeName]);

  // ดึง filter
  useEffect(() => {
    if (!homeTypeConfig || !homeTypeConfig.subunit_type) return;
    axios.get(`http://localhost:3001/api/${homeTypeConfig.subunit_type}s`).then(res => setFilters(res.data));
  }, [homeTypeConfig]);

  // ดึงบ้านและคำนวณจำนวนบ้านในแต่ละ filter
  useEffect(() => {
    if (!homeTypeConfig || filters.length === 0) return;
    axios.get("http://localhost:3001/api/homes").then(res => {
      const homes = res.data.filter(h => h.hType === homeTypeName);
      const filterCounts = {};
      // ใช้ key dynamic จาก subunit_type
      let key = homeTypeConfig.subunit_type ? `${homeTypeConfig.subunit_type}_id` : "";
      filters.forEach(f => {
        filterCounts[f.id] = homes.filter(h => String(h[key]) === String(f.id)).length;
      });
      setCounts(filterCounts);
    });
  }, [filters, homeTypeConfig, homeTypeName]);

  // ดึงจำนวนบ้านทั้งหมดในประเภทนั้น
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    if (!homeTypeConfig) return;
    axios.get("http://localhost:3001/api/homes").then(res => {
      const homes = res.data.filter(h => h.hType === homeTypeName);
      setTotalCount(homes.length);
    });
  }, [homeTypeConfig, homeTypeName]);

  if (!homeTypeConfig) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafbff", padding: "32px" }}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div style={{ flex: 1, padding: "32px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "32px", color: "#3b2566" }}>
              ไม่พบประเภทบ้านที่รองรับ
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbff", width: "100vw", margin: 0, overflow: "hidden" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "0 0 64px 0" }}>
          <div style={{ textAlign: "center", padding: "32px 32px 24px 32px", marginBottom: 0 }}>
            <h2 style={{
              color: "#3b2566",
              fontSize: "28px",
              fontWeight: "bold",
              margin: 0
            }}>
              {homeTypeConfig?.subunit_label
                ? `เลือก${homeTypeConfig.subunit_label} ${homeTypeName}`
                : homeTypeName}
            </h2>
            {/* แสดงจำนวน subunit และชื่อ subunit */}
            {homeTypeConfig && (
              <div style={{ fontSize: "16px", color: "#2563eb", marginTop: "8px" }}>
                {homeTypeConfig.subunit_label}ทั้งหมด: <b>{homeTypeConfig.subunit_count}</b>
                {homeTypeConfig.subunit_names && homeTypeConfig.subunit_names.length > 0 &&
                  <span> ({homeTypeConfig.subunit_names.join(", ")})</span>
                }
              </div>
            )}
          </div>
          {/* ถ้ามี filter ให้เลือก filter, ถ้าไม่มีให้แสดงจำนวนบ้านทั้งหมด */}
          {filters.length > 0 ? (
            <div style={{
              display: "flex",
              gap: "32px",
              justifyContent: "center",
              flexWrap: "wrap",
              padding: "0 32px"
            }}>
              {filters.map(f => (
                <div
                  key={f.id}
                  style={{
                    background: "#e0f2fe",
                    borderRadius: "16px",
                    padding: "32px",
                    minWidth: "260px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    textAlign: "center",
                    cursor: "pointer",
                    border: "2px solid #38bdf8",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "24px",
                    transition: "box-shadow 0.2s",
                  }}
                  onClick={() => navigate(`/homes?type=${encodeURIComponent(homeTypeName)}&${homeTypeConfig.subunit_type}=${f.id}`)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(56,189,248,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
                >
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>{homeTypeConfig.icon}</div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#2563eb",
                    marginBottom: "8px"
                  }}>
                    {f.name || `${homeTypeConfig.subunit_label} ${f.id}`}
                  </div>
                  <div style={{
                    fontSize: "16px",
                    color: "#374151",
                    marginBottom: "12px"
                  }}>
                    จำนวนบ้าน: <b>{counts[f.id] || 0}</b> หลัง
                  </div>
                  <button
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 32px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                      marginTop: "8px",
                      transition: "all 0.3s ease"
                    }}
                  >
                    ดูบ้านใน{homeTypeConfig.subunit_label}
                  </button>
                  <div style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "10px"
                  }}>
                    คลิกเพื่อดูรายละเอียด
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: "#e0f2fe",
              borderRadius: "16px",
              padding: "32px",
              minWidth: "260px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
              margin: "0 auto",
              marginTop: "32px",
              maxWidth: "400px"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>{homeTypeConfig.icon}</div>
              <div style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#2563eb",
                marginBottom: "8px"
              }}>
                {homeTypeName}
              </div>
              <div style={{
                fontSize: "16px",
                color: "#374151",
                marginBottom: "12px"
              }}>
                จำนวนบ้านทั้งหมด: <b>{totalCount}</b> หลัง
              </div>
              <button
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 32px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                  marginTop: "8px",
                  transition: "all 0.3s ease"
                }}
                onClick={() => navigate(`/homes?type=${encodeURIComponent(homeTypeName)}`)}
              >
                ดูบ้านทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}