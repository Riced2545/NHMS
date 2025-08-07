import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Sidebars";
import Navbar from "../../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import EditHomeModal from "../../component/EditHome";
import AddGuestModal from "../../../components/guest/Addguest/Addguest";
import "../ca.css";
import "../shared-styles.css";

export default function TwinHomeAllPage() {
  const [homes, setHomes] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  
  // เพิ่ม state สำหรับ twin areas
  const [selectedArea, setSelectedArea] = useState("all");
  const [twinAreas, setTwinAreas] = useState([]);
  const [areaCounts, setAreaCounts] = useState({});
  
  // เก็บ state เดิมสำหรับ townhome rows (ไม่ใช้แต่ต้องส่งให้ Sidebar)
  const [selectedRow, setSelectedRow] = useState("all");
  const [townhomeRows, setTownhomeRows] = useState([]);
  const [rowCounts, setRowCounts] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    // โหลดข้อมูล twin areas
    axios.get("http://localhost:3001/api/twin-areas")
      .then(res => {
        console.log("Twin areas loaded:", res.data);
        setTwinAreas(res.data);
      })
      .catch(err => {
        console.error("Error loading twin areas:", err);
        // ใช้ข้อมูลสำรองถ้าโหลดไม่ได้
        setTwinAreas([
          { id: 1, name: 'พื้นที่ 1', max_capacity: 6, home_count: 0 },
          { id: 2, name: 'พื้นที่ 2', max_capacity: 4, home_count: 0 }
        ]);
      });
  }, []);

  const fetchHomes = () => {
    axios.get("http://localhost:3001/api/homes")
      .then(res => {
        console.log("📊 All homes data:", res.data);
        
        // กรองเฉพาะบ้านพักแฝด
        const twinHomes = res.data.filter(h => h.hType === "บ้านพักแฝด");
        
        // กรองตาม selectedArea
        const filteredHomes = selectedArea === "all" 
          ? twinHomes 
          : twinHomes.filter(h => h.twin_area_id == selectedArea);
          
        console.log("🎯 Filtered twin homes:", filteredHomes);
        
        // คำนวณจำนวนบ้านในแต่ละพื้นที่
        const counts = { total: twinHomes.length };
        twinAreas.forEach(area => {
          counts[area.id] = twinHomes.filter(h => h.twin_area_id == area.id).length;
        });
        
        console.log("Area counts:", counts);
        
        setHomes(filteredHomes);
        setAreaCounts(counts);
      })
      .catch(err => {
        console.error("Error fetching homes:", err);
      });
  };

  useEffect(() => {
    fetchHomes();
  }, [selectedArea, twinAreas]);

  // Handler สำหรับเปลี่ยนพื้นที่
  const handleAreaChange = (areaId) => {
    console.log("Area changed to:", areaId);
    setSelectedArea(areaId);
  };

  // Handler สำหรับ townhome rows (ไม่ใช้แต่ต้องมี)
  const handleRowChange = (rowId) => {
    console.log("Row changed to:", rowId);
    setSelectedRow(rowId);
  };

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
            บ้านประเภท: บ้านพักแฝด ({selectedArea === "all" ? "ทั้งหมด" : twinAreas.find(a => a.id == selectedArea)?.name || `พื้นที่ ${selectedArea}`})
          </h2>
          
          <div style={{ padding: 32 }}>
            <div className="movie-container">
              {homes.length === 0 ? (
                <div className="no-data">
                  {selectedArea === "all" 
                    ? "ไม่มีบ้านประเภทบ้านพักแฝด" 
                    : `ไม่มีบ้านในพื้นที่ที่เลือก`
                  }
                </div>
              ) : (
                homes.map((home, index) => (
                  <React.Fragment key={home.home_id}>
                    {/* เนื้อหา card เดิม... */}
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
                        <h3 className="movie-title">
                          <strong>บ้านเลขที่:</strong> {home.Address}
                        </h3>
                        <div className="movie-details">
                          <div className="detail-item">
                            <strong>
                              {home.hType || "บ้านพักแฝด"} - {
                                home.twin_area_id 
                                  ? twinAreas.find(area => area.id === home.twin_area_id)?.name || `พื้นที่ ${home.twin_area_id}`
                                  : "ไม่ระบุพื้นที่"
                              }
                            </strong>
                          </div>
                          <div className="detail-item">
                            <strong>จำนวนผู้พัก:</strong> {home.guest_count || 0}/{home.hType === "บ้านพักแฝดพื้นที่1" ? "6" : "6"} คน
                          </div>
                          <div className="detail-item">
                            <strong>สถานะ:</strong> 
                            <span className={`status ${
                              (home.hType === "บ้านพักแฝดพื้นที่1" && home.guest_count >= 6) ||
                              (home.hType === "บ้านพักแฝดพื้นที่2" && home.guest_count >= 4)
                                ? 'full' : 'available'
                            }`}>
                              {((home.hType === "บ้านพักแฝดพื้นที่1" && home.guest_count >= 6) ||
                                (home.hType === "บ้านพักแฝดพื้นที่2" && home.guest_count >= 4))
                                ? 'เต็ม' : home.status}
                            </span>
                          </div>
                        </div>
                        <div className="movie-actions">
                          <button
                            className={`btn-primary ${
                              ((home.hType === "บ้านพักแฝดพื้นที่1" && home.guest_count >= 6) ||
                               (home.hType === "บ้านพักแฝดพื้นที่2" && home.guest_count >= 4))
                                ? 'disabled' : ''
                            }`}
                            onClick={() => handleAddGuest(home.home_id)}
                            disabled={
                              (home.hType === "บ้านพักแฝดพื้นที่1" && home.guest_count >= 6) ||
                              (home.hType === "บ้านพักแฝดพื้นที่2" && home.guest_count >= 4)
                            }
                          >
                            {((home.hType === "บ้านพักแฝดพื้นที่1" && home.guest_count >= 6) ||
                              (home.hType === "บ้านพักแฝดพื้นที่2" && home.guest_count >= 4))
                              ? 'เต็มแล้ว' : 'เพิ่มเข้าพัก'}
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
                        {((home.hType === "บ้านพักแฝดพื้นที่1" && home.guest_count >= 6) ||
                          (home.hType === "บ้านพักแฝดพื้นที่2" && home.guest_count >= 4)) && (
                          <div className="warning-message">
                            บ้านนี้มีผู้พักอาศัยครบ {home.hType === "บ้านพักแฝดพื้นที่1" ? "6" : "4"} คนแล้ว
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