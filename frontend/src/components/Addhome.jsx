import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/home.css";
import "../styles/Sharestyles.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/Addhome.module.css';

export default function AddHomeModal({ isOpen, onClose, onSuccess, homeTypeName }) {
  const [form, setForm] = useState({ 
    home_type_id: "", 
    Address: "",
    row_id: "",
    twin_area_id: ""
  });
  
  const [image, setImage] = useState(null);
  const [homeTypes, setHomeTypes] = useState([]);
  const [townhomeRows, setTownhomeRows] = useState([]);
  const [twinAreas, setTwinAreas] = useState([]);
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
      const [homeTypesRes, townhomeRowsRes, twinAreasRes] = await Promise.all([
        axios.get("http://localhost:3001/api/home-types"),
        axios.get("http://localhost:3001/api/townhome-rows"),
        axios.get("http://localhost:3001/api/twin-areas")
      ]);
      
      setHomeTypes(homeTypesRes.data);
      setTownhomeRows(townhomeRowsRes.data);
      setTwinAreas(twinAreasRes.data);
      
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

  // แก้ไขฟังก์ชัน handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const selectedHomeType = homeTypes.find(ht => ht.id == form.home_type_id);
    
    try {
      // ตรวจสอบเลขบ้านซ้ำก่อน
      const isDuplicate = await checkDuplicateAddress(form.Address, form.home_type_id);
      if (isDuplicate) {
        toast.error(`❌ เลขบ้าน "${form.Address}" มีอยู่แล้วในประเภท ${selectedHomeType?.name}`, {
          position: "top-right",
          autoClose: 4000,
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
        setLoading(false);
        return;
      }

      const formData = new FormData();
      
      formData.append("home_type_id", form.home_type_id);
      formData.append("Address", form.Address);
      formData.append("status", "2"); // ไม่มีผู้พักอาศัย
      
      // ตรวจสอบประเภทบ้านและข้อมูลที่จำเป็น
      if (selectedHomeType?.name === 'บ้านพักเรือนแถว') {
        if (!form.row_id) {
          toast.error("⚠️ กรุณาเลือกแถวสำหรับบ้านพักเรือนแถว", {
            position: "top-right",
            autoClose: 3000,
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
          setLoading(false);
          return;
        }
        formData.append("row_id", form.row_id);
      }
      
      if (selectedHomeType?.name === 'บ้านพักแฝด') {
        if (!form.twin_area_id) {
          toast.error("⚠️ กรุณาเลือกพื้นที่สำหรับบ้านพักแฝด", {
            position: "top-right",
            autoClose: 3000,
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
          setLoading(false);
          return;
        }
        formData.append("twin_area_id", form.twin_area_id);
      }
      
      if (image) {
        formData.append("image", image);
      }

      await axios.post("http://localhost:3001/api/homes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Toast สำเร็จ
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
      
      // รีเซ็ตฟอร์ม
      setForm({ 
        home_type_id: homeTypeName ? homeTypes.find(ht => ht.name === homeTypeName)?.id || "" : "", 
        Address: "",
        row_id: "",
        twin_area_id: ""
      });
      setImage(null);
      
      onSuccess(); // เรียก callback เพื่อรีเฟรชข้อมูล
      onClose(); // ปิด modal

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
            </div>
            
            {/* แถวที่สอง - หมายเลขบ้านกับรูปภาพ */}
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
                  หมายเลขบ้าน
                </label>
                <input
                  type="text"
                  name="Address"
                  value={form.Address}
                  onChange={handleAddressChange}
                  className="form-input"
                  required
                  placeholder="กรอกหมายเลขบ้าน (เช่น 101, 201)"
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