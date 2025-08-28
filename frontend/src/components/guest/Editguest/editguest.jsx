import { useEffect, useState } from "react";
import axios from "axios";
import { formatThaiDate, parseThaiDate, splitThaiDate, joinThaiDate } from "../../../utils/dateUtils";
import { toast } from "react-toastify";

export default function EditGuestModal({ open, onClose, guestId, onSaved }) {
  const [form, setForm] = useState({
    rank_id: "",
    name: "",
    lname: "",
    dob: "",
    phone: "",
    job_phone: ""
  });
  const [loading, setLoading] = useState(true);
  const [ranks, setRanks] = useState([]);

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const currentYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - 99 + i).toString()); // เริ่มจากปีเก่าสุด

  const [dobParts, setDobParts] = useState({ day: "", month: "", year: "" });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get(`http://localhost:3001/api/guests/${guestId}`)
      .then(res => {
        const dob = res.data.dob ? formatThaiDate(res.data.dob) : "";
        setForm({
          rank_id: res.data.rank_id || "",
          name: res.data.name || "",
          lname: res.data.lname || "",
          dob,
          phone: res.data.phone || "",
          job_phone: res.data.job_phone || ""
        });
        setDobParts(splitThaiDate(dob));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    axios.get("http://localhost:3001/api/ranks")
      .then(res => setRanks(res.data));
  }, [guestId, open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDobChange = e => {
    const { name, value } = e.target;
    const newDob = { ...dobParts, [name]: value };
    setDobParts(newDob);
    setForm({ ...form, dob: joinThaiDate(newDob.day, newDob.month, newDob.year) });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { dob, ...dataToSend } = form;
      await axios.put(`http://localhost:3001/api/guests/${guestId}`, {
        ...dataToSend,
        dob: parseThaiDate(dob)
      });
      toast.success("บันทึกข้อมูลสำเร็จ!", { position: "top-right" });
      if (onSaved) onSaved();
      onClose();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล", { position: "top-right" });
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 24px #e5e7eb",
        padding: "32px 32px 24px 32px",
        width: "100%",
        maxWidth: 420,
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer"
          }}
        >×</button>
        <h2 style={{ color: "#189ee9", textAlign: "center", marginBottom: 24 }}>แก้ไขข้อมูลผู้พักอาศัย</h2>
        {loading ? (
          <div style={{ padding: 32 }}>กำลังโหลดข้อมูล...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>ยศ/ตำแหน่ง</label>
              <select
                name="rank_id"
                value={form.rank_id}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="">-- เลือกยศ/ตำแหน่ง --</option>
                {ranks.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>ชื่อ</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>นามสกุล</label>
              <input
                type="text"
                name="lname"
                value={form.lname}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>วันเกิด</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  name="day"
                  value={dobParts.day}
                  onChange={handleDobChange}
                  required
                  style={inputStyle}
                >
                  <option value="">วัน</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  name="month"
                  value={dobParts.month}
                  onChange={handleDobChange}
                  required
                  style={inputStyle}
                >
                  <option value="">เดือน</option>
                  {thaiMonths.map((m, idx) => (
                    <option key={idx + 1} value={(idx + 1).toString().padStart(2, "0")}>{m}</option>
                  ))}
                </select>
                <select
                  name="year"
                  value={dobParts.year}
                  onChange={handleDobChange}
                  required
                  style={inputStyle}
                >
                  <option value="">ปี</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>เบอร์โทรศัพท์</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label>เบอร์โทรที่ทำงาน</label>
              <input
                type="text"
                name="job_phone"
                value={form.job_phone}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              style={{
                background: "#189ee9",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 16px",
                width: "100%",
                cursor: "pointer",
                fontSize: 16
              }}
            >
              บันทึกข้อมูล
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 16,
  color: "#111827",
  background: "#f9fafb",
  outline: "none",
  transition: "border-color 0.2s",
};

inputStyle["&:focus"] = {
  borderColor: "#2563eb",
};