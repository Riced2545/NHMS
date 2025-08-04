import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Sidebars";
import Navbar from "../../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import EditHomeModal from "../../component/EditHome";
import AddGuestModal from "../../../components/guest/Addguest/Addguest";
import "../ca.css";
import "../shared-styles.css";

export default function TownhomeListPage() {
  const [homes, setHomes] = useState([]);
  const [selectedRow, setSelectedRow] = useState("all");
  const [townhomeRows, setTownhomeRows] = useState([]); // เพิ่ม state นี้
  const [rowCounts, setRowCounts] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState(null);
  const navigate = useNavigate();

  // ฟังก์ชันดึงข้อมูลแถว
  const fetchTownhomeRows = async () => {
    try {
      console.log("Fetching townhome rows...");
      const response = await axios.get("http://localhost:3001/api/townhome-rows");
      console.log("API Response:", response.data);
      setTownhomeRows(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching townhome rows:", error);
      // ถ้า API ไม่มี ใช้ข้อมูลสำรอง
      const fallbackRows = [];
      for (let i = 1; i <= 10; i++) {
        fallbackRows.push({
          id: i,
          row_number: i,
          name: `แถว ${i}`,
          max_capacity: 10,
          home_count: 0
        });
      }
      console.log("Using fallback rows:", fallbackRows);
      setTownhomeRows(fallbackRows);
      return fallbackRows;
    }
  };

  const fetchHomes = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/homes");
      const townhomes = response.data.filter(h => h.hType === "บ้านพักเรือนแถว");
      setHomes(townhomes);
      
      // รอให้ข้อมูลแถวโหลดเสร็จก่อน
      const rows = await fetchTownhomeRows();
      
      // คำนวณจำนวนบ้านในแต่ละแถว
      const counts = { total: townhomes.length };
      
      // เริ่มต้นด้วย 0 สำหรับทุกแถว
      rows.forEach(row => {
        counts[row.id] = 0;
      });
      
      // นับจำนวนบ้านในแต่ละแถว
      townhomes.forEach(home => {
        if (home.row_id) {
          counts[home.row_id] = (counts[home.row_id] || 0) + 1;
        }
      });
      
      console.log("Row counts:", counts);
      setRowCounts(counts);
      
    } catch (error) {
      console.error("Error fetching homes:", error);
    }
  };

  useEffect(() => {
    fetchHomes();
  }, []);

  // ฟิลเตอร์บ้านตามแถวที่เลือก
  const filteredHomes = selectedRow === "all" 
    ? homes 
    : homes.filter(home => home.row_id === parseInt(selectedRow));

  const handleRowChange = (row) => {
    setSelectedRow(row);
  };

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
        <Sidebar 
          selectedRow={selectedRow}
          onRowChange={handleRowChange}
          rowCounts={rowCounts}
          townhomeRows={townhomeRows} // ส่งข้อมูลแถวไปด้วย
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
            บ้านประเภท: บ้านพักเรือนแถว
            {selectedRow !== "all" && (
              ` - ${townhomeRows.find(r => r.id === parseInt(selectedRow))?.name || `แถว ${selectedRow}`}`
            )}
          </h2>
          
          <div style={{ padding: 32 }}>
            <div className="movie-container">
              {filteredHomes.length === 0 ? (
                <div className="no-data">
                  {selectedRow === "all" 
                    ? "ไม่มีบ้านประเภทบ้านพักเรือนแถว" 
                    : `ไม่มีบ้านใน${townhomeRows.find(r => r.id === parseInt(selectedRow))?.name || `แถว ${selectedRow}`}`
                  }
                </div>
              ) : (
                filteredHomes.map((home, index) => (
                  <React.Fragment key={home.home_id}>
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
                          {home.hType || "บ้านพักเรือนแถว"}
                        </h3>
                        <div className="movie-details">
                          <div className="detail-item">
                            <strong>หมายเลขบ้าน:</strong> {home.Address}
                          </div>
                          <div className="detail-item">
                            <strong>แถว:</strong> {townhomeRows.find(r => r.id === home.row_id)?.name || 'ไม่ระบุ'}
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