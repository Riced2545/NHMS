import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

export default function AddHomeModal({ isOpen, onClose, onSuccess }) {
  const [homeTypes, setHomeTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    home_type_id: "",
    home_unit_id: ""
  });
  const [addressStart, setAddressStart] = useState("");
  const [addressEnd, setAddressEnd] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:3001/api/home_types").then(res => setHomeTypes(res.data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (form.home_type_id) {
      axios.get(`http://localhost:3001/api/home_units/${form.home_type_id}`)
        .then(res => setUnits(res.data));
    } else {
      setUnits([]);
    }
  }, [form.home_type_id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // แยกเลขที่บ้านกรณีมี "/"
      let prefix = "";
      let start = addressStart;
      let end = addressEnd || addressStart;

      if (addressStart.includes("/")) {
        [prefix, start] = addressStart.split("/");
        start = parseInt(start);
        if (addressEnd && addressEnd.includes("/")) {
          [, end] = addressEnd.split("/");
          end = parseInt(end);
        } else {
          end = parseInt(end);
        }
      } else {
        start = parseInt(addressStart);
        end = parseInt(addressEnd) || start;
      }

      if (!start || start < 1 || end < start) {
        toast.error("กรุณากรอกเลขที่บ้านเริ่มต้นและสุดท้ายให้ถูกต้อง");
        setLoading(false);
        return;
      }

      let addresses = [];
      for (let i = start; i <= end; i++) {
        addresses.push(prefix ? `${prefix}/${i}` : i.toString());
      }

      // สถานะ default เป็น "ไม่มีผู้พักอาศัย" (2)
      const statusId = "2";
      const formData = new FormData();
      formData.append("home_type_id", form.home_type_id);
      formData.append("home_unit_id", form.home_unit_id);
      formData.append("status_id", statusId);
      if (image) formData.append("image", image);
      formData.append("addresses", JSON.stringify(addresses));

      await axios.post("http://localhost:3001/api/homes/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("เพิ่มบ้านสำเร็จ!");
      setForm({ home_type_id: "", home_unit_id: "" });
      setAddressStart("");
      setAddressEnd("");
      setImage(null);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.15)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="modal-content" style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        padding: "40px",
        minWidth: "540px",
        maxWidth: "640px"
      }}>
        <h3 style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "28px",
          color: "#2563eb"
        }}>
          เพิ่มบ้านพัก
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
            <label style={{ width: 140, fontWeight: 500, alignSelf: "center" }}>
              ประเภทบ้าน <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select name="home_type_id" value={form.home_type_id} onChange={handleChange} required
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "16px"
              }}>
              <option value="">เลือกประเภทบ้าน</option>
              {homeTypes.map(ht => (
                <option key={ht.id} value={ht.id}>{ht.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
            <label style={{ width: 140, fontWeight: 500, alignSelf: "center" }}>
              หน่วยบ้าน <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select name="home_unit_id" value={form.home_unit_id} onChange={handleChange} required
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "16px"
              }}>
              <option value="">เลือกหน่วยบ้าน</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.unit_name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
            <label style={{ width: 140, fontWeight: 500, alignSelf: "center" }}>
              เลขที่บ้าน <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              min="1"
              placeholder="เริ่มต้น เช่น 101"
              value={addressStart}
              onChange={e => setAddressStart(e.target.value)}
              required
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "16px"
              }}
            />
            <span style={{ alignSelf: "center" }}>ถึง</span>
            <input
              type="text"
              min={addressStart || 1}
              placeholder="สิ้นสุด (ถ้าเพิ่มหลายหลัง)"
              value={addressEnd}
              onChange={e => setAddressEnd(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "16px"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
            <label style={{ width: 140, fontWeight: 500, alignSelf: "center" }}>
              รูปภาพ
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange}
              style={{
                flex: 1,
                padding: "8px 0"
              }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button type="submit" disabled={loading}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 32px",
                fontWeight: 600,
                fontSize: "18px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59,130,246,0.12)"
              }}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}
              style={{
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                padding: "12px 32px",
                fontWeight: 600,
                fontSize: "18px",
                cursor: "pointer"
              }}>
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}