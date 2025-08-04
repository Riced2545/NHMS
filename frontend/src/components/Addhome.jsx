import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Sidebar";
import "../styles/home.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Addhome() {
  const [form, setForm] = useState({ 
    home_type_id: "", 
    Address: "",
    row_id: ""
  });
  const [image, setImage] = useState(null);
  const [homeTypes, setHomeTypes] = useState([]);
  const [townhomeRows, setTownhomeRows] = useState([]);
  const navigate = useNavigate();

  // ฟังก์ชันโหลดข้อมูลเริ่มต้น
  const loadInitialData = async () => {
    try {
      const [homeTypesRes, townhomeRowsRes] = await Promise.all([
        axios.get("http://localhost:3001/api/home_types"),
        axios.get("http://localhost:3001/api/townhome-rows")
      ]);
      
      setHomeTypes(homeTypesRes.data);
      setTownhomeRows(townhomeRowsRes.data);
    } catch (error) {
      console.error("Error loading initial data:", error);
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
      
      // ถ้าเป็นบ้านพักเรือนแถว ให้ส่ง row_id
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
        row_id: ""
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

  return (
    <div className="dashboard-container" style={{ minHeight: "100vh", background: "#fafbff", padding: "0 0 64px 0" }}>
      <Navbar />
      
      <div className="content-container" style={{ flex: 1, padding: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <div style={{
            color: "#3b2566", 
            fontWeight: "bold", 
            fontSize: "30px",
            padding: "18px 48px", 
            borderRadius: "8px", 
            border: "6px solid #31c3e7",
            boxShadow: " 8px 8px 0 #2b2b3d",
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            letterSpacing: "2px", 
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
            maxWidth: "90%"
          }}>
            เพิ่มบ้านพัก
          </div>
        </div>
        
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 32,
            marginTop: 64,
            width: "96vw",
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 24px #e5e7eb",
              width: 600,
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              {/* ข้อมูลบ้าน */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#3b2566", fontSize: "18px" }}>ข้อมูลบ้านพัก</h3>
                
                <div style={{ marginBottom: 16 }}>
                  <label>ประเภทบ้าน</label>
                  <select
                    name="home_type_id"
                    value={form.home_type_id}
                    onChange={handleChange}
                    required
                    className="border px-2 py-1 rounded w-full"
                    style={{ width: "100%" }}
                  >
                    <option value="">เลือกประเภทบ้าน</option>
                    {homeTypes.map(ht => (
                      <option key={ht.id} value={ht.id}>{ht.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* แสดงเลือกแถวสำหรับบ้านพักเรือนแถว */}
                {homeTypes.find(ht => ht.id == form.home_type_id)?.name === 'บ้านพักเรือนแถว' && (
                  <div style={{ marginBottom: 16 }}>
                    <label>เลือกแถว</label>
                    <select
                      name="row_id"
                      value={form.row_id}
                      onChange={handleChange}
                      required
                      className="border px-2 py-1 rounded w-full"
                      style={{ width: "100%" }}
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
                    <small style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px", display: "block" }}>
                      * เลือกแถวที่ต้องการเพิ่มบ้าน
                    </small>
                  </div>
                )}
                
                <div style={{ marginBottom: 16 }}>
                  <label>หมายเลขบ้าน</label>
                  <input
                    type="text"
                    name="Address"
                    value={form.Address}
                    onChange={handleChange}
                    className="border px-2 py-1 rounded w-full"
                    required
                    style={{ width: "100%" }}
                    placeholder={
                      homeTypes.find(ht => ht.id == form.home_type_id)?.name === 'บ้านพักเรือนแถว' 
                        ? "กรอกหมายเลขบ้าน (เช่น 101, 201)"
                        : "กรอกหมายเลขบ้าน (เช่น 101, 201)"
                    }
                  />
                  <small style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    * หมายเลขบ้านที่แสดงในระบบ
                  </small>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="block mb-1">เพิ่มภาพ</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="border px-2 py-1 rounded w-full"
                    style={{ width: "100%" }}
                  />
                  {image && (
                    <img 
                      src={URL.createObjectURL(image)}
                      alt="preview"
                      style={{
                        marginTop: 8,
                        maxWidth: "100%",
                        maxHeight: 200,
                        borderRadius: 10,
                        objectFit: "contain",
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto"
                      }}
                    />
                  )}
                </div>
              </div>
              
              <div className="flex gap-2" style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
                <button
                  type="submit"
                  className="save-btn"
                >
                  ยืนยัน
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="delete-btn"
                >
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