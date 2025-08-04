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

  const handleDelete = async (guest) => {
    if (!guest.id) {
      toast.error("ไม่พบ ID ของผู้พักอาศัย");
      return;
    }
    
    const confirmToast = toast(
      ({ closeToast }) => (
        <div style={{ padding: '10px' }}>
          <div style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
            ยืนยันการลบข้อมูล
          </div>
          <div style={{ marginBottom: '15px', color: '#666' }}>
            ต้องการลบข้อมูล {guest.name} {guest.lname} หรือไม่?
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                closeToast();
                performDelete();
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              ลบ
            </button>
            <button
              onClick={closeToast}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ),
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        closeButton: false,
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          minWidth: '400px'
        }
      }
    );

    const performDelete = async () => {
      try {
        await axios.delete(`http://localhost:3001/api/guests/${guest.id}`);
        fetchGuests();
        
        toast.success(`ลบข้อมูล ${guest.name} ${guest.lname} เสร็จแล้ว!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
      } catch (error) {
        console.error('Error deleting guest:', error);
        toast.error("เกิดข้อผิดพลาดในการลบข้อมูล", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
  };

  const handleEdit = (guest) => {
    window.location.href = `/editguest/${guest.id}`;
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#fafbff",
      width: "100vw",
      overflow: "hidden"
    }}>
      <Navbar />
      
      <div style={{ 
        width: "100%",
        minHeight: "calc(100vh - 84px)",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* ปุ่มย้อนกลับ */}
        <div style={{ 
          padding: "16px 32px 0 32px",
          display: "flex",
          alignItems: "center"
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#6366f1",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#4f46e5"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#6366f1"}
          >
            <span style={{ fontSize: "16px" }}>←</span>
            ย้อนกลับ
          </button>
        </div>

        <h2 style={{ 
          textAlign: "center", 
          marginTop: 16,
          marginBottom: 24,
          color: "#3b2566",
          fontSize: "28px",
          fontWeight: "bold"
        }}>
          รายชื่อผู้พักอาศัย
          {homeInfo && (
            <div style={{
              fontSize: "20px",
              color: "#666",
              fontWeight: "normal",
              marginTop: "8px"
            }}>
              {homeInfo.hType} - บ้านเลขที่ {homeInfo.Address}
            </div>
          )}
        </h2>
        
        <div style={{ 
          padding: "0 32px 32px 32px",
          width: "100%",
          boxSizing: "border-box",
          flex: 1,
          overflow: "auto"
        }}>
          <div style={{ 
            width: "100%",
            minHeight: "400px"
          }}>
            <GuestTable
              guests={guests}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            
            {guests.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#666",
                fontSize: "18px"
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