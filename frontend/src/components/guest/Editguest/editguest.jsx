import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { formatThaiDate } from "../../../utils/dateUtils";

export default function EditGuest() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    // ดึงข้อมูล guest
    axios.get(`http://localhost:3001/api/guests/${id}`)
      .then(res => {
        setForm({
          rank_id: res.data.rank_id || "",
          name: res.data.name || "",
          lname: res.data.lname || "",
          dob: res.data.dob || "",
          phone: res.data.phone || "",
          job_phone: res.data.job_phone || ""
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // ดึงยศจาก database
    axios.get("http://localhost:3001/api/ranks")
      .then(res => setRanks(res.data));
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // ตัด dob ออกจากข้อมูลที่จะส่ง
      const { dob, ...dataToSend } = form;
      await axios.put(`http://localhost:3001/api/guests/${id}`, dataToSend);
      alert("บันทึกข้อมูลสำเร็จ");
      navigate(-1);
    } catch {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) return <div style={{ padding: 32 }}>กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px #e5e7eb",
          padding: "32px 32px 24px 32px",
          width: "100%",
          maxWidth: 420
        }}
      >
        <h2 style={{ color: "#189ee9", textAlign: "center", marginBottom: 24 }}>แก้ไขข้อมูลผู้พักอาศัย</h2>
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
          <label>วันเกิด (ปี พ.ศ.)</label>
          <input
            type="text"
            name="dob"
            value={
              form.dob
                ? (formatThaiDate(form.dob) || form.dob) // ถ้า formatThaiDate คืนค่าว่าง ให้แสดง form.dob ตรงๆ
                : ""
            }
            disabled
            readOnly
            style={{
              ...inputStyle,
              background: "#f3f4f6",
              color: "#888",
              cursor: "not-allowed"
            }}
          />
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