import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Sidebar";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalHomes: 0,
    vacantHomes: 0,
    occupiedHomes: 0,
    totalGuests: 0,
    retirementSoon: 0,
    occupancyRate: 0
  });
  const [typeStats, setTypeStats] = useState([]);
  const [rankStats, setRankStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("ทั้งหมด");
  const [selectedTitle, setSelectedTitle] = useState("ทั้งหมด");
  const [selectedRank, setSelectedRank] = useState("ทั้งหมด");
  const [homes, setHomes] = useState([]); // เพิ่ม state homes
  const [guests, setGuests] = useState([]); // เพิ่ม state guests

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [homesRes, guestsRes, retirementRes, logsRes] = await Promise.all([
        axios.get("http://localhost:3001/api/homes"),
        axios.get("http://localhost:3001/api/guests"),
        axios.get("http://localhost:3001/api/retirement"),
        axios.get("http://localhost:3001/api/guest_logs")
      ]);
      const homes = homesRes.data;
      setHomes(homes);
      setGuests(guestsRes.data); // set guests

      // คำนวณสถิติหลัก
      const totalHomes = homes.length;
      const vacantHomes = homes.filter(h => h.status_id === 2).length;
      const occupiedHomes = homes.filter(h => h.status_id === 1).length;
      const totalGuests = guestsRes.data.length;
      const retirementSoon = retirementRes.data.filter(r => r.days_to_retirement <= 30).length;
      const occupancyRate = totalHomes > 0 ? ((occupiedHomes / totalHomes) * 100).toFixed(1) : 0;

      // จำนวนคนเกษียณปีนี้
      const currentYear = new Date().getFullYear();
      const retirementThisYear = retirementRes.data.filter(r => {
        const year = new Date(r.retirement_date).getFullYear();
        return year === currentYear;
      }).length;

      setDashboardData({
        totalHomes,
        vacantHomes,
        occupiedHomes,
        totalGuests,
        retirementSoon: retirementThisYear, // เปลี่ยนตรงนี้
        occupancyRate
      });

      // สถิติตามประเภทบ้าน
      const typeData = {};
      homes.forEach(h => {
        const type = h.hType || "ไม่ระบุ";
        if (!typeData[type]) typeData[type] = { total: 0, occupied: 0 };
        typeData[type].total++;
        if (h.status_id === 1) typeData[type].occupied++;
      });

      const typeStatsArray = Object.entries(typeData).map(([type, data]) => ({
        type,
        total: data.total,
        occupied: data.occupied,
        vacant: data.total - data.occupied
      }));
      setTypeStats(typeStatsArray);

      // สถิติตามยศ
      const rankData = {};
      guestsRes.data.forEach(g => {
        const rank = g.rank || "ไม่ระบุ";
        rankData[rank] = (rankData[rank] || 0) + 1;
      });

      const rankStatsArray = Object.entries(rankData).map(([rank, count]) => ({
        rank,
        count
      }));
      setRankStats(rankStatsArray);

      // การแจ้งเตือน
      const notifs = [];
      if (retirementSoon > 0) {
        notifs.push({
          type: "warning",
          message: `มีผู้ใกล้เกษียณ ${retirementSoon} คน ในช่วง 30 วันข้างหน้า`,
          icon: "⚠️"
        });
      }
      if (vacantHomes > 5) {
        notifs.push({
          type: "info",
          message: `มีบ้านว่าง ${vacantHomes} หลัง พร้อมให้เข้าพัก`,
          icon: "🏠"
        });
      }
      setNotifications(notifs);

      // กิจกรรมล่าสุดจาก database (เอา 10 รายการล่าสุด)
      const recentActivitiesData = logsRes.data.slice(0, 10).map(log => {
        let actionText = "";
        let userName = "";
        let locationInfo = "";
        let activityType = "update";
        
        switch(log.action) {
          case "add":
            actionText = "เข้าพักใหม่";
            userName = `${log.rank_name || ''} ${log.name || ''} ${log.lname || ''}`.trim();
            locationInfo = `บ้านเลขที่ ${log.home_address || 'ไม่ระบุ'} (${log.home_type_name || 'ไม่ระบุประเภท'})`;
            activityType = "add";
            break;
          case "delete":
            actionText = "ย้ายออก";
            // ใช้ข้อมูลที่เก็บไว้ใน log แทนการ join
            userName = `${log.rank_name || ''} ${log.name || ''} ${log.lname || ''}`.trim();
            locationInfo = `จากบ้านเลขที่ ${log.home_address || 'ไม่ระบุ'} (${log.home_type_name || 'ไม่ระบุประเภท'})`;
            activityType = "remove";
            break;
          case "edit":
            actionText = "อัพเดทข้อมูล";
            userName = `${log.rank_name || ''} ${log.name || ''} ${log.lname || ''}`.trim();
            locationInfo = `บ้านเลขที่ ${log.home_address || 'ไม่ระบุ'} (${log.home_type_name || 'ไม่ระบุประเภท'})`;
            activityType = "update";
            break;
          case "move":
            actionText = "ย้ายบ้าน";
            userName = `${log.rank_name || ''} ${log.name || ''} ${log.lname || ''}`.trim();
            locationInfo = `จากบ้านเลขที่ ${log.old_home_address || 'ไม่ระบุ'} ไปบ้านเลขที่ ${log.new_home_address || log.home_address || 'ไม่ระบุ'}`;
            activityType = "update";
            break;
          case "add_home":
            actionText = "เพิ่มบ้านใหม่";
            userName = "ผู้ดูแลระบบ";
            locationInfo = `บ้านเลขที่ ${log.home_address || log.home_name || 'ไม่ระบุ'} (${log.home_type_name || 'ไม่ระบุประเภท'})`;
            activityType = "add";
            break;
          case "edit_home":
            actionText = "แก้ไขข้อมูลบ้าน";
            userName = "ผู้ดูแลระบบ";
            locationInfo = `บ้านเลขที่ ${log.home_address || log.home_name || 'ไม่ระบุ'} (${log.home_type_name || 'ไม่ระบุประเภท'})`;
            activityType = "update";
            break;
          case "delete_home":
            actionText = "ลบบ้าน";
            userName = "ผู้ดูแลระบบ";
            locationInfo = `บ้านเลขที่ ${log.home_address || log.home_name || 'ไม่ระบุ'} (${log.home_type_name || 'ไม่ระบุประเภท'})`;
            activityType = "remove";
            break;
          default:
            actionText = log.action || "กิจกรรม";
            userName = log.detail || "ไม่ระบุ";
            locationInfo = "";
            activityType = "update";
        }

        // คำนวณเวลาที่ผ่านมา
        const timeAgo = getTimeAgo(new Date(log.created_at));
        
        return {
          id: log.id,
          action: actionText,
          user: userName || "ไม่ระบุชื่อ",
          location: locationInfo,
          time: timeAgo,
          type: activityType,
          detail: log.detail
        };
      });

      setRecentActivities(recentActivitiesData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันคำนวณเวลาที่ผ่านมา
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "เมื่อสักครู่";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} นาทีที่แล้ว`;
    } else if (diffHours < 24) {
      return `${diffHours} ชั่วโมงที่แล้ว`;
    } else if (diffDays === 1) {
      return "1 วันที่แล้ว";
    } else if (diffDays < 7) {
      return `${diffDays} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // สร้างอาร์เรย์ประเภทบ้าน
  const homeTypes = ["ทั้งหมด", ...Array.from(new Set(homes.map(h => h.hType || "ไม่ระบุ")))];
  // กรอง homes ตามประเภทที่เลือก
  const filteredHomes = selectedType === "ทั้งหมด"
    ? homes
    : homes.filter(h => h.hType === selectedType);
  // สร้างอาร์เรย์คำนำหน้าจาก guests
  const titles = ["ทั้งหมด", ...Array.from(new Set(guests.map(g => g.title || "ไม่ระบุ")))];
  // สร้างอาร์เรย์ยศจาก guests
  const ranks = ["ทั้งหมด", ...Array.from(new Set(guests.map(g => g.rank || "ไม่ระบุ")))];

  // กรอง guests ตามประเภทบ้าน, คำนำหน้า, และยศที่เลือก
  const filteredGuests = guests.filter(g => {
    const typeMatch = selectedType === "ทั้งหมด" || g.hType === selectedType;
    const titleMatch = selectedTitle === "ทั้งหมด" || (g.title || "ไม่ระบุ") === selectedTitle;
    const rankMatch = selectedRank === "ทั้งหมด" || (g.rank || "ไม่ระบุ") === selectedRank;
    return typeMatch && titleMatch && rankMatch;
  });

  // กรอง typeStats ตามตัวกรอง (ประเภทบ้าน, คำนำหน้า, ยศ)
const filteredTypeStats = (() => {
  // สร้างอ็อบเจกต์เก็บสถิติ
  const typeData = {};
  filteredGuests.forEach(g => {
    const type = g.hType || "ไม่ระบุ";
    if (!typeData[type]) typeData[type] = { total: 0, occupied: 0 };
    typeData[type].total++;
    typeData[type].occupied++;
  });

  // ดึงข้อมูลบ้านว่างจาก homes ที่ตรงประเภท
  Object.keys(typeData).forEach(type => {
    const totalHomesOfType = homes.filter(h => (h.hType || "ไม่ระบุ") === type).length;
    typeData[type].vacant = totalHomesOfType - typeData[type].occupied;
  });

  return Object.entries(typeData).map(([type, data]) => ({
    type,
    total: data.total,
    occupied: data.occupied,
    vacant: data.vacant
  }));
})();

  // สถิติตามยศ (Pie Chart)
  const filteredRankStats = (() => {
    const rankData = {};
    filteredGuests.forEach(g => {
      const rank = g.rank || "ไม่ระบุ";
      rankData[rank] = (rankData[rank] || 0) + 1;
    });
    return Object.entries(rankData).map(([rank, count]) => ({ rank, count }));
  })();

  // แม่สีหลัก
const BASE_COLORS = [
  "#3b82f6", // ฟ้า
  "#10b981", // เขียว
  "#f59e0b", // ส้ม
  "#8b5cf6", // ม่วง
  "#ef4444", // แดง
  "#6366f1", // น้ำเงิน
  "#f43f5e", // ชมพู
  "#22d3ee", // ฟ้าอ่อน
  "#84cc16", // เขียวอ่อน
  "#eab308", // เหลือง
];

// ฟังก์ชันสุ่มสีจากแม่สีและปรับความสว่าง
function getRandomColorFromBase() {
  const base = BASE_COLORS[Math.floor(Math.random() * BASE_COLORS.length)];
  // ปรับความสว่างแบบง่าย ๆ (เพิ่ม/ลด brightness)
  const amt = Math.floor(Math.random() * 60) - 30; // -30 ถึง +30
  return shadeColor(base, amt);
}

// ฟังก์ชันปรับความสว่าง HEX
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = Math.min(255, Math.max(0, R + percent));
  G = Math.min(255, Math.max(0, G + percent));
  B = Math.min(255, Math.max(0, B + percent));

  return "#" + 
    ("0" + R.toString(16)).slice(-2) +
    ("0" + G.toString(16)).slice(-2) +
    ("0" + B.toString(16)).slice(-2);
}

