import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import GuestTable from "./GuestTable";
import Navbar from "../Sidebar";
import "../../utils/dateUtils";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function ViewGuest() {
  const [guests, setGuests] = useState([]);
  const [homeInfo, setHomeInfo] = useState(null);
  const { home_id } = useParams();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchGuests = () => {
    axios.get(`http://localhost:3001/api/guests/home/${home_id}`)
      .then(res => setGuests(res.data))
      .catch(() => setGuests([]));
  };

  const fetchHomeInfo = () => {
    axios.get(`http://localhost:3001/api/homes/${home_id}`)
      .then(res => setHomeInfo(res.data))
      .catch(err => {
        console.error("Error fetching home info:", err);
        setHomeInfo(null);
      });
  };

  useEffect(() => {
    fetchGuests();
    fetchHomeInfo();
  }, [home_id]);

  const handleDelete = async ({ id }, showToast = true) => {
    if (!id) {
      toast.error("ไม่พบ ID ของผู้พักอาศัย");
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/api/guests/${id}`);
      fetchGuests();
      if (showToast) {
        toast.success("ลบข้อมูลเรียบร้อยแล้ว", { position: "top-right" });
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล", { position: "top-right" });
    }
  };

  const handleEdit = (guest) => {
    window.location.href = `/editguest/${guest.id}`;
  };

  // ฟังก์ชันลบทั้งหมดแบบ toast
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    toast(
      ({ closeToast }) => (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>ยืนยันการลบข้อมูล</div>
          <div style={{ marginBottom: 12 }}>
            ต้องการลบข้อมูลที่เลือกทั้งหมด ({selectedIds.length} รายการ) หรือไม่?
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={async () => {
                closeToast();
                for (const id of selectedIds) {
                  await handleDelete({ id }, false); // ไม่แจ้งเตือนแต่ละอัน
                }
                setSelectedIds([]);
                fetchGuests();
                toast.success("ลบข้อมูลเรียบร้อยแล้ว", { position: "top-right" }); // แจ้งเตือนแค่ครั้งเดียว
              }}
            >
              ลบ
            </button>
            <button
              style={{
                background: "#e5e7eb",
                color: "#333",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={closeToast}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ),
      { position: "top-right", autoClose: false }
    );
  };

  const handleDeleteWithConfirm = (guest) => {
    toast(
      ({ closeToast }) => (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>ยืนยันการลบข้อมูล</div>
          <div style={{ marginBottom: 12 }}>
            ต้องการลบข้อมูล {guest.name} {guest.lname} หรือไม่?
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={async () => {
                closeToast();
                await handleDelete({ id: guest.id }, true);
              }}
            >
              ลบ
            </button>
            <button
              style={{
                background: "#e5e7eb",
                color: "#333",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={closeToast}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ),
      { position: "top-right", autoClose: false }
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafbff',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <Navbar />
      
      <div style={{
        width: '100%',
        minHeight: 'calc(100vh - 84px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ปุ่มย้อนกลับ */}
        <div style={{
          padding: '16px 32px 0 32px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
          >
            <span style={{ fontSize: '16px' }}>←</span>
            ย้อนกลับ
          </button>
        </div>

        <h2 style={{
          textAlign: 'center',
          marginTop: '16px',
          marginBottom: '24px',
          color: '#3b2566',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          รายชื่อผู้พักอาศัย
          {homeInfo && (
            <div style={{
              fontSize: '20px',
              color: '#666',
              fontWeight: 'normal',
              marginTop: '8px'
            }}>
              {homeInfo.hType} - บ้านเลขที่ {homeInfo.Address}
            </div>
          )}
        </h2>
        
        <div style={{
          padding: '0 32px 32px 32px',
          width: '100%',
          boxSizing: 'border-box',
          flex: 1,
          overflow: 'auto'
        }}>
          <div style={{
            width: '100%',
            minHeight: '400px'
          }}>
            {/* ปุ่มลบทั้งหมด */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                style={{
                  background: selectedIds.length === 0 ? "#eee" : "#ef4444",
                  color: selectedIds.length === 0 ? "#888" : "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 18px",
                  fontWeight: "bold",
                  cursor: selectedIds.length === 0 ? "not-allowed" : "pointer"
                }}
              >
                🗑️ ลบทั้งหมด
              </button>
              <span style={{ color: "#666", fontSize: 14 }}>
                {selectedIds.length > 0 ? `เลือก ${selectedIds.length} รายการ` : ""}
              </span>
            </div>
            
            <GuestTable
              guests={guests}
              onEdit={handleEdit}
              onDelete={handleDeleteWithConfirm}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onSaved={fetchGuests} // เพิ่มตรงนี้
            />
            
            {guests.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                fontSize: '18px'
              }}>
                ไม่มีข้อมูลผู้พักอาศัย
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}