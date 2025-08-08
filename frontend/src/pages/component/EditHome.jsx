import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./EditHome.css";

export default function EditHomeModal({ isOpen, onClose, homeId, onUpdate }) {
  const [formData, setFormData] = useState({
    Address: "",
    home_type_id: "",
    status_id: "",
    image: null,
    allowedRanks: [] // เพิ่มการจัดการยศที่อนุญาต
  });
  const [homeTypes, setHomeTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [ranks, setRanks] = useState([]); // เพิ่ม state สำหรับยศ
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [showRankManagement, setShowRankManagement] = useState(false); // สำหรับเปลี่ยน modal

  // โหลดข้อมูลบ้านเมื่อ modal เปิด
  useEffect(() => {
    if (isOpen && homeId) {
      console.log("Loading data for home ID:", homeId);
      fetchHomeData();
      fetchHomeTypes();
      fetchStatuses();
      fetchRanks(); // เพิ่มการโหลดยศ
    }
  }, [isOpen, homeId]);

  const fetchHomeTypes = async () => {
    try {
      console.log("Fetching home types...");
      const response = await axios.get("http://localhost:3001/api/home-types");
      console.log("Home types response:", response.data);
      setHomeTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching home types:", error);
      setHomeTypes([]);
      toast.error("ไม่สามารถโหลดประเภทบ้านได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchStatuses = async () => {
    try {
      console.log("Fetching statuses...");
      const response = await axios.get("http://localhost:3001/api/status");
      console.log("Statuses response:", response.data);
      setStatuses(response.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      setStatuses([]);
      toast.error("ไม่สามารถโหลดสถานะได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // เพิ่มฟังก์ชันโหลดยศ
  const fetchRanks = async () => {
    try {
      console.log("Fetching ranks...");
      const response = await axios.get("http://localhost:3001/api/ranks");
      console.log("Ranks response:", response.data);
      setRanks(response.data || []);
    } catch (error) {
      console.error("Error fetching ranks:", error);
      setRanks([]);
      toast.error("ไม่สามารถโหลดข้อมูลยศได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchHomeData = async () => {
    try {
      console.log("Fetching home data...");
      const response = await axios.get(`http://localhost:3001/api/homes/${homeId}`);
      console.log("Home data response:", response.data);
      const home = response.data;
      
      // โหลดยศที่อนุญาตสำหรับประเภทบ้านนี้
      if (home.home_type_id) {
        try {
          const allowedRanksResponse = await axios.get(`http://localhost:3001/api/home-types/${home.home_type_id}/allowed-ranks`);
          const allowedRankIds = allowedRanksResponse.data.map(eligibility => eligibility.rank_id);
          
          setFormData({
            Address: home.Address || "",
            home_type_id: home.home_type_id || "",
            status_id: home.status_id || "",
            image: null,
            allowedRanks: allowedRankIds
          });
        } catch (ranksError) {
          console.log("No allowed ranks found, setting empty array");
          setFormData({
            Address: home.Address || "",
            home_type_id: home.home_type_id || "",
            status_id: home.status_id || "",
            image: null,
            allowedRanks: []
          });
        }
      } else {
        setFormData({
          Address: home.Address || "",
          home_type_id: home.home_type_id || "",
          status_id: home.status_id || "",
          image: null,
          allowedRanks: []
        });
      }
      
      if (home.image) {
        setPreviewImage(`http://localhost:3001/uploads/${home.image}`);
      } else {
        setPreviewImage("");
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลบ้านได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // เมื่อเปลี่ยนประเภทบ้าน ให้โหลดยศที่อนุญาตใหม่
  const handleHomeTypeChange = async (e) => {
    const newHomeTypeId = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      home_type_id: newHomeTypeId,
      allowedRanks: [] // รีเซ็ตยศที่เลือก
    }));
    
    // โหลดยศที่อนุญาตสำหรับประเภทบ้านใหม่
    if (newHomeTypeId) {
      try {
        const allowedRanksResponse = await axios.get(`http://localhost:3001/api/home-types/${newHomeTypeId}/allowed-ranks`);
        const allowedRankIds = allowedRanksResponse.data.map(eligibility => eligibility.rank_id);
        
        setFormData(prev => ({
          ...prev,
          allowedRanks: allowedRankIds
        }));
      } catch (error) {
        console.error("Error fetching allowed ranks:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'home_type_id') {
      handleHomeTypeChange(e);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // เพิ่มฟังก์ชันจัดการการเลือกยศ
  const handleRankChange = (rankId) => {
    setFormData(prev => ({
      ...prev,
      allowedRanks: prev.allowedRanks.includes(rankId)
        ? prev.allowedRanks.filter(id => id !== rankId)
        : [...prev.allowedRanks, rankId]
    }));
  };

  // ฟังก์ชันบันทึกยศที่อนุญาต
  const saveAllowedRanks = async () => {
    try {
      setLoading(true);
      
      await axios.put(`http://localhost:3001/api/home-types/${formData.home_type_id}/allowed-ranks`, {
        allowedRanks: formData.allowedRanks
      });
      
      toast.success("บันทึกยศที่อนุญาตสำเร็จ!", {
        position: "top-right",
        autoClose: 2000,
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      
      setShowRankManagement(false);
      
    } catch (error) {
      console.error("Error saving allowed ranks:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!");
    console.log("Form data:", formData);
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Address", formData.Address);
      formDataToSend.append("home_type_id", formData.home_type_id);
      formDataToSend.append("status_id", formData.status_id);
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      console.log("Sending request to:", `http://localhost:3001/api/homes/${homeId}`);
      
      const response = await axios.put(`http://localhost:3001/api/homes/${homeId}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);
      
      toast.success("แก้ไขข้อมูลบ้านสำเร็จ!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#2bd66aff',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });
      
      onUpdate();
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error("Error updating home:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล";
      
      toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบบ้าน
  const handleDeleteHome = async () => {
    // แสดง toast แจ้งเตือนก่อนลบ - ย้ายไปขวาบน
    const deleteConfirm = () => {
      return new Promise((resolve) => {
        toast.warn(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              ⚠️ ยืนยันการลบบ้าน
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              คุณต้องการลบบ้านเลขที่ <strong>{formData.Address}</strong> หรือไม่?<br />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                onClick={() => {
                  toast.dismiss();
                  resolve(false);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#6b7280';
                }}
              >
                ❌ ยกเลิก
              </button>
              <button
                onClick={() => {
                  toast.dismiss();
                  resolve(true);
                }}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc2626';
                }}
              >
                🗑️ ลบบ้าน
              </button>
            </div>
          </div>,
          {
            position: "top-right", // เปลี่ยนจาก top-center เป็น top-right
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            closeButton: false,
            style: {
              background: '#fff',
              color: '#000',
              border: '2px solid #dc2626',
              borderRadius: '12px',
              minWidth: '350px', // ลดขนาดเล็กน้อย
              maxWidth: '400px', // ลดขนาดเล็กน้อย
              boxShadow: '0 10px 25px rgba(220, 38, 38, 0.15)' // เพิ่มเงา
            }
          }
        );
      });
    };

    // รอผลการตัดสินใจจากผู้ใช้
    const shouldDelete = await deleteConfirm();
    
    if (!shouldDelete) {
      // Toast เมื่อยกเลิกการลบ
      toast.info("🛡️ ยกเลิกการลบบ้านแล้ว", {
        position: "top-right",
        autoClose: 2000,
        style: {
          background: '#3b82f6',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      return;
    }

    // Toast แจ้งเริ่มการลบ
    toast.warning("🗑️ กำลังลบบ้าน...", {
      position: "top-right",
      autoClose: 3000,
      style: {
        background: '#f59e0b',
        color: 'white',
        fontWeight: 'bold'
      }
    });

    setLoading(true);
    
    try {
      const response = await axios.delete(`http://localhost:3001/api/homes/${homeId}`);
      
      if (response.data.success) {
        // Toast แจ้งลบสำเร็จพร้อมข้อมูลเพิ่มเติม
        toast.success(
          <div style={{ lineHeight: '1.4' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              ✅ ลบบ้านเลขที่ {formData.Address} สำเร็จ!
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
            style: {
              background: '#10b981',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }
          }
        );
        
        onUpdate(); // อัพเดตรายการบ้าน
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
      
    } catch (error) {
      console.error("Error deleting home:", error);
      
      // จัดการ error message ให้ละเอียด
      let errorMessage = "เกิดข้อผิดพลาดในการลบบ้าน";
      
      if (error.response?.status === 400) {
        // ข้อความจาก backend เมื่อมีผู้พักอาศัย
        errorMessage = error.response.data.message || "ไม่สามารถลบได้: มีผู้พักอาศัยอยู่ในบ้านนี้";
      } else if (error.response?.status === 404) {
        errorMessage = "❌ ไม่พบข้อมูลบ้านที่ต้องการลบ";
      } else if (error.response?.status === 403) {
        errorMessage = "❌ ไม่มีสิทธิ์ในการลบบ้าน";
      } else if (error.response?.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`;
      } else if (error.response?.data?.error) {
        errorMessage = `❌ ${error.response.data.error}`;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  console.log("Rendering modal with:", { homeTypes, statuses, ranks, formData });

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{showRankManagement ? "🎖️ จัดการยศที่อนุญาต" : "✏️ แก้ไขข้อมูลบ้าน"}</h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {!showRankManagement ? (
            // Form แก้ไขบ้านปกติ
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>🏠 หมายเลขบ้าน:</label>
                <input
                  type="text"
                  name="Address"
                  value={formData.Address}
                  onChange={handleInputChange}
                  required
                  placeholder="กรอกหมายเลขบ้าน"
                />
              </div>

              <div className="form-group">
                <label>🏘️ ประเภทบ้าน:</label>
                <select
                  name="home_type_id"
                  value={formData.home_type_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">เลือกประเภทบ้าน</option>
                  {homeTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>📊 สถานะ:</label>
                <select
                  name="status_id"
                  value={formData.status_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">เลือกสถานะ</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>📷 รูปภาพ:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewImage && (
                  <div className="image-preview">
                    <img src={previewImage} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {/* กลุ่มปุ่มด้านซ้าย - ปุ่มลบ */}
                <div className="btn-group-left">
                  <button 
                    type="button" 
                    className="btn-delete" 
                    onClick={handleDeleteHome}
                    disabled={loading}
                    title={`ลบบ้านเลขที่ ${formData.Address}`}
                  >
                    {loading ? (
                      <>⏳ กำลังลบ...</>
                    ) : (
                      <>🗑️ ลบบ้าน</>
                    )}
                  </button>
                </div>

                {/* กลุ่มปุ่มด้านขวา - ปุ่มเดิม */}
                <div className="btn-group-right">
                  <button type="button" className="btn-cancel" onClick={onClose}>
                    ❌ ยกเลิก
                  </button>
                  
                  {formData.home_type_id && (
                    <button 
                      type="button" 
                      className="btn-rank-management"
                      onClick={() => setShowRankManagement(true)}
                      disabled={loading}
                    >
                      🎖️ จัดการยศเข้าพัก
                    </button>
                  )}
                  
                  <button 
                    type="submit" 
                    className="btn-save" 
                    disabled={loading}
                  >
                    {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // Form จัดการยศ
            <div className="rank-management-form">
              <div style={{ marginBottom: "24px", textAlign: "center" }}>
                <h3 style={{ 
                  color: "#000000ff", 
                  marginBottom: "12px",
                  fontSize: "20px",
                  fontWeight: "bold"
                }}>
                  🎖️ ยศที่สามารถเข้าพักได้
                </h3>
                <p style={{ 
                  fontSize: "16px", 
                  color: "#6b7280",
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #8937f5ff"
                }}>
                  เลือกยศที่อนุญาตให้เข้าพักในประเภทบ้าน{" "}
                  <strong style={{ color: "#6b7280" }}>
                    {homeTypes.find(type => type.id == formData.home_type_id)?.name}
                  </strong>
                </p>
              </div>

              <div className="ranks-checkbox-container">
                {ranks.length > 0 ? ranks.map(rank => (
                  <div 
                    key={rank.id} 
                    className="checkbox-wrapper-13"
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '1rem',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onClick={() => handleRankChange(rank.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        id={`rank-${rank.id}`}
                        type="checkbox"
                        checked={formData.allowedRanks.includes(rank.id)}
                        onChange={() => {}} // ไม่ต้องทำอะไรเพราะจะใช้ onClick ของ div แทน
                        style={{ pointerEvents: 'none' }} // ปิดการคลิกโดยตรงที่ checkbox
                      />
                      <label 
                        htmlFor={`rank-${rank.id}`}
                        style={{ cursor: 'pointer', margin: 0 }}
                      >
                        {rank.name}
                      </label>
                    </div>

                  </div>
                )) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '16px',
                    padding: '60px',
                    gridColumn: '1 / -1',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: '2px dashed #fbbf24'
                  }}>
                    😔 ไม่พบข้อมูลยศ
                  </div>
                )}
              </div>

             

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowRankManagement(false)}
                >
                  ← กลับ
                </button>
                <button 
                  type="button" 
                  className="btn-save" 
                  onClick={saveAllowedRanks}
                  disabled={loading}
                >
                  {loading ? "⏳ กำลังบันทึก..." : "✅ บันทึกยศที่อนุญาต"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 10000 }}
        toastStyle={{
          borderRadius: '12px',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      />
    </>
  );
}