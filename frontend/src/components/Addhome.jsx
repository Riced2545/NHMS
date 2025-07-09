import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Sidebar";
import "../styles/home.css";

export default function Addhome() {
  const [form, setForm] = useState({ home_type_id: "", Address: "", status: "" });
  const [image, setImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [homeTypes, setHomeTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3001/api/home_types").then(res => setHomeTypes(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // ซ่อนข้อผิดพลาดเมื่อผู้ใช้เริ่มพิมพ์ใหม่
    if (showError) {
      setShowError(false);
      setErrorMessage("");
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append("home_type_id", form.home_type_id);
      formData.append("Address", form.Address);
      formData.append("status", form.status);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post("http://localhost:3001/api/homes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setShowSuccess(true);
        // รีเซ็ตฟอร์ม
        setForm({ home_type_id: "", Address: "", status: "" });
        setImage(null);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/");
        }, 1800);
      }
    } catch (error) {
      console.error("Error:", error);
      
      // แสดงข้อผิดพลาดจาก server
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
      
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
      }, 5000); // แสดง error 5 วินาที
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafbff", padding: "0 0 64px 0" }}>
      <Navbar />
      
      {/* Success Message */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translate(-50%, -120%)",
            background: "#fff",
            color: "#16a34a",
            fontWeight: "bold",
            fontSize: 18,
            padding: "10px 32px",
            borderRadius: 12,
            border: "2px solid #22c55e",
            boxShadow: "0 4px 16px #a7f3d0",
            fontFamily: "'Prompt', 'Kanit', 'sans-serif'",
            letterSpacing: 1,
            zIndex: 9999,
            textAlign: "center",
            animation: "slideDownPop 0.5s cubic-bezier(.4,2,.6,1) forwards",
          }}
        >
          ✅ บันทึกข้อมูลสำเร็จ!
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translate(-50%, -120%)",
            background: "#fff",
            color: "#dc2626",
            fontWeight: "bold",
            fontSize: 18,
            padding: "10px 32px",
            borderRadius: 12,
            border: "2px solid #ef4444",
            boxShadow: "0 4px 16px #fecaca",
            fontFamily: "'Prompt', 'Kanit', 'sans-serif'",
            letterSpacing: 1,
            zIndex: 9999,
            textAlign: "center",
            animation: "slideDownPop 0.5s cubic-bezier(.4,2,.6,1) forwards",
          }}
        >
          ❌ {errorMessage}
        </div>
      )}

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes slideDownPop {
            0% {
              transform: translate(-50%, -120%) scale(0.8);
              opacity: 0;
            }
            60% {
              transform: translate(-50%, 30px) scale(1.05);
              opacity: 1;
            }
            80% {
              transform: translate(-50%, 0px) scale(1.01);
            }
            100% {
              transform: translate(-50%, 0px) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{ flex: 1, padding: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              background: "#19b0d9",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 28,
              padding: "18px 48px",
              borderRadius: 8,
              border: "6px solid #31c3e7",
              boxShadow: "4px 4px 0 #31c3e7, 8px 8px 0 #2b2b3d",
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              letterSpacing: 2,
              textShadow: "2px 2px 0 #31c3e7",
              userSelect: "none",
            }}
          >
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
              width: 400,
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
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
              
              <div style={{ marginBottom: 16 }}>
                <label>หมายเลขบ้าน</label>
                <input
                  type="text"
                  name="Address"
                  value={form.Address}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                  style={{ 
                    width: "100%",
                    borderColor: showError ? "#ef4444" : "#d1d5db"
                  }}
                  placeholder="กรอกหมายเลขบ้าน (เช่น 101, 201)"
                />
                <small style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  * หมายเลขบ้านสามารถซ้ำได้ถ้าเป็นคนละประเภทบ้าน
                </small>
                {showError && (
                  <div style={{ 
                    color: "#dc2626", 
                    fontSize: "14px", 
                    marginTop: "4px",
                    fontWeight: "500"
                  }}>
                    {errorMessage}
                  </div>
                )}
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
                      maxHeight: 400,
                      borderRadius: 10,
                      objectFit: "contain",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto"
                    }}
                  />
                )}
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
    </div>
  );
}