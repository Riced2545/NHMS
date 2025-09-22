// สร้างไฟล์ frontend/src/pages/Addtype/Addtype.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Sidebar";
import "../../styles/home.css";
import "../../styles/Sharestyles.css";
import styles from '../../styles/Addhome.module.css';

const subunitOptions = [
  { value: "area", label: "พื้นที่" },
  { value: "row", label: "แถว" },
  { value: "floor", label: "ชั้น" },
  { value: "building", label: "อาคาร" },
  { value: "", label: "ไม่มี (เช่น บ้านเดี่ยว/คอนโด)" }
];

export default function Addtype() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    max_capacity: "",
    subunit_type: "",
    subunit_label: "",
    icon: ""
  });
  const [homeTypes, setHomeTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeTypes();
  }, []);

  const loadHomeTypes = async () => {
    const res = await axios.get("http://localhost:3001/api/home_types");
    setHomeTypes(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("กรุณากรอกชื่อประเภทบ้าน");
      return;
    }
    if (form.subunit_type && form.subunit_type !== "" && (!form.max_capacity || isNaN(form.max_capacity))) {
      toast.error("กรุณากรอกจำนวนหน่วยย่อยเป็นตัวเลข");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/home_types", {
        name: form.name.trim(),
        description: form.description.trim(),
        subunit_type: form.subunit_type || null,
        subunit_label: form.subunit_type || null, // ส่งเป็นภาษาไทย
        max_capacity: form.subunit_type ? parseInt(form.max_capacity, 10) : null,
        icon: form.icon || null
      });

      toast.success("เพิ่มประเภทบ้านสำเร็จ!");
      setForm({
        name: "",
        description: "",
        max_capacity: "",
        subunit_type: "",
        subunit_label: "",
        icon: ""
      });
      loadHomeTypes();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มประเภทบ้าน");
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
        <div className="button-container">
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
            }}
          >
            ย้อนกลับ
          </button>
        </div>
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
              <div className="form-group">
                <label className="form-label">เลือกหน่วยย่อย (subunit)</label>
                <select
                  name="subunit_type"
                  value={form.subunit_type}
                  onChange={handleChange}
                  className="form-input"
                >
                  {subunitOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {form.subunit_type && form.subunit_type !== "" && (
                <div className="form-group">
                  <label className="form-label">จำนวนหน่วยย่อย (เช่น อาคาร 6 หลัง)</label>
                  <input
                    name="max_capacity"
                    value={form.max_capacity}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    required
                    className="form-input"
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">ไอคอน (emoji)</label>
                <input
                  type="text"
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="เช่น 🏠"
                  maxLength={2}
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
                      {/* แสดงชื่อ subunit และ max_capacity แบบแยกรายการ */}
                      <div className="list-item-meta">
                        {type.subunit_names
                          ? (
                            <>
                              ลักษณะอาคาร:
                              {type.subunit_names.split(',').map((unit, i) => (
                                <span key={i}> {unit.trim()}{i < type.subunit_names.split(',').length - 1 ? ',' : ''}</span>
                              ))}
                            </>
                          )
                          : <>ลักษณะอาคาร: ไม่มี</>
                        }
                      </div>
                      <div className="list-item-meta">
                        {type.max_capacities
                          ? (
                            <>
                              จำนวนทั้งหมด:
                              {type.max_capacities.split(',').map((cap, i) => (
                                <span key={i}> {cap.trim()} หน่วย{i < type.max_capacities.split(',').length - 1 ? ',' : ''}</span>
                              ))}
                            </>
                          )
                          : <>จำนวนทั้งหมด: -</>
                        }
                      </div>
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