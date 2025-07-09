import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Addguest.css";
import axios from "axios";
import { useParams } from "react-router-dom";


export default function Addguest() {
  const { home_id } = useParams();
  const [form, setForm] = useState({
    home_id: home_id || "",
    rank: "",
    name: "",
    lname: "",
    dob: "",
    pos: "",
    income: "",
    phone: "",
    job_phone: ""
  });
  const [home, setHome] = useState(null);
  const [ranks, setRanks] = useState([]);
  const [eligibility, setEligibility] = useState(true); // true = มีสิทธิ์, false = ไม่มีสิทธิ์

  useEffect(() => {
    if (home_id) {
      axios.get(`http://localhost:3001/api/homes`)
        .then(res => {
          const found = res.data.find(h => String(h.home_id) === String(home_id));
          setHome(found);
        });
    }
  }, [home_id]);

  useEffect(() => {
    axios.get("http://localhost:3001/api/ranks").then(res => setRanks(res.data));
  }, []);

  // ตรวจสอบสิทธิ์เมื่อเลือกยศหรือโหลดบ้านเสร็จ
  useEffect(() => {
    if (home && form.rank_id) {
      axios.get("http://localhost:3001/api/eligibility", {
        params: {
          home_type_id: home.home_type_id,
          rank_id: form.rank_id
        }
      }).then(res => {
        setEligibility(res.data.eligible);
      });
    }
  }, [home, form.rank_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eligibility) {
      alert("ยศนี้ไม่มีสิทธิ์เข้าพักในประเภทบ้านนี้");
      return;
    }
    if (!form.home_id) {
      alert("ไม่พบข้อมูลบ้านพัก");
      return;
    }
    try {
      const data = {
        ...form,
        home_id: Number(form.home_id)
      };
      await axios.post("http://localhost:3001/api/guests", data);
      alert("บันทึกข้อมูลสำเร็จ");
      setForm({
        home_id: home_id || "",
        rank: "",
        name: "",
        lname: "",
        dob: "",
        pos: "",
        income: "",
        phone: "",
        job_phone: ""
      });
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล\n" + (err?.response?.data?.error || err.message));
    }
  };

  // สำหรับวัน เดือน ปี
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // สร้าง options สำหรับปี พ.ศ. และ ค.ศ.
  const buddhistYearNow = new Date().getFullYear() + 543;
  const years = [];
  for (let y = buddhistYearNow - 80; y <= buddhistYearNow; y++) {
    years.push(y);
  }
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  // เมื่อเลือกวัน/เดือน/ปี ให้แปลงเป็น yyyy-mm-dd (ค.ศ.) ใส่ใน form.dob
  useEffect(() => {
    if (day && month && year) {
      const christianYear = Number(year) - 543;
      const mm = String(Number(month) + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      setForm(f => ({ ...f, dob: `${christianYear}-${mm}-${dd}` }));
    }
  }, [day, month, year]);

  // ถ้ามี dob ใน form ให้แปลงกลับมาแสดงใน select
  useEffect(() => {
    if (form.dob) {
      const [y, m, d] = form.dob.split("-");
      setYear((Number(y) + 543).toString());
      setMonth((Number(m) - 1).toString());
      setDay(String(Number(d))); // <-- แก้ตรงนี้
    }
  }, [form.dob]);

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content">
        <div className="card">
          <h2 className="section-title">เพิ่มข้อมูลผู้พักอาศัย</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="full-row">
              <label>
                บ้านพัก{home ? ` ${home.hType}` : ""}
              </label>
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: 8,
                  background: "#f3f4f6",
                  padding: "6px 12px",
                  borderRadius: 6,
                  minHeight: 32,
                  color: "#374151"
                }}
              >
                {home ? home.Address : "กำลังโหลด..."}
              </div>
              {/* ซ่อน input home_id */}
              <input type="hidden" name="home_id" value={form.home_id} />
            </div>
            <div className="full-row">
              <label>ยศ/ตำแหน่ง</label>
              <select
                name="rank_id"
                value={form.rank_id}
                onChange={handleChange}
                required
              >
                <option value="">เลือกยศ</option>
                {ranks.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {/* แสดงข้อความถ้าไม่มีสิทธิ์ */}
              {form.rank_id && !eligibility && (
                <div style={{ color: "red", marginTop: 8 }}>
                  ยศนี้ไม่มีสิทธิ์เข้าพักในประเภทบ้านนี้
                </div>
              )}
            </div>
            <div>
              <label>ชื่อ</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label>นามสกุล</label>
              <input type="text" name="lname" value={form.lname} onChange={handleChange} required />
            </div>
            <div>
              <label>วันเกิด</label>
              <div className="date-select">
                <select name="day" value={day} onChange={e => setDay(e.target.value)} required>
                  <option value="">วัน</option>
                  {[...Array(31)].map((_, i) => {
                    const d = i + 1;
                    return <option key={d} value={d}>{d}</option>;
                  })}
                </select>
                <select name="month" value={month} onChange={e => setMonth(e.target.value)} required>
                  <option value="">เดือน</option>
                  {months.map((m, i) => {
                    return <option key={i} value={i}>{m}</option>;
                  })}
                </select>
                <select name="year" value={year} onChange={e => setYear(e.target.value)} required>
                  <option value="">ปี</option>
                  {years.map((y) => {
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
            </div>
            <div>
              <label>ตำแหน่งงาน</label>
              <input type="text" name="pos" value={form.pos} onChange={handleChange} required />
            </div>
            <div>
              <label>รายได้</label>
              <input type="number" name="income" value={form.income} onChange={handleChange} required />
            </div>
            <div>
              <label>เบอร์โทรศัพท์</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="full-row">
              <label>เบอร์โทรที่ทำงาน</label>
              <input type="text" name="job_phone" value={form.job_phone} onChange={handleChange} required />
            </div>
            <div className="form-actions full-row">
              <button
                type="reset"
                className="cancel-btn"
                onClick={() => setForm({
                  home_id: home_id || "",
                  rank: "",
                  name: "",
                  lname: "",
                  dob: "",
                  pos: "",
                  income: "",
                  phone: "",
                  job_phone: ""
                })}
              >
                ยกเลิก
              </button>
              <button type="submit" className="save-btn" > บันทึก</button>
            </div>
          </form>
          
        </div>
        
      </div>
    </div>
  );
}