import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Sidebar";
import "./viewhome.css";
import GuestTable from "../guest/GuestTable";

export default function ViewHome() {
  const { home_id } = useParams();
  const [home, setHome] = useState(null);
  const [guests, setGuests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3001/api/homes`)
      .then(res => {
        const found = res.data.find(h => String(h.home_id) === String(home_id));
        setHome(found);
      });
    axios.get(`http://localhost:3001/api/guests/home/${home_id}`)
      .then(res => setGuests(res.data));
  }, [home_id]);

  const handleDelete = async (guestId) => {
    if (window.confirm("คุณต้องการลบผู้พักอาศัยคนนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:3001/api/guests/${guestId}`);
        setGuests(guests.filter(g => g.id !== guestId));
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  if (!home) return <div>กำลังโหลดข้อมูลบ้าน...</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafbff",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Navbar เต็มจอ */}
      <div style={{
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000
      }}>
        <Navbar />
      </div>
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingTop: 90,
        paddingBottom: 32,
        width: "100vw",
        boxSizing: "border-box"
      }}>
        {/* รูปบ้านด้านซ้ายข้างนอก */}
        <div style={{
          flex: "0 0 480px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          borderRadius: 24,
          minHeight: 300,
          maxHeight: 300,
          boxShadow: "0 2px 12px #e5e7eb",
          marginRight: 36,
          marginLeft: 36,
          width: 300,
          height: 300,
        }}>
          <img
            src={home.image ? `http://localhost:3001/uploads/${home.image}` : "/img/house-default.png"}
            alt="home"
            style={{
              width: "100%",
              height: "100%",
              maxWidth: 300,
              maxHeight: 300,
              minWidth: 0,
              minHeight: 0,
              borderRadius: 16,
              objectFit: "cover",
              background: "#fff",
              boxShadow: "0 2px 12px #e5e7eb"
            }}
          />
        </div>
        {/* ตารางข้อมูลบ้านและผู้พักอาศัย */}
        <div style={{
          width: "100%",
          maxWidth: 1100,
          maxHeight: "100%",
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 4px 32px #e5e7eb",
          padding: "32px 32px 40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
          alignItems: "stretch"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{
              color: "#189ee9",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "2.3rem",
              marginBottom: 0
            }}>
              รายชื่อผู้พักอาศัย
            </h2>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                style={{
                  background: "#facc15",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 24px",
                  fontWeight: "bold",
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #fde68a"
                }}
                onClick={() => navigate(`/edithome/${home.home_id}`)}
              >
                ✏️ แก้ไขรายละเอียดบ้าน
              </button>
              <button
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 28px",
                  fontWeight: "bold",
                  fontSize: 18,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #a7f3d0"
                }}
                onClick={() => navigate(`/addguest/${home.home_id}`)}
              >
                + เพิ่มผู้พักอาศัย
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <GuestTable
              guests={guests}
              onEdit={g => window.location.href = `/editguest/${g.id}`}
              onDelete={g => handleDelete(g.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px 8px",
  fontWeight: "bold",
  color: "#189ee9",
  fontSize: "1.1rem",
  borderBottom: "1.5px solid #e5e7eb",
  background: "#eaf6fe",
  textAlign: "center"
};

const tdStyle = {
  padding: "12px 8px",
  fontSize: "1rem",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "center"
};

function formatThaiDate(dob) {
  if (!dob) return "";
  const date = new Date(dob);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear() + 543;
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  return `${day} ${monthNames[month]} ${year}`;
}