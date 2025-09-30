import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import "../ca.css"; // เพิ่ม import CSS

export default function TwinHomeListPage2() {
  const [homes, setHomes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3001/api/homes")
      .then(res => {
        console.log("All homes data:", res.data); // Debug ข้อมูลทั้งหมด
        const twins2 = res.data
          .filter(h => h.hType === "บ้านพักแฝดพื้นที่2")
          .sort((a, b) => parseInt(a.Address, 10) - parseInt(b.Address, 10));
        console.log("Filtered twins2 data:", twins2); // Debug ข้อมูลที่ filter แล้ว
        setHomes(twins2);
      })
      .catch(err => {
        console.error("Error fetching homes:", err);
      });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar ซ้าย */}
      <Sidebar />
      {/* Content ขวา */}
      <div style={{ flex: 1 }}>
        <h2
          style={{
            textAlign: "center",
            marginTop: 32,
            marginBottom: 24,
          }}
        >
          บ้านประเภท: บ้านพักแฝดพื้นที่ 2
        </h2>
        <div style={{ padding: 32 }}>
          <div className="movie-container">
            {homes.length === 0 ? (
              <div className="no-data">
                ไม่มีบ้านประเภทบ้านพักแฝดพื้นที่ 2
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
                      {home.hType || "บ้านพักแฝด"}
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
    </div>
  );
}