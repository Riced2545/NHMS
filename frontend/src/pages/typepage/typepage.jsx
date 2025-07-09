import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import "./index.css";
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
    <div style={{ minHeight: "100vh", background: "#fafbff", padding: "0 0 64px 0" }}>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "24px 32px 0 0" }}>
        {/* ปุ่มรายงานครบถ้วน (สรุป + รายละเอียดแยกประเภท) */}
        <PDFDownload 
          typeStats={typeStats}
          houseStatus={houseStatus}
          detailData={detailData}
          reportType="comprehensive"
          disabled={loading}
        />
        
        <button onClick={handleLogout} style={{
          background: "#ef4444", color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 24px", fontWeight: "bold", fontSize: 16, cursor: "pointer",
          boxShadow: "0 2px 8px #e5e7eb"
        }}>
          ออกจากระบบ
        </button>
      </div>
      
      <div style={{ flex: 1, padding: 32 }}>
        <div style={{
          display: "flex", justifyContent: "center", marginTop: 24, marginBottom: 24,
        }}>
          <div style={{
            background: "#19b0d9", color: "#fff", fontWeight: "bold", fontSize: 36,
            padding: "18px 48px", borderRadius: 8, border: "6px solid #31c3e7",
            boxShadow: "4px 4px 0 #31c3e7, 8px 8px 0 #2b2b3d",
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            letterSpacing: 2, textShadow: "2px 2px 0 #31c3e7", userSelect: "none",
          }}>
            ประเภทบ้านพัก
          </div>
        </div>
        
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
            typeStats.map(({ type, count }) => (
              <div
                key={type}
                className="type-card"
                style={{
                  border: "1px solid #e5e7eb", borderRadius: 18,
                  boxShadow: "0 4px 24px #e5e7eb", width: 400,
                  padding: "36px 32px", display: "flex", flexDirection: "column",
                  alignItems: "center", background: "#fff", cursor: "pointer",
                  transition: "transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s",
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
                  e.currentTarget.style.transform = "translateY(-12px) scale(1.04)";
                  e.currentTarget.style.boxShadow = "0 12px 32px #b6b6e7";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 24px #e5e7eb";
                }}
              >
                <h3 style={{ color: "#0ea5e9" }}>{type}</h3>
                <div>จำนวนบ้าน: <b style={{ color: "#ff5e62" }}>{count}</b></div>
                <div>ดูบ้านทั้งหมดในประเภทนี้</div>
              </div>
            ))
          )}
        </div>
        
        {/* Pie Chart */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
          <div style={{
            background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px #e5e7eb",
            padding: 24, paddingTop: 56, paddingBottom: 32, minHeight: 340,
          }}>
            <h3 style={{ textAlign: "center", marginBottom: 0 }}>สถานะบ้านพัก</h3>
            <PieChart width={320} height={260} style={{ marginTop: 16 }}>
              <Pie data={dataHouseStatus} cx="50%" cy="56%" outerRadius={90} dataKey="value" label>
                {dataHouseStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
}
