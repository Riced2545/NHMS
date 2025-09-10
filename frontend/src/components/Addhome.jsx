import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/home.css";
import "../styles/Sharestyles.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/Addhome.module.css';

export default function AddHomeModal({ isOpen, onClose, onSuccess, homeTypeName }) {
  const [image, setImage] = useState(null);
  const [homeTypes, setHomeTypes] = useState([]);
  const [townhomeRows, setTownhomeRows] = useState([]);
  const [twinAreas, setTwinAreas] = useState([]);
  const [floors, setFloors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [form, setForm] = useState({ 
    home_type_id: "", 
    Address: "",
    row_id: "",
    twin_area_id: "",
    floor_id: "",
    building_id: ""
  });
  const [amount, setAmount] = useState(1);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // ตั้งค่า home_type_id ตาม homeTypeName
  useEffect(() => {
    if (homeTypeName && homeTypes.length > 0) {
      const selectedType = homeTypes.find(ht => ht.name === homeTypeName);
      if (selectedType) {
        setForm(prev => ({ 
          ...prev, 
          home_type_id: selectedType.id,
          row_id: "",
          twin_area_id: ""
        }));
      }
    }
  }, [homeTypeName, homeTypes]);

  const loadInitialData = async () => {
    try {
      const [
        homeTypesRes,
        townhomeRowsRes,
        twinAreasRes,
        floorsRes,
        buildingsRes
      ] = await Promise.all([
        axios.get("http://localhost:3001/api/home-types"),
        axios.get("http://localhost:3001/api/townhome-rows"),
        axios.get("http://localhost:3001/api/twin-areas"),
        axios.get("http://localhost:3001/api/floors"),
        axios.get("http://localhost:3001/api/buildings")
      ]);
      
      setHomeTypes(homeTypesRes.data);
      setTownhomeRows(townhomeRowsRes.data);
      setTwinAreas(twinAreasRes.data);
      setFloors(floorsRes.data);
      setBuildings(buildingsRes.data);
      
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'home_type_id') {
      setForm({ 
        ...form, 
        [name]: value,
        row_id: "",
        twin_area_id: ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // แก้ไขใน Addhome.jsx - เพิ่มฟังก์ชันตรวจสอบเลขบ้านซ้ำ
  const checkDuplicateAddress = async (address, homeTypeId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/homes/check-address`, {
        params: { 
          address: address, 
          home_type_id: homeTypeId 
        }
      });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking duplicate address:", error);
      return false;
    }
  };

  // แก้ไขใน Addhome.jsx - เพิ่มฟังก์ชันตรวจสอบเลขบ้านซ้ำขณะพิมพ์
  const handleAddressChange = async (e) => {
    const { value } = e.target;
    setForm({ ...form, Address: value });
    
    // ตรวจสอบเลขบ้านซ้ำขณะพิมพ์ (หลังจากพิมพ์เสร็จ 1 วินาที)
    if (value && form.home_type_id) {
      clearTimeout(window.addressCheckTimeout);
      window.addressCheckTimeout = setTimeout(async () => {
        const isDuplicate = await checkDuplicateAddress(value, form.home_type_id);
        if (isDuplicate) {
          toast.warn(`⚠️ เลขบ้าน "${value}" มีอยู่แล้ว`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
              color: 'white',
              fontWeight: 'bold'
            }
          });
        }
      }, 1000);
    }
  };

  // ปรับ handleSubmit ให้ใช้ bulk add เท่านั้น
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedHomeType = homeTypes.find(ht => ht.id == form.home_type_id);

    try {
      const formData = new FormData();
      formData.append("home_type_id", form.home_type_id);
      formData.append("status", "2");
      if (selectedHomeType?.name === 'บ้านพักเรือนแถว') {
        formData.append("row_id", form.row_id);
      }
      if (selectedHomeType?.name === 'บ้านพักแฝด') {
        formData.append("twin_area_id", form.twin_area_id);
      }
      // เพิ่มตรงนี้ สำหรับแฟลตสัญญาบัตรและบ้านพักลูกจ้าง
      if (selectedHomeType?.name === 'แฟลตสัญญาบัตร') {
        formData.append("floor_id", form.floor_id);
      }
      if (selectedHomeType?.name === 'บ้านพักลูกจ้าง') {
        formData.append("building_id", form.building_id);
      }
      if (image) {
        formData.append("image", image);
      }
      formData.append("amount", amount);
      formData.append("startAddress", startAddress);
      formData.append("endAddress", endAddress);

      await axios.post("http://localhost:3001/api/homes/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("เพิ่มบ้านสำเร็จ", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { 
          background: 'linear-gradient(135deg, #ffffffff, #ffffffff)', 
          fontWeight: 'bold'
        }
      });
      setForm({ home_type_id: "", row_id: "", twin_area_id: "" });
      setImage(null);
      onSuccess();
      onClose();

    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "เกิดข้อผิดพลาดในการเพิ่มบ้าน";
      let errorIcon = "❌";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
        errorIcon = "⚠️";
      } else if (error.response?.status === 409) {
        errorMessage = "เลขบ้านนี้มีอยู่แล้ว กรุณาใช้เลขบ้านอื่น";
        errorIcon = "🔄";
      }
      
      toast.error(`${errorIcon} ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ 
      home_type_id: "", 
      Address: "",
      row_id: "",
      twin_area_id: ""
    });
    setImage(null);
    onClose();
  };

  const getSelectedHomeType = () => {
    return homeTypes.find(ht => ht.id == form.home_type_id);
  };

  const selectedHomeType = getSelectedHomeType();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '800px',
          minWidth: '800px',
          maxWidth: '95vw',
          height: 'auto',
          maxHeight: '90vh'
        }}
      >
        <div 
          className="modal-header"
          style={{ padding: '20px 24px' }}
        >
          <h3 
            className="modal-title"
            style={{ fontSize: '1.4rem' }}
          >
            เพิ่มบ้านพัก
          </h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div 
          className="modal-body"
          style={{ padding: '24px' }}
        >
          <form onSubmit={handleSubmit}>
            {/* แถวแรก - ประเภทบ้านกับเลือกแถว/พื้นที่ */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: selectedHomeType?.name === 'บ้านพักแฝด' || selectedHomeType?.name === 'บ้านพักเรือนแถว' ? '1fr 1fr' : '1fr', 
                gap: '20px',
                marginBottom: '20px' 
              }}
            >
              <div className="form-group">
                <label 
                  className="form-label"
                  style={{ 
                    fontSize: '14px',
                    marginBottom: '8px' 
                  }}
                >
                  ประเภทบ้าน
                </label>
                <select
                  name="home_type_id"
                  value={form.home_type_id}
                  onChange={handleChange}
                  required
                  className="form-select"
                  disabled={!!homeTypeName}
                  style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    minHeight: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                >
                  <option value="">เลือกประเภทบ้าน</option>
                  {homeTypes
                    .filter(ht => !ht.name.includes('พื้นที่'))
                    .map(ht => (
                      <option key={ht.id} value={ht.id}>{ht.name}</option>
                    ))}
                </select>
              </div>
              
              {/* เลือกพื้นที่สำหรับบ้านพักแฝด */}
              {selectedHomeType?.name === 'บ้านพักแฝด' && (
                <div className="form-group">
                  <label 
                    className="form-label"
                    style={{ fontSize: '14px', marginBottom: '8px' }}
                  >
                    เลือกพื้นที่
                  </label>
                  <select
                    name="twin_area_id"
                    value={form.twin_area_id}
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{ 
                      padding: '12px 16px',
                      fontSize: '14px',
                      minHeight: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      width: '100%'
                    }}
                  >
                    <option value="">เลือกพื้นที่</option>
                    {twinAreas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* เลือกแถวสำหรับบ้านพักเรือนแถว */}
              {selectedHomeType?.name === 'บ้านพักเรือนแถว' && (
                <div className="form-group">
                  <label 
                    className="form-label"
                    style={{ fontSize: '14px', marginBottom: '8px' }}
                  >
                    เลือกแถว
                  </label>
                  <select
                    name="row_id"
                    value={form.row_id}
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{ 
                      padding: '12px 16px',
                      fontSize: '14px',
                      minHeight: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      width: '100%'
                    }}
                  >
                    <option value="">เลือกแถว</option>
                    {townhomeRows.map(row => (
                      <option 
                        key={row.id} 
                        value={row.id}
                        disabled={row.home_count >= row.max_capacity}
                      >
                        {row.name} ({row.home_count}/{row.max_capacity})
                        {row.home_count >= row.max_capacity ? ' - เต็ม' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* เลือกชั้นสำหรับแฟลตสัญญาบัตร */}
              {selectedHomeType?.name === 'แฟลตสัญญาบัตร' && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    เลือกชั้น
                  </label>
                  <select
                    name="floor_id"
                    value={form.floor_id}
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{ 
                      padding: '12px 16px',
                      fontSize: '14px',
                      minHeight: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      width: '100%'
                    }}
                  >
                    <option value="">เลือกชั้น</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* เลือกอาคารสำหรับบ้านพักลูกจ้าง */}
              {selectedHomeType?.name === 'บ้านพักลูกจ้าง' && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    เลือกอาคาร
                  </label>
                  <select
                    name="building_id"
                    value={form.building_id}
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{ 
                      padding: '12px 16px',
                      fontSize: '14px',
                      minHeight: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      width: '100%'
                    }}
                  >
                    <option value="">เลือกอาคาร</option>
                    {buildings.map(building => (
                      <option key={building.id} value={building.id}>{building.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            

            {/* แถวที่สาม - จำนวนหลังที่ต้องการเพิ่ม, เลขบ้านเริ่มต้น, เลขบ้านสิ้นสุด */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '20px',
                marginBottom: '20px' 
              }}
            >
              <div className="form-group">
                <label 
                  className="form-label"
                  style={{ fontSize: '14px', marginBottom: '8px' }}
                >
                  จำนวนหลังที่ต้องการเพิ่ม
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="จำนวนหลังที่ต้องการเพิ่ม"
                  className="form-input"
                  required
                  style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    minHeight: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />
              </div>

              <div className="form-group">
                <label 
                  className="form-label"
                  style={{ fontSize: '14px', marginBottom: '8px' }}
                >
                  เลขบ้านเริ่มต้น
                </label>
                <input
                  type="text"
                  value={startAddress}
                  onChange={e => setStartAddress(e.target.value)}
                  placeholder="เลขบ้านเริ่มต้น"
                  className="form-input"
                  required
                  style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    minHeight: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />
              </div>

              <div className="form-group">
                <label 
                  className="form-label"
                  style={{ fontSize: '14px', marginBottom: '8px' }}
                >
                  เลขบ้านสิ้นสุด
                </label>
                <input
                  type="text"
                  value={endAddress}
                  onChange={e => setEndAddress(e.target.value)}
                  placeholder="เลขบ้านสิ้นสุด"
                  className="form-input"
                  required
                  style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    minHeight: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* แถวที่สอง - รูปภาพ */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px',
                marginBottom: '20px' 
              }}
            >
              <div className="form-group">
                <label 
                  className="form-label"
                  style={{ fontSize: '14px', marginBottom: '8px' }}
                >
                  เพิ่มภาพ
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-file"
                  style={{ 
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* แสดงรูปตัวอย่าง */}
            {image && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img 
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="image-preview"
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb'
                  }}
                />
              </div>
            )}

            <div 
              className="modal-actions"
              style={{ 
                marginTop: '24px',
                gap: '12px',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button 
                type="button" 
                onClick={handleClose} 
                className="btn-secondary"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  minWidth: '80px',
                  borderRadius: '6px',
                  color:'grey'
                }}
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  minWidth: '80px',
                  borderRadius: '6px'
                }}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}