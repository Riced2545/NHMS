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
            📊 ระบบจัดการบ้านพักกรมแพทย์ทหารเรือ (พื้นที่บุคคโล)
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", marginTop: "8px" }}>
            ภาพรวมข้อมูลและสถิติการใช้งานระบบ
          </p>
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

        {/* Cards สถิติแยกตามประเภทบ้าน */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          {typeStats.map((type) => (
            <div
              key={type.type}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px #e5e7eb",
                border: "1.5px solid #3b82f640",
                textAlign: "center"
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "18px", color: "#2563eb", marginBottom: 8 }}>
                {type.type}
              </div>
              <div style={{ fontSize: "15px", marginBottom: 4 }}>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>มีผู้อยู่: {type.occupied}</span>
              </div>
              <div style={{ fontSize: "15px", marginBottom: 4 }}>
                <span style={{ color: "#f59e0b", fontWeight: "bold" }}>ว่าง: {type.vacant}</span>
              </div>
              <div style={{ fontSize: "15px", color: "#6b7280" }}>
                มีทั้งหมด {type.total} หลัง
              </div>
            </div>
          ))}
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
