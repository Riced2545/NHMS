import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "./index.css";
import "../../components/Search/Search.css";
import "../../pages/dashboard/Dashboard.css"; // เพิ่มบรรทัดนี้
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import PDFDownload from "./PDF/pdf.jsx";

const COLORS = ['#4CAF50', '#F44336'];

const ALL_TYPES = [
  "บ้านพักเรือนแถว",
  "บ้านพักลูกจ้าง",
  "แฟลตสัญญาบัตร",
  "บ้านพักแฝดพื้นที่1",
  "บ้านพักแฝดพื้นที่2",
];

export default function TypePage() {
  const [typeStats, setTypeStats] = useState([]);
  const [houseStatus, setHouseStatus] = useState({ vacant: 0, occupied: 0 });
  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // ดึงข้อมูลทั้งบ้านและผู้อยู่อาศัย
    Promise.all([
      axios.get("http://localhost:3001/api/homes"),
      axios.get("http://localhost:3001/api/guests")
    ])
      .then(([homesRes, guestsRes]) => {
        console.log('Homes API Response:', homesRes.data);
        console.log('Guests API Response:', guestsRes.data);
        
        const homes = homesRes.data;
        const guests = guestsRes.data;
        
        // ประมวลผลข้อมูลสรุปประเภทบ้าน
        const stats = {};
        homes.forEach(h => {
          const type = (h.hType || "ไม่ระบุ").trim();
          if (!stats[type]) stats[type] = 0;
          stats[type]++;
        });

        const typeStatsArr = ALL_TYPES.map(type => ({
          type,
          count: stats[type] || 0
        }));
        setTypeStats(typeStatsArr);

        // นับจำนวนบ้านว่างและบ้านที่มีผู้อยู่
        const vacant = homes.filter(h => h.status_id === 2).length;
        const occupied = homes.filter(h => h.status_id === 1).length;
        setHouseStatus({ vacant, occupied });

        // รวมข้อมูลบ้านกับผู้อยู่อาศัย
        const processedDetailData = homes.map(house => {
          // หาผู้อยู่อาศัยในบ้านนี้
          const houseGuests = guests.filter(guest => guest.home_id === house.home_id);
          
          if (houseGuests.length > 0) {
            // ถ้ามีผู้อยู่อาศัย ให้แสดงหัวหน้าครอบครัว (คนแรก)
            const primaryGuest = houseGuests[0];
            return {
              hNumber: house.Address || '-',
              hType: house.hType || 'ไม่ระบุ',
              fname: primaryGuest.rank || '',
              lname: `${primaryGuest.name || ''} ${primaryGuest.lname || ''}`.trim(),
              phone: primaryGuest.phone || '-',
              status_id: house.status_id,
              guest_count: houseGuests.length
            };
          } else {
            // ถ้าไม่มีผู้อยู่อาศัย
            return {
              hNumber: house.Address || '-',
              hType: house.hType || 'ไม่ระบุ',
              fname: '',
              lname: '',
              phone: '-',
              status_id: house.status_id,
              guest_count: 0
            };
          }
        });

        setDetailData(processedDetailData);
        console.log('Processed Detail Data:', processedDetailData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        
        // ถ้า API ไม่ทำงาน ใช้ข้อมูลทดสอบ
        const mockTypeStats = ALL_TYPES.map(type => ({ 
          type, 
          count: Math.floor(Math.random() * 10) + 1 
        }));
        setTypeStats(mockTypeStats);
        setHouseStatus({ vacant: 5, occupied: 15 });
        
        const mockDetailData = [
          { hNumber: '504/29', hType: 'บ้านพักเรือนแถว', fname: 'ร.อ.หญิง', lname: 'เพียงพรรณ ขิ่นยาย', phone: '094-956-4888' },
          { hNumber: '504/30', hType: 'บ้านพักเรือนแถว', fname: 'น.ท.', lname: 'กฤษฏิ์ วัฒนกิจอนาถา', phone: '086-046-4441' },
          { hNumber: '504/31', hType: 'บ้านพักเรือนแถว', fname: 'น.อ.', lname: 'สมพร ยิ่งงามแก้ว', phone: '083-925-4775' },
          { hNumber: '505/01', hType: 'บ้านพักลูกจ้าง', fname: '', lname: '', phone: '-' }, // บ้านว่าง
          { hNumber: '506/101', hType: 'แฟลตสัญญาบัตร', fname: 'นาย', lname: 'ธนาคาร เงินทอง', phone: '083-456-7890' },
        ];
        setDetailData(mockDetailData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // เตรียมข้อมูลสำหรับ PieChart
  const dataHouseStatus = [
    { name: 'ว่าง', value: houseStatus.vacant },
    { name: 'มีผู้อยู่', value: houseStatus.occupied },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container" style={{ minHeight: "100vh", background: "#fafbff", padding: "0 0 64px 0", position: "relative" }}>
      <Navbar />
      
      {/* Floating Button ด้านบนขวา */}
      <div style={{
        position: "fixed",
        top: "100px",
        right: "32px",
        zIndex: 50, // ลดจาก 1000 เป็น 50
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        background: "#fff",
        border: "1px solid #e5e7eb",
        animation: "float 3s ease-in-out infinite"
      }}>
        <PDFDownload 
          typeStats={typeStats}
          houseStatus={houseStatus}
          detailData={detailData}
          reportType="comprehensive"
          disabled={loading}
        />
      </div>
      
      <div className="content-container" style={{ flex: 1, padding: 32 }}>
        <div style={{
          display: "flex", justifyContent: "center", marginTop: 24, marginBottom: 24,
        }}>
          <div style={{
            color: "#3b2566", 
            fontWeight: "bold", 
            fontSize: "35px",
            padding: "18px 48px", 
            borderRadius: "8px", 
            border: "6px solid #31c3e7",
            boxShadow: " 8px 8px 0 #2b2b3d",
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            letterSpacing: "2px", 
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
            maxWidth: "90%",
          }}>
            ระบบจัดการบ้านพักกรมแพทย์ทหารเรือ
          </div>
        </div>
        
        {/* ส่วนการ์ดประเภทบ้าน */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32,
          marginTop: 64, width: "96vw", marginLeft: 0, marginRight: 0,
        }}>
          {loading ? (
            <div style={{ color: "#19b0d9", fontWeight: "bold", fontSize: 18 }}>
              กำลังโหลดข้อมูล...
            </div>
          ) : typeStats.length === 0 ? (
            <div style={{ color: "#ef4444", fontWeight: "bold" }}>
              ไม่พบประเภทบ้านพัก
            </div>
          ) : (
            typeStats.map(({ type, count }, index) => (
              <div
                key={type}
                className="type-card card-container"
                style={{
                  border: "1px solid #e5e7eb", borderRadius: 18,
                  boxShadow: "0 4px 24px #e5e7eb", width: 550,
                  padding: "46px 32px", display: "flex", flexDirection: "column",
                  alignItems: "center", background: "#fff", cursor: "pointer",
                  transition: "transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s",
                  animationDelay: `${index * 0.1}s` // Stagger animation
                }}
                onClick={() =>
                  type === "แฟลตสัญญาบัตร"
                    ? navigate("/flat")
                    : type === "บ้านพักแฝดพื้นที่1"
                      ? navigate("/twin1")
                      : type === "บ้านพักแฝดพื้นที่2"
                      ? navigate("/twin2")
                      : type === "บ้านพักเรือนแถว"
                      ? navigate("/townhome")
                      : type === "บ้านพักลูกจ้าง"
                      ? navigate("/emphome")
                      : navigate(`/type/${encodeURIComponent(type)}`)
                }
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
                  const icon = e.currentTarget.querySelector('div');
                  if (icon) {
                    icon.style.transform = "scale(1.1)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 24px #e5e7eb";
                  const icon = e.currentTarget.querySelector('div');
                  if (icon) {
                    icon.style.transform = "scale(1)";
                  }
                }}
              >
                {/* เนื้อหาการ์ดเหมือนเดิม */}
                <div style={{ 
                  fontSize: 64, 
                  marginBottom: 20,
                  transition: "transform 0.3s ease",
                  transform: "scale(1)"
                }}>
                  {type === "แฟลตสัญญาบัตร" ? "🏢" :
                   type === "บ้านพักแฝดพื้นที่1" ? "🏘️" :
                   type === "บ้านพักแฝดพื้นที่2" ? "🏘️" :
                   type === "บ้านพักเรือนแถว" ? "🏠" :
                   type === "บ้านพักลูกจ้าง" ? "🏡" : "🏗️"}
                </div>
                <h3 style={{ 
                  color: "#0ea5e9", 
                  margin: "0 0 16px 0",
                  fontSize: 20,
                  fontWeight: "600"
                }}>{type}</h3>
                <div style={{ 
                  fontSize: 18, 
                  marginBottom: 12,
                  color: "#374151"
                }}>
                  จำนวนบ้าน: <b style={{ color: "#dc2626", fontSize: 20 }}>{count}</b> หลัง
                </div>
                <div style={{ 
                  fontSize: 14, 
                  color: "#6b7280",
                  textAlign: "center",
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 8
                }}>
                  <span>👁️</span>
                  <div>
                    <div style={{ fontSize: 18,color: "#3b82f6", fontWeight: "500" }}>
                      คลิกเพื่อดูรายละเอียด
                    </div>
                    <div style={{ fontSize: 14, color: "#94a3b8" }}>
                      บ้านทั้งหมดในประเภทนี้
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
