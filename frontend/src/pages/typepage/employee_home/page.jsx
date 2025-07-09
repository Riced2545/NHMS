import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import EditHomeModal from "../../component/EditHome";
import "../ca.css";

export default function EmployeeHomeListPage() {
  const [homes, setHomes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  const navigate = useNavigate();

  const fetchHomes = () => {
    axios.get("http://localhost:3001/api/homes")
      .then(res => {
        const employeeHouses = res.data
          .filter(h => h.hType === "บ้านพักลูกจ้าง")
          .sort((a, b) => parseInt(a.Address, 10) - parseInt(b.Address, 10));
        setHomes(employeeHouses);
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHomeId(null);
  };

  const handleUpdateSuccess = () => {
    fetchHomes();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <h2 style={{ textAlign: "center", marginTop: 32, marginBottom: 24 }}>
          บ้านประเภท: บ้านพักลูกจ้าง
        </h2>
        <div style={{ padding: 32 }}>
          <div className="movie-container">
            {homes.length === 0 ? (
              <div className="no-data">
                ไม่มีบ้านประเภทบ้านพักลูกจ้าง
              </div>
            ) : (
              homes.map((home) => (
                <div key={home.home_id} className="movie-card">
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
                      {home.hType || "บ้านพักลูกจ้าง"}
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
                        onClick={() => navigate(`/addguest/${home.home_id}`)}
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <EditHomeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        homeId={selectedHomeId}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}