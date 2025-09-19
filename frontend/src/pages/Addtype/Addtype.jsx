// สร้างไฟล์ frontend/src/pages/Addtype/Addtype.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Sidebar";
import "../../styles/home.css";
import "../../styles/Sharestyles.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    // ถ้าเลือก subunit_type ให้ auto fill subunit_label
    if (name === "subunit_type") {
      const found = subunitOptions.find(opt => opt.value === value);
      setForm(f => ({
        ...f,
        subunit_label: found ? found.label : ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("กรุณากรอกชื่อประเภทบ้าน");
      return;
    }
    if (!form.max_capacity || isNaN(form.max_capacity)) {
      toast.error("กรุณากรอกจำนวนสูงสุดเป็นตัวเลข");
      return;
    }
    // ตรวจสอบความซ้ำ
    const exists = homeTypes.some(type =>
      type.name.toLowerCase() === form.name.trim().toLowerCase()
    );
    if (exists) {
      toast.error("ประเภทบ้านนี้มีอยู่แล้ว");
      return;
    }

    try {
      // เพิ่มประเภทบ้าน (home_types) พร้อม subunit_type และ icon
      await axios.post("http://localhost:3001/api/home_types", {
        name: form.name.trim(),
        description: form.description.trim(),
        subunit_type: form.subunit_type || null,
        icon: form.icon || null
      });

      // ถ้าเลือก subunit_type (ไม่ใช่ค่าว่าง) ให้เพิ่ม subunit_home ด้วย (เก็บ max_capacity)
      if (form.subunit_type && form.subunit_type !== "") {
        // เช็คก่อนว่ามี subunit นี้อยู่แล้วหรือยัง
        const subunitExists = await axios.get(`http://localhost:3001/api/subunits/${form.subunit_type}`);
        const found = subunitExists.data.find(
          su => su.name === form.subunit_label
        );
        if (!found) {
          await axios.post("http://localhost:3001/api/subunit_home", {
            name: form.subunit_label,
            subunit_type: form.subunit_type,
            max_capacity: form.max_capacity
          });
        }
      }

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
                <label className="form-label">จำนวนสูงสุด <span className="required">*</span></label>
                <input
                  type="number"
                  name="max_capacity"
                  value={form.max_capacity}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min={1}
                  placeholder="จำนวนบ้านสูงสุดในประเภทนี้"
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
                      {/* แสดงชื่อ subunit และ max_capacity */}
                      {type.subunit_names && (
                        <div className="list-item-meta">
                          หน่วยย่อย: {type.subunit_names}
                        </div>
                      )}
                      {type.max_capacities && (
                        <div className="list-item-meta">
                          ความจุสูงสุด: {type.max_capacities} หน่วย
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