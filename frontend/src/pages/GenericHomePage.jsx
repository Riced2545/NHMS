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

  // โหลดข้อมูลบ้านใน unit ที่เลือก
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (unitId) {
          const unitRes = await axios.get(`http://localhost:3001/api/home_unit/${unitId}`);
          setUnitName(unitRes.data?.unit_name || "");
        }
        const homeRes = await axios.get("http://localhost:3001/api/homes");
        let filtered = homeRes.data;
        if (homeTypeName) {
          filtered = filtered.filter(h => h.hType === homeTypeName);
        }
        if (unitId) {
          filtered = filtered.filter(h => String(h.unit_id) === String(unitId));
        }
        setHomes(filtered);
      } catch {
        setHomes([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [homeTypeName, unitId]);

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
        <Sidebar setHomeTypeId={setHomeTypeIdFromSidebar} /> {/* ส่ง down function สำหรับ set homeTypeId */}
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
              // reload homes
              // fetchData(); // ถ้าอยาก reload อัตโนมัติหลังเพิ่มบ้าน
            }}
            homeTypeId={homeTypeIdFromSidebar} // ส่ง homeTypeId ไปยัง modal
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
      gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
      gap: "32px",
      justifyItems: "center"
    }}>
              {homes.map(home => (
                <div key={home.home_id} className="home-card" style={{
      background: "linear-gradient(180deg, #23293b 80%, #23293b 100%)",
      borderRadius: "18px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      padding: "0 0 24px 0",
      minHeight: "420px",
      maxWidth: "380px", // ฟิกขนาด card
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      position: "relative"
    }}>
                  {/* รูปภาพ */}
      <div style={{
        height: "160px",
        background: "#23293b",
        borderTopLeftRadius: "18px",
        borderTopRightRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "18px"
      }}>
        {home.image
          ? <img src={`http://localhost:3001/uploads/${home.image}`} alt="บ้าน" style={{ maxHeight: "100%", maxWidth: "100%", borderRadius: "12px" }} />
          : "กรุณาเพิ่มรูปภาพ"
        }
      </div>
      {/* Badge สถานะ */}
      <div style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "#111827",
        color: "#fff",
        borderRadius: "8px",
        padding: "4px 14px",
        fontSize: "14px",
        fontWeight: 500
      }}>
        {home.status === "มีผู้พักอาศัย" ? "มีผู้พักอาศัย" : "ไม่มีผู้พักอาศัย"}
      </div>
      {/* ข้อมูลบ้าน */}
      <div style={{ padding: "24px 24px 0 24px", flex: 1 }}>
        <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fff", marginBottom: 8 }}>
          เลขที่: {home.Address}
        </div>
        <div style={{ fontSize: "16px", color: "#fff", marginBottom: 6 }}>
          ผู้พักอาศัย: 0 คน
        </div>
        <div style={{ fontSize: "16px", color: home.status === "มีผู้พักอาศัย" ? "#22c55e" : "#ef4444", marginBottom: 6 }}>
          สถานะ: {home.status === "มีผู้พักอาศัย" ? "มีผู้พักอาศัย" : "ไม่มีผู้พักอาศัย"}
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
          onClick={() => navigate(`/home-detail/${home.home_id}`)}
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
              ))}
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
            // fetchData(); // reload homes ถ้าต้องการ
          }}
        />
      )}
      {/* Modal แก้ไขบ้าน */}
      {showEditHomeId && (
        <EditHomeModal
          isOpen={true}
          onClose={() => setShowEditHomeId(null)}
          homeId={showEditHomeId}
          onUpdate={() => {
            setShowEditHomeId(null);
            // fetchData(); // reload homes ถ้าต้องการ
          }}
        />
      )}
    </div>
  );
}