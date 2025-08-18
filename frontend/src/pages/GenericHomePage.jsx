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
  const [isAddHomeModalOpen, setIsAddHomeModalOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState(null);

  // เพิ่ม state สำหรับเก็บ all homes
  const [allFilteredHomes, setAllFilteredHomes] = useState([]);

  useEffect(() => {
    if (homeTypeName) {
      // ✅ อ่าน query parameters และ set state
      const searchParams = new URLSearchParams(location.search);
      const areaParam = searchParams.get('area');
      const rowParam = searchParams.get('row');
      
      // ตั้งค่า filter ตาม query parameters
      if (areaParam && homeTypeName === 'บ้านพักแฝด') {
        setSelectedArea(areaParam);
      } else if (homeTypeName === 'บ้านพักแฝด') {
        setSelectedArea("all");
      }
      
      if (rowParam && homeTypeName === 'บ้านพักเรือนแถว') {
        setSelectedRow(rowParam);
      } else if (homeTypeName === 'บ้านพักเรือนแถว') {
        setSelectedRow("all");
      }
      
      const loadData = async () => {
        try {
          console.log("Loading data for:", homeTypeName);
          
          // โหลดข้อมูลเสริมก่อน
          if (homeTypeName === 'บ้านพักแฝด') {
            await loadTwinAreas();
          } else if (homeTypeName === 'บ้านพักเรือนแถว') {
            await loadTownhomeRows();
          }
          
          // จากนั้นค่อยโหลด homes
          fetchHomes();
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };
      
      loadData();
    }
  }, [homeTypeName, location.search]);

  // ✅ เพิ่ม useEffect สำหรับกรองข้อมูลใหม่เมื่อ filter เปลี่ยน
  useEffect(() => {
    if (allFilteredHomes.length > 0) {
      console.log("🔄 Re-filtering homes due to filter change");
      console.log("Selected Area:", selectedArea, "Selected Row:", selectedRow);
      console.log("Home Type:", homeTypeName);
      
      let finalHomes = allFilteredHomes;
      
      if (homeTypeName === 'บ้านพักแฝด' && selectedArea !== "all") {
        console.log("Filtering by area:", selectedArea);
        finalHomes = allFilteredHomes.filter(h => h.twin_area_id == selectedArea);
        console.log("Filtered homes by area:", finalHomes.length);
      } else if (homeTypeName === 'บ้านพักเรือนแถว' && selectedRow !== "all") {
        console.log("Filtering by row:", selectedRow);
        finalHomes = allFilteredHomes.filter(h => h.row_id == selectedRow);
        console.log("Filtered homes by row:", finalHomes.length);
      }
      
      console.log("Final homes to display:", finalHomes.length);
      setHomes(finalHomes);
      
      // ✅ แจ้ง Sidebar ให้อัปเดต
      if (window.refreshSidebar) {
        window.refreshSidebar();
      }
      window.dispatchEvent(new Event('homeDataUpdated'));
    }
  }, [selectedArea, selectedRow, allFilteredHomes, homeTypeName]);

  const fetchHomes = async () => {
    try {
      console.log("Fetching homes for:", homeTypeName);
      
      const res = await axios.get("http://localhost:3001/api/homes");
      const filteredHomes = res.data.filter(h => h.hType === homeTypeName);
      
      console.log("Filtered homes:", filteredHomes.length);
      console.log("Homes data:", filteredHomes.map(h => ({ id: h.home_id, address: h.Address, area: h.twin_area_id, row: h.row_id })));
      
      // เก็บ filteredHomes ใน state
      setAllFilteredHomes(filteredHomes);
      
      // โหลดข้อมูลผู้ถือสิทธิ
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

      // ✅ อัปเดต allFilteredHomes ด้วยข้อมูล right holders
      setAllFilteredHomes(homesWithRightHolders);
      
      // ✅ ไม่ต้องกรองที่นี่แล้ว เพราะจะกรองใน useEffect ข้างบน
      
    } catch (err) {
      console.error("Error fetching homes:", err);
    }
  };

  // เพิ่ม useEffect สำหรับคำนวณ counts เมื่อข้อมูลครบ
  useEffect(() => {
    if (allFilteredHomes.length > 0) {
      console.log("Calculating counts with all filtered homes...");
      
      if (homeTypeName === 'บ้านพักแฝด' && twinAreas.length > 0) {
        const counts = { total: allFilteredHomes.length };
        
        twinAreas.forEach(area => {
          const count = allFilteredHomes.filter(h => h.twin_area_id == area.id).length;
          counts[area.id] = count;
          console.log(`Area ${area.name} (${area.id}): ${count} homes`);
        });
        
        console.log("Final area counts:", counts);
        setAreaCounts(counts);
        
      } else if (homeTypeName === 'บ้านพักเรือนแถว' && townhomeRows.length > 0) {
        const counts = { total: allFilteredHomes.length };
        
        townhomeRows.forEach(row => {
          const count = allFilteredHomes.filter(h => h.row_id == row.id).length;
          counts[row.id] = count;
          console.log(`Row ${row.name} (${row.id}): ${count} homes`);
        });
        
        console.log("Final row counts:", counts);
        setRowCounts(counts);
      }
    }
  }, [allFilteredHomes, twinAreas, townhomeRows, homeTypeName]);

  const loadTwinAreas = () => {
    return axios.get("http://localhost:3001/api/twin-areas")
      .then(res => {
        console.log("Twin areas loaded:", res.data);
        setTwinAreas(res.data);
        return res.data; // ส่งข้อมูลกลับ
      })
      .catch(err => {
        console.error("Error loading twin areas:", err);
        return [];
      });
  };

  const loadTownhomeRows = () => {
    return axios.get("http://localhost:3001/api/townhome-rows")
      .then(res => {
        console.log("Townhome rows loaded:", res.data);
        setTownhomeRows(res.data);
        return res.data; // ส่งข้อมูลกลับ
      })
      .catch(err => {
        console.error("Error loading townhome rows:", err);
        return [];
      });
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

  const handleAddHome = () => {
    setIsAddHomeModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedHomeId(null);
  };

  const handleCloseAddGuestModal = () => {
    setIsAddGuestModalOpen(false);
    setSelectedHomeId(null);
  };

  const handleCloseAddHomeModal = () => {
    setIsAddHomeModalOpen(false);
  };

  const handleUpdateSuccess = () => {
    fetchHomes();
  };

  const handleAddHomeSuccess = () => {
    fetchHomes(); // รีเฟรชข้อมูล
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
        
        <div style={{ flex: 1, position: "relative" }}>
          {/* หัวข้ออยู่ตรงกลาง */}
          <div style={{ 
            textAlign: "center",
            padding: "32px 32px 24px 32px",
            marginBottom: 0
          }}>
            <h2 style={{ 
              color: "#3b2566",
              fontSize: "28px",
              fontWeight: "bold",
              margin: 0
            }}>
              {homeTypeName}
              {homeTypeName === 'บ้านพักแฝด' && selectedArea !== "all" && 
                ` (${twinAreas.find(a => a.id == selectedArea)?.name || `พื้นที่ ${selectedArea}`})`
              }
              {homeTypeName === 'บ้านพักเรือนแถว' && selectedRow !== "all" && 
                ` (${townhomeRows.find(r => r.id == selectedRow)?.name || `แถว ${selectedRow}`})`
              }
            </h2>
          </div>
          
          {/* ปุ่มเพิ่มบ้านอยู่มุมขวาบน */}
          {homes.length > 0 && (
          <button
            onClick={handleAddHome}
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "15  px 40px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
              transition: "all 0.3s ease",
              zIndex: 10
            }}
          >
            + เพิ่มบ้าน
          </button>
          )}
          {/* เนื้อหาที่เหลือ... */}
          <div style={{ 
            padding: "0 20px 32px 32px",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <div className="movie-container">
              {homes.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">🏠</div>
                  <h3 className="empty-state-title">
                    ไม่มีบ้านประเภท {homeTypeName} ในระบบ
                  </h3>
                  <button
                    className="empty-state-action"
                    onClick={handleAddHome}
                  >
                    + เพิ่มบ้านแรก
                  </button>
                </div>
              ) : (
                homes.map((home) => (
                  <div key={home.home_id} className="movie-card">
                    <div className="movie-poster">
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
                                : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%2310b981'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M12 14c-6 0-8 3-8 6h16c0-3-2-6-8-6z'/%3E%3C/svg%3E"
                            }
                            alt="ผู้ถือสิทธิ"
                            className="right-holder-image"
                            onError={(e) => {
                              console.log("Image load error for:", home.right_holder.image_url);
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%2310b981'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M12 14c-6 0-8 3-8 6h16c0-3-2-6-8-6z'/%3E%3C/svg%3E";
                            }}
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
                        <strong>เลขที่:</strong> {home.Address}
                      </h3>
                      <div className="movie-details">
                     
                        
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

      <AddHomeModal
        isOpen={isAddHomeModalOpen}
        onClose={handleCloseAddHomeModal}
        onSuccess={handleAddHomeSuccess}
        homeTypeName={homeTypeName}
      />

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
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}