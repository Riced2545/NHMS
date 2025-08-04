import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Sidebars";
import Navbar from "../../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import EditHomeModal from "../../component/EditHome";
import AddGuestModal from "../../../components/guest/Addguest/Addguest";
import "../ca.css";
import "../shared-styles.css";

export default function Twin1ListPage() {
  const [homes, setHomes] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  const navigate = useNavigate();

  const fetchHomes = () => {
    axios.get("http://localhost:3001/api/homes")
      .then(res => {
        const twin1Homes = res.data
          .filter(h => h.hType === "บ้านพักแฝดพื้นที่1")
          .sort((a, b) => parseInt(a.Address, 10) - parseInt(b.Address, 10));
        setHomes(twin1Homes);
      })
      .catch(err => {
        console.error("Error fetching homes:", err);
      });
  };

  useEffect(() => {
    fetchHomes();
  }, []);

  const handleEditHome = (homeId) => {
    setSelectedHomeId(homeId);
    setIsEditModalOpen(true);
  };

  const handleAddGuest = (homeId) => {
    setSelectedHomeId(homeId);
    setIsAddGuestModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedHomeId(null);
  };

  const handleCloseAddGuestModal = () => {
    setIsAddGuestModalOpen(false);
    setSelectedHomeId(null);
  };

  const handleUpdateSuccess = () => {
    fetchHomes();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafbff" }}>
      <Navbar />
      
      <div style={{ display: "flex", minHeight: "calc(100vh - 84px)" }}>
        <Sidebar />
        
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            textAlign: "center", 
            marginTop: 32, 
            marginBottom: 24,
            color: "#3b2566",
            fontSize: "28px",
            fontWeight: "bold"
          }}>
            บ้านประเภท: บ้านพักแฝดพื้นที่1
          </h2>
          
          <div style={{ padding: 32 }}>
            <div className="movie-container">
              {homes.length === 0 ? (
                <div className="no-data">
                  ไม่มีบ้านประเภทบ้านพักแฝดพื้นที่1
                </div>
              ) : (
                homes.map((home, index) => (
                  <React.Fragment key={home.home_id}>
                    {/* เส้นขีดคั่นทุกๆ 4 การ์ด */}
                    {index > 0 && index % 4 === 0 && (
                      <div style={{
                        gridColumn: '1 / -1',
                        width: '100%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent 0%, #cbd5e1 10%, #94a3b8 30%, #6b7280 50%, #94a3b8 70%, #cbd5e1 90%, transparent 100%)',
                        margin: '2rem 0',
                        borderRadius: '1px'
                      }} />
                    )}
                    
                    <div className="movie-card">
                      <div className="movie-poster">
                        <img
                          src={
                            home.image
                              ? `http://localhost:3001/uploads/${home.image}`
                              : "/img/house-default.png"
                          }
                          alt="บ้าน"
                        />
                        <div className="status-badge">
                          {home.status || "ว่าง"}
                        </div>
                      </div>
                      <div className="movie-info">
                        <div className="movie-date">
                          {new Date(home.created_at).toLocaleDateString('th-TH')}
                        </div>
                        <h3 className="movie-title">
                          {home.hType || "บ้านพักแฝดพื้นที่1"}
                        </h3>
                        <div className="movie-details">
                          <div className="detail-item">
                            <strong>หมายเลขบ้าน:</strong> {home.Address}
                          </div>
                          <div className="detail-item">
                            <strong>จำนวนผู้พัก:</strong> {home.guest_count || 0}/4 คน
                          </div>
                          <div className="detail-item">
                            <strong>สถานะ:</strong> 
                            <span className={`status ${home.guest_count >= 4 ? 'full' : 'available'}`}>
                              {home.guest_count >= 4 ? 'เต็ม' : home.status}
                            </span>
                          </div>
                        </div>
                        <div className="movie-actions">
                          <button
                            className={`btn-primary ${home.guest_count >= 4 ? 'disabled' : ''}`}
                            onClick={() => handleAddGuest(home.home_id)}
                            disabled={home.guest_count >= 4}
                          >
                            {home.guest_count >= 4 ? 'เต็มแล้ว' : 'เพิ่มเข้าพัก'}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => navigate(`/guestview/${home.home_id}`)}
                          >
                            รายละเอียด
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleEditHome(home.home_id)}
                          >
                            ✏️ แก้ไข
                          </button>
                        </div>
                        {home.guest_count >= 4 && (
                          <div className="warning-message">
                            บ้านนี้มีผู้พักอาศัยครบ 4 คนแล้ว
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Home Modal */}
      <EditHomeModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        homeId={selectedHomeId}
        onUpdate={handleUpdateSuccess}
      />

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={isAddGuestModalOpen}
        onClose={handleCloseAddGuestModal}
        homeId={selectedHomeId}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}