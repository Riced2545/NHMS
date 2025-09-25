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
  const subunitId = searchParams.get('subunit');

  const [homes, setHomes] = useState([]);
  const [subunitName, setSubunitName] = useState("");
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลบ้านใน subunit ที่เลือก
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // ดึงชื่อ subunit
        if (subunitId) {
          const subunitRes = await axios.get(`http://localhost:3001/api/subunit_home/${subunitId}`);
          setSubunitName(subunitRes.data?.name || "");
        }
        // ดึงบ้านใน subunit
        const homeRes = await axios.get("http://localhost:3001/api/homes");
        let filtered = homeRes.data;
        if (homeTypeName) {
          filtered = filtered.filter(h => h.hType === homeTypeName);
        }
        if (subunitId) {
          filtered = filtered.filter(h => String(h.subunit_id) === String(subunitId));
        }
        setHomes(filtered);
      } catch {
        setHomes([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [homeTypeName, subunitId]);

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
        <Sidebar />
        <div style={{ flex: 1, padding: "32px" }}>
          <h2 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
            บ้านใน {subunitName ? subunitName : "พื้นที่"}
          </h2>
          <ToastContainer />
          <div style={{ marginBottom: 24 }}>
            <AddHomeModal />
          </div>
          {loading ? (
            <div style={{ color: "#19b0d9", fontWeight: "bold", fontSize: 18 }}>
              กำลังโหลดข้อมูล...
            </div>
          ) : homes.length === 0 ? (
            <div style={{ color: "#ef4444", fontWeight: "bold" }}>
              ไม่มีบ้านในพื้นที่นี้
            </div>
          ) : (
            <div className="home-list">
              {homes.map(home => (
                <div key={home.home_id} className="home-card">
                  <div>เลขที่: {home.Address}</div>
                  <div>ประเภท: {home.hType}</div>
                  {/* เพิ่มปุ่ม/รายละเอียดอื่นๆ ตามต้องการ */}
                  <EditHomeModal home={home} />
                  <AddGuestModal homeId={home.home_id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}