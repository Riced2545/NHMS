import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Sidebar";
import Sidebar from "./typepage/Sidebars";
import EditHomeModal from "../pages/component/EditHome";
import AddGuestModal from "../components/guest/Addguest/Addguest";
import AddHomeModal from "../components/Addhome";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/home.css";
import "./typepage/ca.css";

export default function GenericHomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const homeTypeName = searchParams.get('type');
  const unitId = searchParams.get('unit');

  const [homes, setHomes] = useState([]);
  const [unitName, setUnitName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddHome, setShowAddHome] = useState(false);
  const [homeTypeIdFromSidebar, setHomeTypeIdFromSidebar] = useState(null); // เพิ่ม state สำหรับ homeTypeId
  const [showAddGuestHomeId, setShowAddGuestHomeId] = useState(null);
  const [showEditHomeId, setShowEditHomeId] = useState(null);
  const [guestsByHome, setGuestsByHome] = useState({});
  const [sidebarReload, setSidebarReload] = useState(Date.now());

  // ย้ายฟังก์ชัน fetchData ออกมาไว้ตรงนี้
  const fetchData = async () => {
    setLoading(true);
    try {
      let filtered = [];
      if (unitId) {
        // ดึงชื่อ unit
        const unitRes = await axios.get(`http://localhost:3001/api/home_unit/${unitId}`);
        setUnitName(unitRes.data?.unit_name || "");
        // ดึงบ้านเฉพาะ unit นี้
        const homeRes = await axios.get(`http://localhost:3001/api/homes?unit=${unitId}`);
        filtered = homeRes.data;
      } else {
        // ดึงบ้านทั้งหมด
        const homeRes = await axios.get("http://localhost:3001/api/homes");
        filtered = homeRes.data;
      }
      if (homeTypeName) {
        filtered = filtered.filter(h => h.hType === homeTypeName);
      }
      setHomes(filtered);
    } catch {
      setHomes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [homeTypeName, unitId]);

  useEffect(() => {
    // โหลด guest ของแต่ละบ้าน
    async function fetchGuests() {
      if (homes.length === 0) return;
      const all = {};
      await Promise.all(homes.map(async (home) => {
        try {
          const res = await axios.get(`http://localhost:3001/api/guests/home/${home.home_id}`);
          all[home.home_id] = res.data;
        } catch {
          all[home.home_id] = [];
        }
      }));
      setGuestsByHome(all);
    }
    fetchGuests();
  }, [homes]);

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
        <Sidebar reloadTrigger={sidebarReload} />
        <div style={{ flex: 1, padding: "32px" }}>
          {/* ปุ่มเพิ่มบ้านขวาบน */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16 }}>
            <button
              onClick={() => setShowAddHome(true)}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontWeight: 500,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59,130,246,0.12)"
              }}
            >
              + เพิ่มบ้าน
            </button>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
            {(homeTypeName && unitName)
              ? `${homeTypeName} ${unitName}`
              : (homeTypeName || unitName || "เลือกประเภทบ้าน")}
          </h2>
          <ToastContainer />
          {/* Modal เพิ่มบ้าน */}
          <AddHomeModal
            isOpen={showAddHome}
            onClose={() => setShowAddHome(false)}
            onSuccess={() => {
              setShowAddHome(false);
              fetchData();
              setSidebarReload(Date.now()); // trigger sidebar reload
            }}
            homeTypeId={homeTypeIdFromSidebar}
          />
          {loading ? (
            <div style={{ color: "#19b0d9", fontWeight: "bold", fontSize: 18 }}>
              กำลังโหลดข้อมูล...
            </div>
          ) : homes.length === 0 ? (
            <div style={{ color: "#ef4444", fontWeight: "bold" }}>
              ไม่มีบ้านในพื้นที่นี้
            </div>
          ) : (
            <div className="home-list" style={{
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)", // 4 อันต่อแถว
  gap: "32px",
  justifyContent: "start"
}}>
              {homes.map(home => {
  const guests = guestsByHome[home.home_id] || [];
  const rightHolder = guests.find(g => g.is_right_holder === 1);
  const guestCount = guests.length;

  return (
    <div key={home.home_id} className="home-card" style={{
      background: "linear-gradient(180deg, #23293b 80%, #23293b 100%)",
      borderRadius: "18px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      padding: "0 0 24px 0",
      minHeight: "520px", // ปรับความสูงให้สูงขึ้น
      maxWidth: "380px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      position: "relative"
    }}>
      {/* ส่วนบน: รูปบ้าน */}
      <div style={{
  width: "100%",
  height: "160px",
  background: "#23293b",
  borderTopLeftRadius: "18px",
  borderTopRightRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
}}>
  {home.image ? (
    <img
      src={`http://localhost:3001/uploads/${home.image}`}
      alt="บ้าน"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }}
    />
  ) : (
    <div style={{
      color: "#fff",
      fontWeight: "bold",
      fontSize: "22px",
      textAlign: "center",
      padding: "0 12px",
      width: "auto",
      height: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      กรุณาเพิ่มรูปภาพ
    </div>
  )}
</div>

      {/* ข้อมูลบ้าน */}
      <div style={{ padding: "24px 24px 0 24px", flex: 1 }}>
        {/* กล่องผู้ถือสิทธิ์ ด้านบน */}
        {rightHolder && (
          <div style={{
            background: "#111827",
            borderRadius: "10px",
            padding: "12px 20px",
            color: "#fff",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 18,
            border: "2px solid #38bdf8"
          }}>
            {rightHolder.image_url ? (
              <img  
                src={`http://localhost:3001${rightHolder.image_url}`}
                alt="ผู้ถือสิทธิ"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #38bdf8",
                  marginRight: 12
                }}
              />
            ) : (
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#374151",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: "bold",
                border: "2px solid #38bdf8",
                marginRight: 12
              }}>
                👤
              </div>
            )}
            <div>
              <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                {rightHolder.name} {rightHolder.lname}
              </div>
              <div style={{ fontSize: "15px", opacity: 0.85 }}>ผู้ถือสิทธิ</div>
            </div>
          </div>
        )}
        {/* เลขที่บ้าน ด้านล่าง */}
        <div style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#fff",
          marginBottom: 16,
          letterSpacing: "1px"
        }}>
          เลขที่: {home.Address}
        </div>
        <div style={{ fontSize: "16px", color: "#fff", marginBottom: 6 }}>
          ผู้พักอาศัย: {guestCount} คน
        </div>
        <div style={{ fontSize: "16px", color: guestCount > 0 ? "#22c55e" : "#ef4444", marginBottom: 6 }}>
          สถานะ: {guestCount > 0 ? "มีผู้พักอาศัย" : "ไม่มีผู้พักอาศัย"}
        </div>
      </div>
      {/* ปุ่ม */}
      <div style={{
        display: "flex",
        gap: 12,
        padding: "0 24px",
        marginTop: "auto"
      }}>
        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 0",
            fontWeight: 500,
            fontSize: "16px",
            flex: 1,
            cursor: "pointer"
          }}
          onClick={() => setShowAddGuestHomeId(home.home_id)}
        >
          เพิ่มเข้าพัก
        </button>
        <button
          style={{
            background: "#6b7280",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 0",
            fontWeight: 500,
            fontSize: "16px",
            flex: 1,
            cursor: "pointer"
          }}
          onClick={() => navigate(`/guestview/${home.home_id}`)}
        >
          รายละเอียด
        </button>
        <button
          style={{
            background: "#f59e42",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 0",
            fontWeight: 500,
            fontSize: "16px",
            flex: 1,
            cursor: "pointer"
          }}
          onClick={() => setShowEditHomeId(home.home_id)}
        >
          แก้ไข
        </button>
      </div>
    </div>
  );
})}
            </div>
          )}
        </div>
      </div>
      {/* Modal เพิ่มเข้าพัก */}
      {showAddGuestHomeId && (
        <AddGuestModal
          isOpen={true}
          onClose={() => setShowAddGuestHomeId(null)}
          homeId={showAddGuestHomeId}
          onUpdate={() => {
            setShowAddGuestHomeId(null);
            fetchData();
            setSidebarReload(Date.now()); // trigger sidebar reload
          }}
        />
      )}
      {/* Modal แก้ไขบ้าน */}
      {showEditHomeId && (
        <EditHomeModal
          isOpen={showEditHomeId !== null}
          onClose={() => setShowEditHomeId(null)}
          homeId={showEditHomeId}
          onUpdate={fetchData} // ส่งฟังก์ชัน fetchData มาด้วย
        />
      )}
    </div>
  );
}