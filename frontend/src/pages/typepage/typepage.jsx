import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Sidebar";
import Sidebar from "./Sidebars"; // นำเข้า Sidebar
import { useNavigate } from "react-router-dom";
import "./index.css";
import "../../components/Search/Search.css";
import "../../pages/dashboard/Dashboard.css";
import PDFDownload from "./PDF/pdf.jsx";

const COLORS = ['#4CAF50', '#F44336'];

// ฟังก์ชันสำหรับเลือกไอคอนตามประเภทบ้าน
const getHomeTypeIcon = (homeTypeName) => {
  switch(homeTypeName) {
    case 'บ้านพักแฝด':
      return "🏘️";
    case 'บ้านพักเรือนแถว':
      return "🏠";
    case 'แฟลตสัญญาบัตร':
      return "🏢";
    case 'บ้านพักลูกจ้าง':
      return "🏡";
    default:
      return "🏗️";
  }
};

// ฟังก์ชันสำหรับสีการ์ดตามประเภท
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
  const [homeTypes, setHomeTypes] = useState([]); // เปลี่ยนจาก typeStats เป็น homeTypes
  const [typeStats, setTypeStats] = useState([]);
  const [houseStatus, setHouseStatus] = useState({ vacant: 0, occupied: 0 });
  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // ดึงข้อมูลประเภทบ้านจาก API
    Promise.all([
      axios.get("http://localhost:3001/api/home_types"),
      axios.get("http://localhost:3001/api/homes"),
      axios.get("http://localhost:3001/api/guests")
    ])
      .then(([homeTypesRes, homesRes, guestsRes]) => {
        console.log('Home Types API Response:', homeTypesRes.data);
        console.log('Homes API Response:', homesRes.data);
        console.log('Guests API Response:', guestsRes.data);
        
        const homeTypesData = homeTypesRes.data;
        const homes = homesRes.data;
        const guests = guestsRes.data;
        
        setHomeTypes(homeTypesData);
        
        // ประมวลผลข้อมูลสรุปประเภทบ้าน
        const stats = {};
        homes.forEach(h => {
          const type = (h.hType || "ไม่ระบุ").trim();
          if (!stats[type]) stats[type] = 0;
          stats[type]++;
        });

        // สร้าง typeStats จากข้อมูล homeTypes และนับจำนวนบ้าน
        const typeStatsArr = homeTypesData.map(homeType => ({
          id: homeType.id,
          type: homeType.name,
          description: homeType.description,
          count: stats[homeType.name] || 0,
          max_capacity: homeType.max_capacity,
          is_row_type: homeType.is_row_type
        }));
        
        setTypeStats(typeStatsArr);

        // นับจำนวนบ้านว่างและบ้านที่มีผู้อยู
        const vacant = homes.filter(h => h.status_id === 2).length;
        const occupied = homes.filter(h => h.status_id === 1).length;
        setHouseStatus({ vacant, occupied });

        // รวมข้อมูลบ้านกับผู้อู่อาศัย
        const processedDetailData = homes.map(house => {
          const houseGuests = guests.filter(guest => guest.home_id === house.home_id);
          
          if (houseGuests.length > 0) {
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
        const mockHomeTypes = [
          { id: 1, name: 'บ้านพักเรือนแถว', description: 'บ้านพักแบบเรือนแถว', max_capacity: 6, is_row_type: true },
          { id: 2, name: 'บ้านพักแฝด', description: 'บ้านพักแบบแฝด', max_capacity: 6, is_row_type: false },
          { id: 3, name: 'บ้านพักลูกจ้าง', description: 'บ้านพักสำหรับลูกจ้าง', max_capacity: 6, is_row_type: false },
          { id: 4, name: 'แฟลตสัญญาบัตร', description: 'แฟลตแบบสัญญาบัตร', max_capacity: 6, is_row_type: false }
        ];
        
        setHomeTypes(mockHomeTypes);
        
        const mockTypeStats = mockHomeTypes.map(type => ({ 
          ...type,
          count: Math.floor(Math.random() * 10) + 1 
        }));
        setTypeStats(mockTypeStats);
        setHouseStatus({ vacant: 5, occupied: 15 });
        
        const mockDetailData = [
          { hNumber: '504/29', hType: 'บ้านพักเรือนแถว', fname: 'ร.อ.หญิง', lname: 'เพียงพรรณ ขิ่นยาย', phone: '094-956-4888' },
          { hNumber: '504/30', hType: 'บ้านพักเรือนแถว', fname: 'น.ท.', lname: 'กฤษฏิ์ วัฒนกิจอนาถา', phone: '086-046-4441' },
          { hNumber: '504/31', hType: 'บ้านพักเรือนแถว', fname: 'น.อ.', lname: 'สมพร ยิ่งงามแก้ว', phone: '083-925-4775' },
          { hNumber: '505/01', hType: 'บ้านพักลูกจ้าง', fname: '', lname: '', phone: '-' },
          { hNumber: '506/101', hType: 'แฟลตสัญญาบัตร', fname: 'นาย', lname: 'ธนาคาร เงินทอง', phone: '083-456-7890' },
        ];
        setDetailData(mockDetailData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ฟังก์ชันสำหรับการนำทางไปยัง GenericHomePage
  const handleTypeClick = (homeTypeName) => {
    navigate(`/homes?type=${encodeURIComponent(homeTypeName)}`);
  };

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
        {/* Sidebar ซ้ายมือ */}
        <Sidebar />
        {/* ส่วนเนื้อหาขวา */}
        <div style={{ flex: 1, position: "relative", padding: "32px" }}>
          {/* ส่วนหัว */}
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
          
          
          {/* ปุ่ม PDFDownload */}
          <div style={{
            position: "fixed",
            top: "100px",
            right: "32px",
            zIndex: 50,
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
          
          {/* ส่วนการ์ดประเภทบ้าน - Dynamic */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 32,
            marginTop: 64,
            width: "100%",
            marginLeft: 0,
            marginRight: 0,
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
              typeStats.map((homeType, index) => {
                const cardColors = getCardColor(homeType.type, index);
                
                return (
                  <div
                    key={homeType.id}
                    className="type-card card-container"
                    style={{
                      border: `2px solid ${cardColors.border}`,
                      borderRadius: 18,
                      boxShadow: "0 4px 24px #e5e7eb",
                      width: 550,
                      padding: "46px 32px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: cardColors.bg,
                      cursor: "pointer",
                      transition: "transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s",
                      animationDelay: `${index * 0.1}s`
                    }}
                    onClick={() => navigate(`/homes?type=${encodeURIComponent(homeType.type)}`)}
                  >
                    {/* ไอคอน */}
                    <div 
                      className="home-icon"
                      style={{ 
                        fontSize: 64, 
                        marginBottom: 20,
                        transition: "transform 0.3s ease",
                        transform: "scale(1)"
                      }}
                    >
                      {getHomeTypeIcon(homeType.type)}
                    </div>
                    
                    {/* ชื่อประเภท */}
                    <h3 style={{ 
                      color: cardColors.text, 
                      margin: "0 0 16px 0",
                      fontSize: 20,
                      fontWeight: "600",
                      textAlign: "center"
                    }}>
                      {homeType.type}
                    </h3>
                    
                    {/* คำอธิบาย */}
                    {homeType.description && (
                      <p style={{
                        color: cardColors.text,
                        fontSize: 14,
                        margin: "0 0 12px 0",
                        textAlign: "center",
                        opacity: 0.8
                      }}>
                        {homeType.description}
                      </p>
                    )}
                    
                    {/* จำนวนบ้าน */}
                    <div style={{ 
                      fontSize: 18, 
                      marginBottom: 12,
                      color: "#374151"
                    }}>
                      จำนวนบ้าน: <b style={{ color: cardColors.text, fontSize: 20 }}>{homeType.count}</b> หลัง
                    </div>
                                    
                    {/* ข้อความคลิก */}
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
                        <div style={{ fontSize: 16, color: cardColors.text, fontWeight: "500" }}>
                          คลิกเพื่อดูรายละเอียด
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                          บ้านทั้งหมดในประเภทนี้
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* เพิ่มปุ่มจัดการประเภทบ้าน */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 48,
            gap: 16
          }}>
            <button
              onClick={() => navigate("/addtype")}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
              }}
            >
              ➕ จัดการประเภทบ้าน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
