// สร้างไฟล์ frontend/src/pages/Addtype/Addtype.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Sidebar";
import "../../styles/home.css";
import "../../styles/Sharestyles.css"; // เพิ่ม shared styles
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../styles/Addhome.module.css'; // เพิ่ม module styles

export default function Addtype() {
  const [form, setForm] = useState({ 
    name: "",
    description: "",
    max_capacity: "",
    is_row_type: false
  });
  const [homeTypes, setHomeTypes] = useState([]);
  const navigate = useNavigate();

  // โหลดข้อมูลประเภทบ้านที่มีอยู่
  const loadHomeTypes = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/home_types");
      setHomeTypes(response.data);
    } catch (error) {
      console.error("Error loading home types:", error);
    }
  };

  useEffect(() => {
    loadHomeTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูล
    if (!form.name.trim()) {
      toast.error("กรุณากรอกชื่อประเภทบ้าน", {
        position: "top-right",
        autoClose: 3000,
        style: { background: '#ef4444', color: 'white' }
      });
      return;
    }

    // ตรวจสอบความซ้ำ
    const exists = homeTypes.some(type => 
      type.name.toLowerCase() === form.name.trim().toLowerCase()
    );
    
    if (exists) {
      toast.error("ประเภทบ้านนี้มีอยู่แล้ว", {
        position: "top-right",
        autoClose: 3000,
        style: { background: '#ef4444', color: 'white' }
      });
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:3001/api/home_types", {
        name: form.name.trim(),
        description: form.description.trim(),
        max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
        is_row_type: form.is_row_type
      });

      toast.success("เพิ่มประเภทบ้านสำเร็จ!", {
        position: "top-right",
        autoClose: 3000,
        style: { background: '#ffffffff', color: 'grey' }
      });
      
      // รีเซ็ตฟอร์ม
      setForm({ 
        name: "",
        description: "",
        max_capacity: "",
        is_row_type: false
      });
      
      // รีเฟรชรายการ
      loadHomeTypes();

    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "เกิดข้อผิดพลาดในการเพิ่มประเภทบ้าน";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
      } else if (error.response?.status === 500) {
        errorMessage = "เกิดข้อผิดพลาดของเซิร์ฟเวอร์";
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        style: { background: '#ef4444', color: 'grey' }
      });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ต้องการลบประเภทบ้าน "${name}" หรือไม่?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/home_types/${id}`);
      
      toast.success("ลบประเภทบ้านสำเร็จ!", {
        position: "top-right",
        autoClose: 3000,
        style: { background: '#ffffffff', color: 'grey' }
      });
      
      loadHomeTypes();
    } catch (error) {
      console.error("Error deleting home type:", error);
      
      let errorMessage = "ไม่สามารถลบประเภทบ้านได้";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        style: { background: '#ef4444', color: 'white' }
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="content-container">
        <div className="title-container">
          <div className="page-title">
            จัดการประเภทบ้านพัก
          </div>
        </div>
        
        <div className="main-content">
          {/* ฟอร์มเพิ่มประเภทบ้าน */}
          <div className="form-card">
            <h3 className="form-section-title">เพิ่มประเภทบ้านใหม่</h3>
            
            <form onSubmit={handleSubmit} className="form-full-width">
              <div className="form-group">
                <label className="form-label">ชื่อประเภทบ้าน <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="เช่น คอนโด, บ้านเดี่ยว"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">คำอธิบาย</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-textarea"
                />
              </div>
              
              
              
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.btnPrimary}>
                  เพิ่มประเภทบ้าน
                </button>
              </div>
            </form>
          </div>
          
          {/* รายการประเภทบ้านที่มีอยู่ */}
          <div className="form-card">
            <h3 className="form-section-title">
              ประเภทบ้านที่มีอยู่ ({homeTypes.length})
            </h3>
            
            <div className="list-container">
              {homeTypes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🏠</div>
                  ยังไม่มีประเภทบ้าน
                </div>
              ) : (
                homeTypes.map((type, index) => (
                  <div
                    key={type.id}
                    className={`list-item ${index % 2 === 0 ? 'even' : 'odd'}`}
                  >
                    <div className="list-item-content">
                      <div className="list-item-title">
                        {type.name}
                      </div>
                      {type.description && (
                        <div className="list-item-description">
                          {type.description}
                        </div>
                      )}
                      {type.max_capacity && (
                        <div className="list-item-meta">
                          ความจุสูงสุด: {type.max_capacity} หน่วย
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDelete(type.id, type.name)}
                      className="btn-danger btn-small"
                    >
                      ลบ
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
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
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}