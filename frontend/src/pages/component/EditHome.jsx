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
    image: null
  });
  const [homeTypes, setHomeTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // โหลดข้อมูลบ้านเมื่อ modal เปิด
  useEffect(() => {
    if (isOpen && homeId) {
      console.log("Loading data for home ID:", homeId);
      fetchHomeData();
      fetchHomeTypes();
      fetchStatuses();
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
      
      // เปลี่ยนจาก alert เป็น toast
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
      
      // เปลี่ยนจาก alert เป็น toast
      toast.error("ไม่สามารถโหลดสถานะได้", {
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
      setFormData({
        Address: home.Address || "",
        home_type_id: home.home_type_id || "",
        status_id: home.status_id || "",
        image: null
      });
      if (home.image) {
        setPreviewImage(`http://localhost:3001/uploads/${home.image}`);
      } else {
        setPreviewImage("");
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
      
      // เปลี่ยนจาก alert เป็น toast
      toast.error("ไม่สามารถโหลดข้อมูลบ้านได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // แสดง preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
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
      
      // เปลี่ยนจาก alert เป็น toast
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
      
      onUpdate(); // เรียก callback เพื่อรีเฟรชข้อมูล
      
      // รอให้ toast แสดงแล้วค่อยปิด modal
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error("Error updating home:", error);
      console.error("Error response:", error.response?.data);
      
      // เปลี่ยนจาก alert เป็น toast
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

  if (!isOpen) return null;

  console.log("Rendering modal with:", { homeTypes, statuses, formData });

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>แก้ไขข้อมูลบ้าน</h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>หมายเลขบ้าน:</label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>ประเภทบ้าน:</label>
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
              <label>สถานะ:</label>
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
              <label>รูปภาพ:</label>
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
              <button type="button" className="btn-cancel" onClick={onClose}>
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="btn-save" 
                disabled={loading}
                onClick={(e) => {
                  console.log("Save button clicked!");
                }}
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Toast Container */}
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
        style={{ zIndex: 10000 }}
      />
    </>
  );
}