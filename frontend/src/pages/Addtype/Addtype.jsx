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
  { value: "พื้นที่", label: "พื้นที่" },
  { value: "แถว", label: "แถว" },
  { value: "ชั้น", label: "ชั้น" },
  { value: "อาคาร", label: "อาคาร" },
  { value: "", label: "ไม่มี (เช่น บ้านเดี่ยว/คอนโด)" }
];

export default function Addtype() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    max_capacity: "",
    subunit_type: "",
    icon: ""
  });
  const [homeTypes, setHomeTypes] = useState([]);
  const [customSubunit, setCustomSubunit] = useState("");
  const [subunitList, setSubunitList] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubunitList();
    loadHomeTypes();
  }, []);

  const loadSubunitList = async () => {
    const res = await axios.get("http://localhost:3001/api/subunit_home");
    setSubunitList(res.data);
  };

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

    let maxCapacity = 1;
    if (form.subunit_type && form.subunit_type !== "") {
      if (!form.max_capacity || isNaN(form.max_capacity) || parseInt(form.max_capacity, 10) < 1) {
        toast.error("กรุณากรอกจำนวนหน่วยย่อยเป็นตัวเลขมากกว่า 0");
        return;
      }
      maxCapacity = parseInt(form.max_capacity, 10);
    }

    try {
      // สร้างประเภทบ้านใหม่
      const res = await axios.post("http://localhost:3001/api/home_types", {
        name: form.name.trim(),
        description: form.description.trim(),
        subunit_type: form.subunit_type || null,
        max_capacity: maxCapacity,
        icon: form.icon || null
      });

      toast.success("เพิ่มประเภทบ้านสำเร็จ!");
      setForm({
        name: "",
        description: "",
        max_capacity: "",
        subunit_type: "",
        icon: ""
      });
      loadHomeTypes();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มประเภทบ้าน");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ต้องการลบประเภทบ้าน "${name}" หรือไม่?`)) return;
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบประเภทบ้าน "${name}"?\nการลบนี้จะลบข้อมูลบ้านและหน่วยย่อยทั้งหมดที่เกี่ยวข้อง!`)) return;

    try {
      await axios.delete(`http://localhost:3001/api/home_types/${id}`);
      toast.success("ลบประเภทบ้านสำเร็จ!");
      loadHomeTypes();
    } catch (error) {
      let errorMessage = "ไม่สามารถลบประเภทบ้านได้";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleAddSubunit = async () => {
    if (!customSubunit.trim()) return;
    try {
      await axios.post("http://localhost:3001/api/subunit_home", {
        name: customSubunit.trim(),
        subunit_type: customSubunit.trim()
      });
      setCustomSubunit("");
      setShowInput(false);
      loadSubunitList();
      toast.success("เพิ่มชื่อ subunit ใหม่สำเร็จ!");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มชื่อ subunit");
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    name="subunit_type"
                    value={form.subunit_type}
                    onChange={handleChange}
                    className="form-input"
                    style={{ flex: 1 }}
                  >
                    <option value="">ไม่มี (เช่น บ้านเดี่ยว/คอนโด)</option>
                    {subunitList.map(opt => (
                      <option key={opt.id} value={opt.subunit_type}>{opt.subunit_type}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowInput(!showInput)}
                    style={{
                      padding: "6px 12px",
                      background: "#e0e7ef",
                      border: "none",
                      borderRadius: "6px",
                      color: "#2563eb",
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                  >
                    เพิ่มชื่อใหม่
                  </button>
                </div>
                {showInput && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={customSubunit}
                      onChange={e => setCustomSubunit(e.target.value)}
                      placeholder="ชื่อ subunit ใหม่ เช่น โซน, ตึก, บล็อก"
                      style={{ flex: 1, padding: "4px 8px" }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSubunit}
                      style={{
                        padding: "6px 12px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: 500,
                        cursor: "pointer"
                      }}
                    >
                      บันทึก
                    </button>
                  </div>
                )}
              </div>
              {form.subunit_type && form.subunit_type !== "" && (
                <div className="form-group">
                  <label className="form-label">จำนวน (ใส่ตัวเลข)</label>
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
                      <div className="list-item-meta">
                        ลักษณะอาคาร : {type.subunit_type || "ไม่มี"}
                      </div>
                      <div className="list-item-meta">
                        จำนวนทั้งหมด : {type.max_capacity ? type.max_capacity : "-"}
                      </div>
                      <div className="delete-btn-center">
                        <button
                          onClick={() => handleDelete(type.id, type.name)}
                          className="btn-danger btn-small"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
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