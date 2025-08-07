import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Sidebar";
import "../styles/home.css";
import "../styles/Sharestyles.css"; // ต้องโหลดหลัง home.css
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/Addhome.module.css';

export default function Addhome() {
  const [form, setForm] = useState({ 
    home_type_id: "", 
    Address: "",
    row_id: "",
    twin_area_id: ""  // เปลี่ยนจาก twin_area
  });
  
  const [image, setImage] = useState(null);
  const [homeTypes, setHomeTypes] = useState([]);
  const [townhomeRows, setTownhomeRows] = useState([]);
  const [twinAreas, setTwinAreas] = useState([]);
  const navigate = useNavigate();

  // ฟังก์ชันโหลดข้อมูลเริ่มต้น
  const loadInitialData = async () => {
    try {
      const [homeTypesRes, townhomeRowsRes] = await Promise.all([
        axios.get("http://localhost:3001/api/home-types"),
        axios.get("http://localhost:3001/api/townhome-rows")
      ]);
      
      setHomeTypes(homeTypesRes.data);
      setTownhomeRows(townhomeRowsRes.data);
      
      // โหลด twin areas
      await loadTwinAreas();
      
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  // โหลดข้อมูล twin areas
  const loadTwinAreas = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/twin-areas");
      setTwinAreas(response.data);
    } catch (error) {
      console.error("Error loading twin areas:", error);
    }
  };

  // ฟังก์ชันรีเฟรชข้อมูลแถว
  const refreshTownhomeRows = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/townhome-rows");
      setTownhomeRows(response.data);
    } catch (error) {
      console.error("Error refreshing townhome rows:", error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // รีเซ็ตฟิลด์ที่เกี่ยวข้องเมื่อเปลี่ยนประเภทบ้าน
    if (name === 'home_type_id') {
      setForm({ 
        ...form, 
        [name]: value,
        row_id: "",
        twin_area_id: ""  // รีเซ็ต twin_area_id
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedHomeType = homeTypes.find(ht => ht.id == form.home_type_id);
    
    // ตั้งสถานะเป็น "ไม่มีผู้พักอาศัย" (status = 2)
    const status = "2";
    
    try {
      const formData = new FormData();
      
      formData.append("home_type_id", form.home_type_id);
      formData.append("Address", form.Address);
      formData.append("status", status);
      
      // ส่ง row_id สำหรับบ้านพักเรือนแถว
      if (selectedHomeType && selectedHomeType.name === 'บ้านพักเรือนแถว') {
        if (!form.row_id) {
          toast.error("กรุณาเลือกแถวสำหรับบ้านพักเรือนแถว", {
            position: "top-right",
            autoClose: 5000,
            style: { background: '#ef4444', color: 'white' }
          });
          return;
        }
        formData.append("row_id", form.row_id);
      }
      
      // ส่ง twin_area_id สำหรับบ้านพักแฝด
      if (selectedHomeType && selectedHomeType.name === 'บ้านพักแฝด') {
        if (!form.twin_area_id) {
          toast.error("กรุณาเลือกพื้นที่สำหรับบ้านพักแฝด", {
            position: "top-right",
            autoClose: 5000,
            style: { background: '#ef4444', color: 'white' }
          });
          return;
        }
        formData.append("twin_area_id", form.twin_area_id);
      }
      
      if (image) {
        formData.append("image", image);
      }

      const homeResponse = await axios.post("http://localhost:3001/api/homes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // รีเฟรชข้อมูลแถวหลังบันทึกสำเร็จ
      await refreshTownhomeRows();

      toast.success("บันทึกข้อมูลสำเร็จ!", {
        position: "top-right",
        autoClose: 3000,
        style: { background: '#43ec81ff', color: 'white' }
      });
      
      // รีเซ็ตฟอร์ม
      setForm({ 
        home_type_id: "", 
        Address: "",
        row_id: "",
        twin_area_id: ""
      });
      setImage(null);

    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      
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
        style: { background: '#ef4444', color: 'white' }
      });
    }
  };

  // ฟังก์ชันตรวจสอบประเภทบ้านที่เลือก
  const getSelectedHomeType = () => {
    return homeTypes.find(ht => ht.id == form.home_type_id);
  };

  const selectedHomeType = getSelectedHomeType();

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="content-container">
        <div className="title-container">
          <div className="page-title">
            เพิ่มบ้านพัก
          </div>
        </div>
        
        <div className="main-content">
          <div className="form-card">
            <form onSubmit={handleSubmit} className="form-full-width">
              <div className="form-group-large">
                <h3 className="form-section-title">ข้อมูลบ้านพัก</h3>
                
                <div className="form-group">
                  <label className="form-label">ประเภทบ้าน</label>
                  <select
                    name="home_type_id"
                    value={form.home_type_id}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">เลือกประเภทบ้าน</option>
                    {homeTypes
                      .filter(ht => !ht.name.includes('พื้นที่')) // ซ่อน บ้านพักแฝดพื้นที่1 และ พื้นที่2
                      .map(ht => (
                      <option key={ht.id} value={ht.id}>{ht.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* แสดง dropdown เลือกพื้นที่สำหรับบ้านพักแฝด */}
                {selectedHomeType?.name === 'บ้านพักแฝด' && (
                  <div className="form-group">
                    <label className="form-label">เลือกพื้นที่</label>
                    <select
                      name="twin_area_id"
                      value={form.twin_area_id}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">เลือกพื้นที่</option>
                      {twinAreas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                    <small className="form-help-text">
                      * เลือกพื้นที่ของบ้านพักแฝด
                    </small>
                  </div>
                )}
                
                {/* แสดง dropdown เลือกแถวสำหรับบ้านพักเรือนแถว */}
                {selectedHomeType?.name === 'บ้านพักเรือนแถว' && (
                  <div className="form-group">
                    <label className="form-label">เลือกแถว</label>
                    <select
                      name="row_id"
                      value={form.row_id}
                      onChange={handleChange}
                      required
                      className="form-select"
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
                    <small className="form-help-text">
                      * เลือกแถวที่ต้องการเพิ่มบ้าน
                    </small>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">หมายเลขบ้าน</label>
                  <input
                    type="text"
                    name="Address"
                    value={form.Address}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder={
                      selectedHomeType?.name === 'บ้านพักเรือนแถว' 
                        ? "กรอกหมายเลขบ้าน (เช่น 101, 201)"
                        : selectedHomeType?.name === 'บ้านพักแฝด'
                        ? `กรอกหมายเลขบ้าน ${form.twin_area_id ? `พื้นที่ ${twinAreas.find(a => a.id == form.twin_area_id)?.name || ''}` : ''} `
                        : "กรอกหมายเลขบ้าน (เช่น 101, 201)"
                    }
                  />
                  <small className="form-help-text">
                    * หมายเลขบ้านที่แสดงในระบบ
                    {selectedHomeType?.name === 'บ้านพักแฝด' && form.twin_area_id && (
                      <></>
                    )}
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">เพิ่มภาพ</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-file"
                  />
                  {image && (
                    <img 
                      src={URL.createObjectURL(image)}
                      alt="preview"
                      className="image-preview"
                    />
                  )}
                </div>
              </div>
              
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.btnPrimary}>
                  ยืนยัน
                </button>
                <button type="button" onClick={() => navigate("/")} className={styles.btnSecondary}>
                  ยกเลิก
                </button>
              </div>
            </form>
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