import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Addguest.css";

export default function AddGuestModal({ isOpen, onClose, homeId, onUpdate }) {
  const [form, setForm] = useState({
    home_id: homeId || "",
    rank_id: "",
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
  const [eligibleRanks, setEligibleRanks] = useState([]); // เพิ่ม state สำหรับยศที่มีสิทธิ์
  const [loading, setLoading] = useState(false);

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

  // โหลดข้อมูลเมื่อ modal เปิด
  useEffect(() => {
    if (isOpen && homeId) {
      fetchHomeData();
      fetchRanks();
      // รีเซ็ตฟอร์ม
      setForm({
        home_id: homeId || "",
        rank_id: "",
        name: "",
        lname: "",
        dob: "",
        pos: "",
        income: "",
        phone: "",
        job_phone: ""
      });
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [isOpen, homeId]);

  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/homes`);
      const found = response.data.find(h => String(h.home_id) === String(homeId));
      setHome(found);
    } catch (error) {
      console.error("Error fetching home data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลบ้านได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fetchRanks = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/ranks");
      setRanks(response.data);
    } catch (error) {
      console.error("Error fetching ranks:", error);
      toast.error("ไม่สามารถโหลดข้อมูลยศได้", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // ตรวจสอบและกรองยศที่มีสิทธิ์เมื่อโหลดบ้านเสร็จ
  useEffect(() => {
    const checkEligibleRanks = async () => {
      if (home && ranks.length > 0) {
        try {
          const eligibilityChecks = await Promise.all(
            ranks.map(async (rank) => {
              try {
                const response = await axios.get("http://localhost:3001/api/eligibility", {
                  params: {
                    home_type_id: home.home_type_id,
                    rank_id: rank.id
                  }
                });
                return {
                  ...rank,
                  eligible: response.data.eligible
                };
              } catch (error) {
                console.error(`Error checking eligibility for rank ${rank.id}:`, error);
                return {
                  ...rank,
                  eligible: false
                };
              }
            })
          );
          
          // กรองเฉพาะยศที่มีสิทธิ์
          const eligible = eligibilityChecks.filter(rank => rank.eligible);
          
          // เรียงลำดับตาม rank.id (จากน้อยไปมาก)
          const sortedEligible = eligible.sort((a, b) => a.id - b.id);
          
          setEligibleRanks(sortedEligible);
          
          // ถ้าตัวเลือกปัจจุบันไม่มีสิทธิ์ ให้รีเซ็ต
          if (form.rank_id && !sortedEligible.find(r => r.id === parseInt(form.rank_id))) {
            setForm(prev => ({ ...prev, rank_id: "" }));
          }
          
        } catch (error) {
          console.error("Error checking eligibility:", error);
          setEligibleRanks([]);
        }
      }
    };

    checkEligibleRanks();
  }, [home, ranks]);

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
      setDay(String(Number(d)));
    }
  }, [form.dob]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.home_id) {
      toast.error("ไม่พบข้อมูลบ้านพัก", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // ตรวจสอบว่ายศที่เลือกมีสิทธิ์หรือไม่
    const selectedRank = eligibleRanks.find(r => r.id === parseInt(form.rank_id));
    if (!selectedRank) {
      toast.error("ยศที่เลือกไม่มีสิทธิ์เข้าพักในประเภทบ้านนี้", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...form,
        home_id: Number(form.home_id)
      };
      
      await axios.post("http://localhost:3001/api/guests", data);
      
      toast.success("บันทึกข้อมูลสำเร็จ!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#ffffffff',
          color: 'grey',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });

      onUpdate(); // เรียก callback เพื่อรีเฟรชข้อมูล
      
      // รอให้ toast แสดงแล้วค่อยปิด modal
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Error adding guest:", err);
      const errorMessage = err?.response?.data?.error || err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      
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

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-horizontal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>เพิ่มข้อมูลผู้พักอาศัย</h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form-horizontal">
            {/* แถวที่ 1 */}
            <div className="form-row-horizontal">
              <div className="form-field">
                <label>บ้านพัก</label>
                <div className="home-display">
                  {home ? `${home.hType} หมายเลข ${home.Address}` : "กำลังโหลด..."}
                </div>
                <input type="hidden" name="home_id" value={form.home_id} />
              </div>
              
              <div className="form-field">
                <label>ยศ/ตำแหน่ง <span className="required">*</span></label>
                <select
                  name="rank_id"
                  value={form.rank_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกยศ</option>
                  {eligibleRanks.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                {eligibleRanks.length === 0 && home && (
                  <div className="info-message">
                    ไม่มียศที่มีสิทธิ์เข้าพักในประเภทบ้านนี้
                  </div>
                )}
                {/* {eligibleRanks.length > 0 && (
                  <div className="info-message">
                    มี {eligibleRanks.length} ยศที่มีสิทธิ์เข้าพัก
                  </div>
                )} */}
              </div>
            </div>

            {/* แถวที่ 2 */}
            <div className="form-row-horizontal">
              <div className="form-field">
                <label>ชื่อ <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-field">
                <label>นามสกุล <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="lname" 
                  value={form.lname} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* แถวที่ 3 */}
            <div className="form-row-horizontal">
              <div className="form-field">
                <label>วันเกิด <span className=""></span></label>
                <div className="date-select-horizontal">
                  <select name="day" value={day} onChange={e => setDay(e.target.value)} >
                    <option value="">วัน</option>
                    {[...Array(31)].map((_, i) => {
                      const d = i + 1;
                      return <option key={d} value={d}>{d}</option>;
                    })}
                  </select>
                  <select name="month" value={month} onChange={e => setMonth(e.target.value)} >
                    <option value="">เดือน</option>
                    {months.map((m, i) => {
                      return <option key={i} value={i}>{m}</option>;
                    })}
                  </select>
                  <select name="year" value={year} onChange={e => setYear(e.target.value)} >
                    <option value="">ปี</option>
                    {years.map((y) => {
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                </div>
              </div>
              
              <div className="form-field">
                <label>ตำแหน่งงาน <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="pos" 
                  value={form.pos} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* แถวที่ 4 */}
            <div className="form-row-horizontal">
              <div className="form-field">
                <label>รายได้ <span className="required">*</span></label>
                <input 
                  type="number" 
                  name="income" 
                  value={form.income} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-field">
                <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* แถวที่ 5 */}
            <div className="form-row-horizontal">
              <div className="form-field">
                <label>เบอร์โทรที่ทำงาน <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="job_phone" 
                  value={form.job_phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-field">
                {/* ช่องว่างสำหรับสมดุล */}
              </div>
            </div>

            <div className="modal-actions-horizontal">
              <button type="button" className="btn-cancel" onClick={onClose}>
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="btn-save" 
                disabled={loading || eligibleRanks.length === 0}
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