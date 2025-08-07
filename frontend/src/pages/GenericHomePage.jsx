// สร้างไฟล์ frontend/src/pages/GenericHomePage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Sidebar";
import Sidebar from "./typepage/Sidebars";
import EditHomeModal from "../pages/component/EditHome";
import AddGuestModal from "../components/guest/Addguest/Addguest";
import "../styles/home.css";

export default function GenericHomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const homeTypeName = searchParams.get('type');
  
  const [homes, setHomes] = useState([]);
  const [selectedRow, setSelectedRow] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [townhomeRows, setTownhomeRows] = useState([]);
  const [twinAreas, setTwinAreas] = useState([]);
  const [rowCounts, setRowCounts] = useState({});
  const [areaCounts, setAreaCounts] = useState({});

  // State สำหรับ Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState(null);

  useEffect(() => {
    if (homeTypeName) {
      fetchHomes();
      // โหลดข้อมูลเพิ่มเติมถ้าจำเป็น
      if (homeTypeName === 'บ้านพักแฝด') {
        loadTwinAreas();
      } else if (homeTypeName === 'บ้านพักเรือนแถว') {
        loadTownhomeRows();
      }
    }
  }, [homeTypeName, selectedRow, selectedArea]);

  const fetchHomes = () => {
    axios.get("http://localhost:3001/api/homes")
      .then(async (res) => {
        // กรองตามประเภทบ้าน
        const filteredHomes = res.data.filter(h => h.hType === homeTypeName);
        
        // โหลดข้อมูลผู้ถือสิทธิสำหรับแต่ละบ้าน
        const homesWithRightHolders = await Promise.all(
          filteredHomes.map(async (home) => {
            try {
              const guestsResponse = await axios.get(`http://localhost:3001/api/guests/home/${home.home_id}`);
              const rightHolder = guestsResponse.data.find(guest => guest.is_right_holder === 1);
              return {
                ...home,
                right_holder: rightHolder || null
              };
            } catch (error) {
              console.error(`Error fetching guests for home ${home.home_id}:`, error);
              return {
                ...home,
                right_holder: null
              };
            }
          })
        );

        // กรองเพิ่มเติมตาม dropdown
        let finalHomes = homesWithRightHolders;
        if (homeTypeName === 'บ้านพักแฝด' && selectedArea !== "all") {
          finalHomes = homesWithRightHolders.filter(h => h.twin_area_id == selectedArea);
        } else if (homeTypeName === 'บ้านพักเรือนแถว' && selectedRow !== "all") {
          finalHomes = homesWithRightHolders.filter(h => h.row_id == selectedRow);
        }
        
        setHomes(finalHomes);
        calculateCounts(filteredHomes);
      })
      .catch(err => {
        console.error("Error fetching homes:", err);
      });
  };

  const calculateCounts = (allHomes) => {
    if (homeTypeName === 'บ้านพักแฝด') {
      const counts = { total: allHomes.length };
      twinAreas.forEach(area => {
        counts[area.id] = allHomes.filter(h => h.twin_area_id == area.id).length;
      });
      setAreaCounts(counts);
    } else if (homeTypeName === 'บ้านพักเรือนแถว') {
      const counts = { total: allHomes.length };
      townhomeRows.forEach(row => {
        counts[row.id] = allHomes.filter(h => h.row_id == row.id).length;
      });
      setRowCounts(counts);
    }
  };

  const loadTwinAreas = () => {
    axios.get("http://localhost:3001/api/twin-areas")
      .then(res => setTwinAreas(res.data))
      .catch(err => console.error("Error loading twin areas:", err));
  };

  const loadTownhomeRows = () => {
    axios.get("http://localhost:3001/api/townhome-rows")
      .then(res => setTownhomeRows(res.data))
      .catch(err => console.error("Error loading townhome rows:", err));
  };

  const handleRowChange = (rowId) => {
    setSelectedRow(rowId);
  };

  const handleAreaChange = (areaId) => {
    setSelectedArea(areaId);
  };

  // ฟังก์ชันสำหรับ Modal
  const handleAddGuest = (homeId) => {
    setSelectedHomeId(homeId);
    setIsAddGuestModalOpen(true);
  };

  const handleEditHome = (homeId) => {
    setSelectedHomeId(homeId);
    setIsEditModalOpen(true);
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

  // ฟังก์ชันตรวจสอบความจุสูงสุด
  const getMaxCapacity = (home) => {
    // กำหนดให้ทุกประเภทบ้านมีความจุสูงสุด 6 คน
    return 6;
  };

  const isHomeFull = (home) => {
    const maxCapacity = getMaxCapacity(home);
    return home.guest_count >= maxCapacity;
  };

  if (!homeTypeName) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafbff" }}>
        <Navbar />
        <div style={{ padding: "32px", textAlign: "center" }}>
          <h2>กรุณาเลือกประเภทบ้านจาก Sidebar</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafbff" }}>
      <Navbar />
      
      <div style={{ display: "flex", minHeight: "calc(100vh - 84px)" }}>
        <Sidebar 
          selectedRow={selectedRow}
          onRowChange={handleRowChange}
          rowCounts={rowCounts}
          townhomeRows={townhomeRows}
          selectedArea={selectedArea}
          onAreaChange={handleAreaChange}
          areaCounts={areaCounts}
          twinAreas={twinAreas}
        />
        
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            textAlign: "center", 
            marginTop: 32, 
            marginBottom: 24,
            color: "#3b2566",
            fontSize: "28px",
            fontWeight: "bold"
          }}>
            บ้านประเภท: {homeTypeName}
            {homeTypeName === 'บ้านพักแฝด' && selectedArea !== "all" && 
              ` (${twinAreas.find(a => a.id == selectedArea)?.name || `พื้นที่ ${selectedArea}`})`
            }
            {homeTypeName === 'บ้านพักเรือนแถว' && selectedRow !== "all" && 
              ` (${townhomeRows.find(r => r.id == selectedRow)?.name || `แถว ${selectedRow}`})`
            }
          </h2>
          
          <div style={{ padding: 32 }}>
            <div className="movie-container">
              {homes.length === 0 ? (
                <div className="no-data">
                  ไม่มีบ้านประเภท {homeTypeName} ในระบบ
                </div>
              ) : (
                homes.map((home) => (
                  <div key={home.home_id} className="movie-card">
                    <div className="movie-poster">
                      {/* รูปบ้าน */}
                      <div className="house-image-container">
                        <img
                          src={
                            home.image
                              ? `http://localhost:3001/uploads/${home.image}`
                              : "/img/house-default.png"
                          }
                          alt="บ้าน"
                          className="house-image"
                        />
                      </div>

                      {/* รูปผู้ถือสิทธิ (ถ้ามี) */}
                      {home.right_holder && (
                        <div className="right-holder-image-container">
                          <img
                            src={
                              home.right_holder.image_url
                                ? `http://localhost:3001${home.right_holder.image_url}`
                                : "/img/default-person.png"
                            }
                            alt="ผู้ถือสิทธิ"
                            className="right-holder-image"
                          />
                          <div className="right-holder-info">
                            <span className="right-holder-name">
                              {home.right_holder.name} {home.right_holder.lname}
                            </span>
                            <span className="right-holder-label">ผู้ถือสิทธิ</span>
                          </div>
                        </div>
                      )}

                      <div className="status-badge">
                        {home.status || "ว่าง"}
                      </div>
                    </div>

                    <div className="movie-info">
                      <h3 className="movie-title">
                        <strong>บ้านเลขที่:</strong> {home.Address}
                      </h3>
                      <div className="movie-details">
                        <div className="detail-item">
                          <strong>ประเภท:</strong> {home.hType}
                        </div>
                        
                        {/* แสดงพื้นที่สำหรับบ้านพักแฝด */}
                        {homeTypeName === 'บ้านพักแฝด' && (
                          <div className="detail-item">
                            <strong>พื้นที่:</strong> {
                              home.twin_area_id 
                                ? twinAreas.find(area => area.id === home.twin_area_id)?.name || `พื้นที่ ${home.twin_area_id}`
                                : "ไม่ระบุพื้นที่"
                            }
                          </div>
                        )}
                        
                        {/* แสดงแถวสำหรับบ้านพักเรือนแถว */}
                        {homeTypeName === 'บ้านพักเรือนแถว' && (
                          <div className="detail-item">
                            <strong>แถว:</strong> {
                              home.row_id 
                                ? townhomeRows.find(row => row.id === home.row_id)?.name || `แถว ${home.row_id}`
                                : "ไม่ระบุแถว"
                            }
                          </div>
                        )}
                        
                        {/* แสดงข้อมูลผู้ถือสิทธิ */}
                        {home.right_holder && (
                          <div className="detail-item">
                            <strong>ผู้ถือสิทธิ:</strong> {home.right_holder.name} {home.right_holder.lname}
                          </div>
                        )}
                        
                        <div className="detail-item">
                          <strong>ผู้พักอาศัย:</strong> {home.guest_count || 0}/{getMaxCapacity(home)} คน
                        </div>
                        <div className="detail-item">
                          <strong>สถานะ:</strong> 
                          <span className={`status ${isHomeFull(home) ? 'full' : 'available'}`}>
                            {isHomeFull(home) ? 'เต็ม' : (home.status || "ว่าง")}
                          </span>
                        </div>
                      </div>
                      <div className="movie-actions">
                        <button
                          className={`btn-primary ${isHomeFull(home) ? 'disabled' : ''}`}
                          onClick={() => handleAddGuest(home.home_id)}
                          disabled={isHomeFull(home)}
                        >
                          {isHomeFull(home) ? 'เต็มแล้ว' : 'เพิ่มเข้าพัก'}
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
                      {isHomeFull(home) && (
                        <div className="warning-message">
                          บ้านนี้มีผู้พักอาศัยครบ {getMaxCapacity(home)} คนแล้ว
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

      {/* Modal Components */}
      <EditHomeModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        homeId={selectedHomeId}
        onUpdate={handleUpdateSuccess}
      />

      <AddGuestModal
        isOpen={isAddGuestModalOpen}
        onClose={handleCloseAddGuestModal}
        homeId={selectedHomeId}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}