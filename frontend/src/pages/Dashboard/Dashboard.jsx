import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Sidebar";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";
import "./Dashboard.css";

const COLORS = ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0'];

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [homesRes, guestsRes, retirementRes] = await Promise.all([
        axios.get("http://localhost:3001/api/homes"),
        axios.get("http://localhost:3001/api/guests"),
        axios.get("http://localhost:3001/api/retirement")
      ]);

      const homes = homesRes.data;
      const guests = guestsRes.data;
      const retirement = retirementRes.data;

      // คำนวณสถิติหลัก
      const totalHomes = homes.length;
      const vacantHomes = homes.filter(h => h.status_id === 2).length;
      const occupiedHomes = homes.filter(h => h.status_id === 1).length;
      const totalGuests = guests.length;
      const retirementSoon = retirement.filter(r => r.days_to_retirement <= 30).length;
      const occupancyRate = totalHomes > 0 ? ((occupiedHomes / totalHomes) * 100).toFixed(1) : 0;

      setDashboardData({
        totalHomes,
        vacantHomes,
        occupiedHomes,
        totalGuests,
        retirementSoon,
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
      guests.forEach(g => {
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

      // กิจกรรมล่าสุด (mock data)
      setRecentActivities([
        { id: 1, action: "เข้าพักใหม่", user: "นาวาเอก สมชาย ใจดี", time: "2 ชั่วโมงที่แล้ว", type: "add" },
        { id: 2, action: "ย้ายออก", user: "ร.อ.หญิง มาลี สวยงาม", time: "5 ชั่วโมงที่แล้ว", type: "remove" },
        { id: 3, action: "อัพเดทข้อมูล", user: "น.ท. วิชาญ เก่งมาก", time: "1 วันที่แล้ว", type: "update" },
      ]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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
   <div style={{ 
      minHeight: "100vh", 
      background: "#fafbff", 
      padding: "0 0 64px 0",
      width: "100vw",
      margin: 0,
      overflow: "hidden"
    }}>
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
            title="อัตราการเข้าพัก"
            value={`${dashboardData.occupancyRate}%`}
            icon="📊"
            color="#06b6d4"
          />
          <StatCard
            title="ใกล้เกษียณ"
            value={dashboardData.retirementSoon}
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
            boxShadow: "0 4px 24px #e5e7eb"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#1f2937" }}>สถิติตามประเภทบ้าน</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
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
              {notifications.length > 0 ? notifications.map((notif, index) => (
                <div key={index} style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: notif.type === "warning" ? "#fef3c7" : "#dbeafe",
                  border: `1px solid ${notif.type === "warning" ? "#f59e0b" : "#3b82f6"}`,
                  color: notif.type === "warning" ? "#92400e" : "#1e40af"
                }}>
                  <span style={{ marginRight: "8px" }}>{notif.icon}</span>
                  {notif.message}
                </div>
              )) : (
                <div style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                  ✅ ไม่มีการแจ้งเตือน
                </div>
              )}
            </div>
          </div>
        </div>

        {/* แถวที่ 2: Pie Chart และกิจกรรมล่าสุด */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px"
        }}>
          {/* Pie Chart - สถิติตามยศ */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb"
          }}>
            <h3 style={{ textAlign: "center", marginBottom: "16px", color: "#1f2937" }}>สถิติตามยศ</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rankStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="rank"
                  label
                >
                  {rankStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* กิจกรรมล่าสุด */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#1f2937" }}>📋 กิจกรรมล่าสุด</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentActivities.map((activity) => (
                <div key={activity.id} style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontWeight: "500", color: "#1f2937" }}>
                      {getActivityIcon(activity.type)} {activity.action}
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      {activity.user}
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
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