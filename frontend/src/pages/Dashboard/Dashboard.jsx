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
      const [homesRes, guestsRes, retirementRes, logsRes] = await Promise.all([
        axios.get("http://localhost:3001/api/homes"),
        axios.get("http://localhost:3001/api/guests"),
        axios.get("http://localhost:3001/api/retirement"),
        axios.get("http://localhost:3001/api/guest_logs") // เพิ่ม API สำหรับ logs
      ]);

      const homes = homesRes.data;
      const guests = guestsRes.data;
      const retirement = retirementRes.data;
      const logs = logsRes.data;

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

      // กิจกรรมล่าสุดจาก database (เอา 10 รายการล่าสุด)
      const recentActivitiesData = logs.slice(0, 10).map(log => {
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

        {/* แถวที่ 2: Pie Chart และ Card Grid สถิติตามยศ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "32px"
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
                    border: `1px solid ${COLORS[index % COLORS.length]}20`,
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
                    color: COLORS[index % COLORS.length],
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
                      background: COLORS[index % COLORS.length],
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
                fontSize: "11px", 
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px"
        }}>
          {/* กิจกรรมล่าสุดจาก Database */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#1f2937" }}>📋 กิจกรรมล่าสุด</h3>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "12px",
              maxHeight: "400px",
              overflowY: "auto"
            }}>
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "500", color: "#1f2937", marginBottom: "4px" }}>
                      {getActivityIcon(activity.type)} {activity.action}
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#6b7280",
                      lineHeight: "1.4",
                      marginBottom: "2px"
                    }}>
                      👤 {activity.user}
                    </div>
                    {activity.location && (
                      <div style={{ 
                        fontSize: "13px", 
                        color: "#059669",
                        lineHeight: "1.4",
                        marginBottom: "2px"
                      }}>
                        🏠 {activity.location}
                      </div>
                    )}
                    {activity.detail && (
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#9ca3af",
                        marginTop: "4px",
                        fontStyle: "italic",
                        lineHeight: "1.5",
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap"
                      }}>
                        {activity.detail}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#9ca3af",
                    marginLeft: "8px",
                    whiteSpace: "nowrap",
                    alignSelf: "flex-start"
                  }}>
                    {activity.time}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                  ไม่มีกิจกรรมล่าสุด
                </div>
              )}
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