// สุ่มสีสำหรับ Pie Chart และ Card Grid
const pieColors = filteredRankStats.map(() => getRandomColorFromBase());

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafbff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#19b0d9", fontWeight: "bold", fontSize: 18 }}>
          กำลังโหลดข้อมูล Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbff", padding: "0 0 64px 0", width: "100vw", margin: 0, overflow: "hidden" }}>
      <Navbar />

      <div className="dashboard-grid" style={{ padding: "32px" }}>
        {/* หัวข้อ */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#19b0d9",
            fontFamily: "'Kanit', sans-serif",
            margin: 0
          }}>
            📊 Dashboard ระบบจัดการบ้านพัก
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", marginTop: "8px" }}>
            ภาพรวมข้อมูลและสถิติการใช้งานระบบ
          </p>
          {/* ตัวกรองข้อมูล (ดีไซน์ใหม่) */}
<div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  alignItems: "center",
  justifyContent: "center",
  background: "#f3f4f6",
  borderRadius: "12px",
  padding: "20px 24px",
  marginBottom: "16px",
  boxShadow: "0 2px 8px #e0e7eb"
}}>
  {/* ตัวกรองประเภทบ้าน */}
  <div style={{ minWidth: 180 }}>
    <label style={{ marginRight: "8px", fontWeight: "bold" }}>ประเภทบ้าน:</label>
    <select
      value={selectedType}
      onChange={e => setSelectedType(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1.5px solid #d1d5db",
        fontSize: "15px",
        background: "#fff",
        boxShadow: "0 1px 2px #e5e7eb"
      }}
    >
      {ALL_HOME_TYPES.map(type => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
  </div>
  {/* ตัวกรองคำนำหน้า */}
  <div style={{ minWidth: 160 }}>
    <label style={{ marginRight: "8px", fontWeight: "bold" }}>คำนำหน้า:</label>
    <select
      value={selectedTitle}
      onChange={e => setSelectedTitle(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1.5px solid #d1d5db",
        fontSize: "15px",
        background: "#fff",
        boxShadow: "0 1px 2px #e5e7eb"
      }}
    >
      {ALL_TITLES.map(title => (
        <option key={title} value={title}>{title}</option>
      ))}
    </select>
  </div>
  {/* ตัวกรองยศ */}
  <div style={{ minWidth: 160 }}>
    <label style={{ marginRight: "8px", fontWeight: "bold" }}>ยศ:</label>
    <select
      value={selectedRank}
      onChange={e => setSelectedRank(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1.5px solid #d1d5db",
        fontSize: "15px",
        background: "#fff",
        boxShadow: "0 1px 2px #e5e7eb"
      }}
    >
      {ALL_RANKS.map(rank => (
        <option key={rank} value={rank}>{rank}</option>
      ))}
    </select>
  </div>

</div>
        </div>

        {/* Cards สถิติหลัก */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "32px"
        }}>
          <StatCard
            title="บ้านทั้งหมด"
            value={dashboardData.totalHomes}
            icon="🏘️"
            color="#3b82f6"
          />
          <StatCard
            title="บ้านที่มีผู้อยู่"
            value={dashboardData.occupiedHomes}
            icon="🏠"
            color="#10b981"
          />
          <StatCard
            title="บ้านว่าง"
            value={dashboardData.vacantHomes}
            icon="🏚️"
            color="#f59e0b"
          />
          <StatCard
            title="ผู้พักทั้งหมด"
            value={dashboardData.totalGuests}
            icon="👥"
            color="#8b5cf6"
          />
          <StatCard
            title="เกษียณปีนี้"
            value={`${dashboardData.retirementSoon} คน`}
            icon="⏰"
            color="#ef4444"
          />
        </div>

        {/* แถวที่ 1: กราฟและการแจ้งเตือน */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          marginBottom: "32px"
        }}>
          {/* Bar Chart - สถิติตามประเภทบ้าน */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb",
            marginLeft: "40px" // เพิ่มบรรทัดนี้เพื่อขยับกราฟไปทางขวา
          }}>
            <h3 style={{ marginBottom: "16px", color: "#1f2937" }}>สถิติตามประเภทบ้าน</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredTypeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" fontSize={20} textAnchor="end" height={100} position="center" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#10b981" name="มีผู้อยู่" />
                <Bar dataKey="vacant" fill="#f59e0b" name="ว่าง" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* การแจ้งเตือน */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#1f2937" }}>🔔 การแจ้งเตือน</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {dashboardData.retirementSoon > 0 ? (
                <div style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #ef4444",
                  color: "#b91c1c"
                }}>
                  <span style={{ marginRight: "8px" }}>⏰</span>
                  มีผู้เกษียณในปีนี้จำนวน <b>{dashboardData.retirementSoon}</b> คน
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                  ✅ ไม่มีผู้เกษียณในปีนี้
                </div>
              )}
              {dashboardData.vacantHomes > 5 && (
                <div style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#dbeafe",
                  border: "1px solid #3b82f6",
                  color: "#1e40af"
                }}>
                  <span style={{ marginRight: "8px" }}>🏠</span>
                  มีบ้านว่าง <b>{dashboardData.vacantHomes}</b> หลัง พร้อมให้เข้าพัก
                </div>
              )}
            </div>
          </div>
        </div>

        {/* แถวที่ 2: Pie Chart และ Card Grid สถิติตามยศ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "32px"
        }}>
          {/* Pie Chart - สถิติตามยศ (มีตัวอักษรรอบๆ) */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb",
            position: "relative"
          }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#1f2937" }}>สถิติตามยศ</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={filteredRankStats.sort((a, b) => b.count - a.count)}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={150}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="rank"
                  label={({ rank, count, percent }) => `${rank}: ${count}`}
                  labelLine={false}
                  fontSize={12}
                >
                  {filteredRankStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={pieColors[index]} // ใช้สีสุ่ม
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value, name) => [`${value} คน`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  fontSize={11}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "15px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* ข้อมูลตรงกลาง Donut */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -55%)",
              textAlign: "center",
              pointerEvents: "none",
              background: "#fff",
              borderRadius: "50%",
              padding: "15px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#3b82f6",
                marginBottom: "4px",
                fontFamily: "'Inter', sans-serif"
              }}>
                {filteredRankStats.reduce((sum, rank) => sum + rank.count, 0)}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "500",
                marginBottom: "2px"
              }}>
                บุคลากร
              </div>
              <div style={{
                fontSize: "10px",
                color: "#9ca3af"
              }}>
                {filteredRankStats.length} ยศ
              </div>
            </div>
          </div>

          {/* สถิติตามยศ - Card Grid Style (ดีไซน์ทางการ) */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ 
              textAlign: "center", 
              marginBottom: "24px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "16px"
            }}>
              <h3 style={{ 
                color: "#1f2937", 
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "4px",
                fontFamily: "'Inter', sans-serif"
              }}>
                สถิติการจำแนกตามยศ
              </h3>
              <p style={{ 
                color: "#6b7280", 
                fontSize: "13px",
                margin: 0,
                fontWeight: "400"
              }}>
                จำนวน {rankStats.length} ยศ | เรียงตามจำนวนบุคลากร
              </p>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
              maxHeight: "320px",
              overflowY: "auto",
              padding: "2px"
            }}>
              {rankStats
                .sort((a, b) => b.count - a.count)
                .map((rank, index) => (
                <div 
                  key={rank.rank} 
                  style={{
                    position: "relative",
                    padding: "16px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: `1px solid ${pieColors[index]}20`,
                    color: pieColors[index],
                    textAlign: "center",
                    minHeight: "90px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    cursor: "default",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS[index % COLORS.length]}15`;
                    e.currentTarget.style.borderColor = `${COLORS[index % COLORS.length]}40`;
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                    e.currentTarget.style.borderColor = `${COLORS[index % COLORS.length]}20`;
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                >
                  {/* อันดับสำหรับ Top 3 (เรียบร้อยกว่า) */}
                  {index < 3 && (
                    <div style={{
                      position: "absolute",
                      top: "-6px",
                      right: "6px",
                      background: index === 0 ? "#059669" : index === 1 ? "#0891b2" : "#dc2626",
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: "600",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      pointerEvents: "none"
                    }}>
                      {index + 1}
                    </div>
                  )}
                  
                  {/* จำนวนคน */}
                  <div style={{ 
                    fontSize: "24px",
                    fontWeight: "700", 
                    color: pieColors[index],
                    marginBottom: "6px",
                    pointerEvents: "none",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {rank.count}
                  </div>
                  
                  {/* ชื่อยศ */}
                  <div style={{ 
                    fontSize: "12px",
                    color: "#374151",
                    wordWrap: "break-word",
                    lineHeight: "1.3",
                    fontWeight: "500",
                    pointerEvents: "none",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {rank.rank}
                  </div>
                  
                  {/* แถบแสดงสัดส่วน (เรียบง่าย) */}
                  <div style={{
                    marginTop: "8px",
                    height: "2px",
                    background: "#e5e7eb",
                    borderRadius: "1px",
                    overflow: "hidden",
                    pointerEvents: "none"
                  }}>
                    <div style={{
                      height: "100%",
                      background: pieColors[index],
                      borderRadius: "1px",
                      width: `${(rank.count / Math.max(...rankStats.map(r => r.count))) * 100}%`,
                      transition: "width 0.8s ease"
                    }} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* สรุปข้อมูล */}
            <div style={{
              marginTop: "20px",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "6px",
              textAlign: "center",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{ 
                fontSize: "18px", 
                color: "#6b7280",
                fontFamily: "'Inter', sans-serif"
              }}>
                รวมบุคลากรทั้งหมด: <span style={{ 
                  fontWeight: "600", 
                  color: "#1f2937" 
                }}>
                  {rankStats.reduce((sum, rank) => sum + rank.count, 0)} คน
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* แถวที่ 3: กิจกรรมล่าสุด (เต็มความกว้าง) */}
          {/* กิจกรรมล่าสุดจาก Database */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb",
            gridColumn: "1 / -1"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#1f2937" }}>📋 กิจกรรมล่าสุด</h3>
            <div style={{ 
              maxHeight: "400px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              {recentActivities.map(activity => (
                <div key={activity.id} style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s"
                }}>
                  {/* ไอคอนกิจกรรม */}
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    fontSize: "24px",
                    lineHeight: "1",
                    color: pieColors[Math.floor(Math.random() * pieColors.length)]
                  }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  {/* ข้อความกิจกรรม */}
                  <div style={{ 
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: "500",
                    lineHeight: "1.4"
                  }}>
                    <span style={{ fontWeight: "bold", color: "#1f2937" }}>{activity.user}</span> {activity.action} {activity.location}
                  </div>
                  
                  {/* เวลา */}
                  <div style={{ 
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                    lineHeight: "1.4"
                  }}>
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

// Component สำหรับ Stat Card
function StatCard({ title, value, icon, color }) {
  return (
    <div 
      className="stat-card"
      style={{
        backgroundColor: "#fff",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 4px 24px #e5e7eb",
        textAlign: "center",
        border: `2px solid ${color}20`
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "24px", fontWeight: "bold", color, marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "14px", color: "#6b7280" }}>{title}</div>
    </div>
  );
}

// ฟังก์ชันเสริม
function getActivityIcon(type) {
  switch (type) {
    case "add": return "➕";
    case "remove": return "➖";
    case "update": return "✏️";
    default: return "📝";
  }
}

// ฟังก์ชันสุ่มสี HEX
function getRandomColor() {
  return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, "0");
}

// ตัวเลือก fix สำหรับ dropdown
const ALL_HOME_TYPES = [
  "ทั้งหมด",
  "บ้านพักแฝด",
  "บ้านพักเรือนแถว",
  "แฟลตสัญญาบัตร",
  "บ้านพักลูกจ้าง",
  "คอนโด"
];
const ALL_TITLES = [
  "ทั้งหมด",
  "นาวาเอก",
  "นาวาโท",
  "นาวาตรี",
  "พันจ่าเอก",
  "พันจ่าโท",
  "พันจ่าตรี",
  "จ่าเอก",
  "จ่าโท",
  "จ่าตรี",
  "อื่นๆ"
];
const ALL_RANKS = [
  "ทั้งหมด",
  "นายทหาร",
  "นายสิบ",
  "พลทหาร",
  "ข้าราชการ",
  "ลูกจ้าง",
  "อื่นๆ"
];