import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Addguest.css";

export default function AddGuestModal({ isOpen, onClose, homeId, onUpdate }) {
  // State สำหรับขั้นตอนต่างๆ
  const [step, setStep] = useState("right_holder"); // "right_holder" | "family_count" | "family_forms"
  const [familyCount, setFamilyCount] = useState(0);
  const [currentFamilyIndex, setCurrentFamilyIndex] = useState(0);
  const [rightHolderData, setRightHolderData] = useState(null);
  const [familyForms, setFamilyForms] = useState([]);
  
  // State เดิม
  const [form, setForm] = useState({
    home_id: homeId || "",
    rank_id: "",
    name: "",
    lname: "",
    dob: "",
    pos: "",
    income: "",
    phone: "",
    job_phone: "",
    is_right_holder: false
  });
  const [home, setHome] = useState(null);
  const [ranks, setRanks] = useState([]);
  const [eligibleRanks, setEligibleRanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingGuests, setExistingGuests] = useState([]);

  // สำหรับวัน เดือน ปี
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // สร้าง options สำหรับปี พ.ศ.
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
      fetchExistingGuests();
      resetModal();
    }
  }, [isOpen, homeId]);

  const resetModal = () => {
    setStep("right_holder");
    setFamilyCount(0);
    setCurrentFamilyIndex(0);
    setRightHolderData(null);
    setFamilyForms([]);
    setForm({
      home_id: homeId || "",
      rank_id: "",
      name: "",
      lname: "",
      dob: "",
      pos: "",
      income: "",
      phone: "",
      job_phone: "",
      is_right_holder: true // เริ่มต้นเป็น true สำหรับผู้ถือสิทธิ
    });
    setDay("");
    setMonth("");
    setYear("");
  };

  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/homes`);
      const found = response.data.find(h => String(h.home_id) === String(homeId));
      setHome(found);
    } catch (error) {
      console.error("Error fetching home data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลบ้านได้");
    }
  };

  const fetchRanks = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/ranks");
      setRanks(response.data);
    } catch (error) {
      console.error("Error fetching ranks:", error);
      toast.error("ไม่สามารถโหลดข้อมูลยศได้");
    }
  };

  const fetchExistingGuests = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/guests/home/${homeId}`);
      setExistingGuests(response.data);
      
      // ถ้ามีผู้ถือสิทธิแล้ว ให้ข้ามไปหน้าเพิ่มสมาชิกครอบครัวเลย
      const hasRightHolder = response.data.some(guest => guest.is_right_holder);
      if (hasRightHolder) {
        setStep("family_count");
        setForm(prev => ({ ...prev, is_right_holder: false }));
      }
    } catch (error) {
      console.error("Error fetching existing guests:", error);
    }
  };

  const hasExistingRightHolder = () => {
    return existingGuests.some(guest => guest.is_right_holder);
  };

  // ตรวจสอบและกรองยศที่มีสิทธิ์
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
          
          const eligible = eligibilityChecks.filter(rank => rank.eligible);
          const sortedEligible = eligible.sort((a, b) => a.id - b.id);
          setEligibleRanks(sortedEligible);
          
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

  // จัดการวันที่
  useEffect(() => {
    if (day && month && year) {
      const christianYear = Number(year) - 543;
      const mm = String(Number(month) + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      setForm(f => ({ ...f, dob: `${christianYear}-${mm}-${dd}` }));
    }
  }, [day, month, year]);

  useEffect(() => {
    if (form.dob) {
      const [y, m, d] = form.dob.split("-");
      setYear((Number(y) + 543).toString());
      setMonth((Number(m) - 1).toString());
      setDay(String(Number(d)));
    }
  }, [form.dob]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const getMaxGuestsForHome = () => {
    if (!home) return 0;
    
    // ตรวจสอบตามประเภทบ้าน (ไม่ต้องแยกพื้นที่แล้ว)
    switch(home.hType) {
      case 'บ้านพักแฝด':  // รวมทั้งสองพื้นที่
        return 4;
      case 'บ้านพักเรือนแถว':
        return 6;
      default:
        return 4;
    }
  };

  // บันทึกข้อมูลผู้ถือสิทธิ
  const handleRightHolderSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.home_id) {
      toast.error("ไม่พบข้อมูลบ้านพัก");
      return;
    }

    const selectedRank = eligibleRanks.find(r => r.id === parseInt(form.rank_id));
    if (!selectedRank) {
      toast.error("ยศที่เลือกไม่มีสิทธิ์เข้าพักในประเภทบ้านนี้");
      return;
    }

    // บันทึกข้อมูลผู้ถือสิทธิ
    setRightHolderData({ ...form });
    setStep("family_count");
    
    toast.success("บันทึกข้อมูลผู้ถือสิทธิแล้ว");
  };

  // เมื่อเลือกจำนวนสมาชิกครอบครัว
  const handleFamilyCountSubmit = () => {
    const maxGuests = getMaxGuestsForHome();
    const currentGuests = home?.guest_count || 0;
    const totalGuests = currentGuests + (rightHolderData ? 1 : 0) + familyCount;
    
    if (totalGuests > maxGuests) {
      const available = maxGuests - currentGuests - (rightHolderData ? 1 : 0);
      toast.error(`ไม่สามารถเพิ่มได้ เหลือที่ว่างอีก ${available} คน`);
      return;
    }

    if (familyCount === 0) {
      // ถ้าไม่มีสมาชิกครอบครัว บันทึกเฉพาะผู้ถือสิทธิ
      saveRightHolderOnly();
    } else {
      // สร้างฟอร์มสำหรับสมาชิกครอบครัว
      const forms = Array(familyCount).fill(null).map(() => ({
        home_id: homeId || "",
        rank_id: "",
        name: "",
        lname: "",
        dob: "",
        pos: "",
        income: "",
        phone: "",
        job_phone: "",
        is_right_holder: false
      }));
      
      setFamilyForms(forms);
      setStep("family_forms");
      setCurrentFamilyIndex(0);
      
      // ตั้งค่าฟอร์มแรก
      setForm(forms[0]);
      setDay("");
      setMonth("");
      setYear("");
    }
  };

  // บันทึกเฉพาะผู้ถือสิทธิ
  const saveRightHolderOnly = async () => {
    if (!rightHolderData) return;
    
    setLoading(true);
    try {
      await axios.post("http://localhost:3001/api/guests", {
        ...rightHolderData,
        home_id: Number(rightHolderData.home_id)
      });
      
      toast.success("บันทึกข้อมูลผู้ถือสิทธิสำเร็จ!", {
        position: "top-right",
        autoClose: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });

      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Error adding right holder:", err);
      const errorMessage = err?.response?.data?.error || err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      
      toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
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

  // จัดการฟอร์มสมาชิกครอบครัว
  const handleFamilyFormSubmit = async (e) => {
    e.preventDefault();
    
    // สำหรับสมาชิกครอบครัวไม่ต้องตรวจสอบสิทธิ์
    // เพราะเป็นการเพิ่มสมาชิกครอบครัวของผู้ที่มีสิทธิ์แล้ว

    // บันทึกฟอร์มปัจจุบัน
    const updatedForms = [...familyForms];
    updatedForms[currentFamilyIndex] = { ...form };
    setFamilyForms(updatedForms);

    // ถ้าเป็นคนสุดท้าย ให้บันทึกทั้งหมด
    if (currentFamilyIndex === familyCount - 1) {
      await saveAllData(updatedForms);
    } else {
      // ไปฟอร์มคนถัดไป
      const nextIndex = currentFamilyIndex + 1;
      setCurrentFamilyIndex(nextIndex);
      setForm(updatedForms[nextIndex]);
      
      setDay("");
      setMonth("");
      setYear("");
      
      toast.success(`บันทึกข้อมูลสมาชิกคนที่ ${currentFamilyIndex + 1} แล้ว`);
    }
  };

  // บันทึกข้อมูลทั้งหมด (ผู้ถือสิทธิ + สมาชิกครอบครัว)
  const saveAllData = async (familyData) => {
    setLoading(true);

    try {
      const allData = [];
      
      // เพิ่มผู้ถือสิทธิ (ถ้ามี)
      if (rightHolderData) {
        allData.push(rightHolderData);
      }
      
      // เพิ่มสมาชิกครอบครัว
      allData.push(...familyData);

      const promises = allData.map(guestData => 
        axios.post("http://localhost:3001/api/guests", {
          ...guestData,
          home_id: Number(guestData.home_id)
        })
      );

      await Promise.all(promises);
      
      const totalAdded = allData.length;
      toast.success(`บันทึกข้อมูลผู้พักอาศัย ${totalAdded} คน สำเร็จ!`, {
        position: "top-right",
        autoClose: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });

      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Error adding guests:", err);
      const errorMessage = err?.response?.data?.error || err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      
      toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
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

  // กลับขั้นตอนก่อนหน้า
  const handleBack = () => {
    if (step === "family_count") {
      if (hasExistingRightHolder()) {
        onClose(); // ถ้ามีผู้ถือสิทธิแล้ว ให้ปิด modal
      } else {
        setStep("right_holder");
      }
    } else if (step === "family_forms") {
      if (currentFamilyIndex > 0) {
        // บันทึกฟอร์มปัจจุบันก่อน
        const updatedForms = [...familyForms];
        updatedForms[currentFamilyIndex] = { ...form };
        setFamilyForms(updatedForms);
        
        // ไปฟอร์มก่อนหน้า
        const prevIndex = currentFamilyIndex - 1;
        setCurrentFamilyIndex(prevIndex);
        setForm(updatedForms[prevIndex]);
        
        setDay("");
        setMonth("");
        setYear("");
      } else {
        setStep("family_count");
      }
    }
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    if (step === "right_holder") {
      return "เพิ่มข้อมูลผู้ถือสิทธิ";
    } else if (step === "family_count") {
      return hasExistingRightHolder() ? "เพิ่มสมาชิกครอบครัว" : "เพิ่มสมาชิกครอบครัว";
    } else if (step === "family_forms") {
      return `เพิ่มข้อมูลสมาชิกครอบครัว (คนที่ ${currentFamilyIndex + 1}/${familyCount})`;
    }
    return "เพิ่มข้อมูลผู้พักอาศัย";
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-horizontal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{getStepTitle()}</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {step === "right_holder" && (
            // ฟอร์มผู้ถือสิทธิ
            <form onSubmit={handleRightHolderSubmit} className="modal-form-horizontal">
              <div className="step-info">
                <p>กรุณากรอกข้อมูลผู้ถือสิทธิในการเข้าพักบ้านหลังนี้</p>
              </div>

              {/* ฟอร์มข้อมูลผู้ถือสิทธิ */}
              <div className="form-row-horizontal">
                <div className="form-field">
                  <label>บ้านพัก</label>
                  <input 
                    type="text" 
                    value={home ? `${home.hType} หมายเลข ${home.Address}` : "กำลังโหลด..."}
                    disabled
                    className="home-input-disabled"
                  />
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
                </div>
              </div>

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

              <div className="form-row-horizontal">
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
                
                <div className="form-field">
                  <label>วันเกิด</label>
                  <div className="date-select-horizontal">
                    <select name="day" value={day} onChange={e => setDay(e.target.value)}>
                      <option value="">วัน</option>
                      {[...Array(31)].map((_, i) => {
                        const d = i + 1;
                        return <option key={d} value={d}>{d}</option>;
                      })}
                    </select>
                    <select name="month" value={month} onChange={e => setMonth(e.target.value)}>
                      <option value="">เดือน</option>
                      {months.map((m, i) => {
                        return <option key={i} value={i}>{m}</option>;
                      })}
                    </select>
                    <select name="year" value={year} onChange={e => setYear(e.target.value)}>
                      <option value="">ปี</option>
                      {years.map((y) => {
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>

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
                  {/* สำหรับ balance layout */}
                </div>
              </div>

              <div className="modal-actions-horizontal">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-save" disabled={eligibleRanks.length === 0}>
                  ถัดไป
                </button>
              </div>
            </form>
          )}

          {step === "family_count" && (
            // หน้าเลือกจำนวนสมาชิกครอบครัว
            <div className="count-step-container">
              <div className="count-step-content">
                {hasExistingRightHolder() ? (
                  <div>
                    <label className="count-step-label">
                      ต้องการเพิ่มสมาชิกครอบครัวกี่คน?
                    </label>
                    <div className="existing-right-holder-info">
                      <span className="has-right-holder">
                        ✓ บ้านนี้มีผู้ถือสิทธิแล้ว
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="right-holder-saved">
                      <span className="success-check">✓</span>
                      <span>บันทึกข้อมูลผู้ถือสิทธิแล้ว: {rightHolderData?.name} {rightHolderData?.lname}</span>
                    </div>
                    <label className="count-step-label">
                      มีสมาชิกครอบครัวอื่นที่ต้องการเพิ่มมั้ย? ถ้ามีกี่คน?
                    </label>
                  </div>
                )}
                
                <div className="home-info">
                  บ้าน: {home ? `${home.hType} หมายเลข ${home.Address}` : "กำลังโหลด..."}
                  <br />
                  ผู้พักปัจจุบัน: {home?.guest_count || 0}/{getMaxGuestsForHome()} คน
                  <br />
                  จะเพิ่ม: {rightHolderData ? 1 : 0} + {familyCount} = {(rightHolderData ? 1 : 0) + familyCount} คน
                  <br />
                  เหลือที่ว่าง: {getMaxGuestsForHome() - (home?.guest_count || 0) - (rightHolderData ? 1 : 0)} คน
                </div>
                
                <div className="count-input-container">
                  <input 
                    type="number" 
                    min="0" 
                    max={getMaxGuestsForHome() - (home?.guest_count || 0) - (rightHolderData ? 1 : 0)}
                    value={familyCount}
                    onChange={(e) => setFamilyCount(parseInt(e.target.value) || 0)}
                    className="count-input"
                  />
                  <span className="count-unit">คน</span>
                </div>
                
                <div className="family-count-note">
                  * ใส่ 0 ถ้าไม่มีสมาชิกครอบครัวเพิ่มเติม
                </div>
              </div>
              
              <div className="count-step-actions">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="btn-cancel-count"
                >
                  กลับ
                </button>
                <button 
                  type="button" 
                  onClick={handleFamilyCountSubmit}
                  className="btn-next-count"
                >
                  {familyCount === 0 ? "บันทึกเสร็จสิ้น" : "ถัดไป"}
                </button>
              </div>
            </div>
          )}

          {step === "family_forms" && (
            // ฟอร์มสมาชิกครอบครัว
            <form onSubmit={handleFamilyFormSubmit} className="modal-form-horizontal">
              {/* Progress bar */}
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((currentFamilyIndex + 1) / familyCount) * 100}%` }}
                  />
                </div>
                <div className="progress-text">
                  สมาชิกครอบครัวคนที่ {currentFamilyIndex + 1} จาก {familyCount}
                </div>
              </div>

              {/* ฟอร์มข้อมูลสมาชิกครอบครัว */}
              <div className="form-row-horizontal">
                <div className="form-field">
                  <label>คำนำหน้า/ยศ <span className="required">*</span></label>
                  <input
                    type="text"
                    name="rank_id"
                    value={form.rank_id}
                    onChange={handleChange}
                    placeholder="เช่น นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง"
                    required
                  />
                  <div className="field-hint">
                    * สำหรับสมาชิกครอบครัว สามารถพิมพ์คำนำหน้าได้เลย
                  </div>
                </div>
                
                <div className="form-field">
                  <label>ตำแหน่งงาน</label>
                  <input 
                    type="text" 
                    name="pos" 
                    value={form.pos} 
                    onChange={handleChange} 
                    placeholder="ไม่มีก็ได้"
                  />
                </div>
              </div>

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

              <div className="form-row-horizontal">
                <div className="form-field">
                  <label>วันเกิด</label>
                  <div className="date-select-horizontal">
                    <select name="day" value={day} onChange={e => setDay(e.target.value)}>
                      <option value="">วัน</option>
                      {[...Array(31)].map((_, i) => {
                        const d = i + 1;
                        return <option key={d} value={d}>{d}</option>;
                      })}
                    </select>
                    <select name="month" value={month} onChange={e => setMonth(e.target.value)}>
                      <option value="">เดือน</option>
                      {months.map((m, i) => {
                        return <option key={i} value={i}>{m}</option>;
                      })}
                    </select>
                    <select name="year" value={year} onChange={e => setYear(e.target.value)}>
                      <option value="">ปี</option>
                      {years.map((y) => {
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>
                </div>
                
                <div className="form-field">
                  <label>รายได้</label>
                  <input 
                    type="number" 
                    name="income" 
                    value={form.income} 
                    onChange={handleChange} 
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-row-horizontal">
                <div className="form-field">
                  <label>เบอร์โทรศัพท์</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    placeholder="ไม่มีก็ได้"
                  />
                </div>
                
                <div className="form-field">
                  <label>เบอร์โทรที่ทำงาน</label>
                  <input 
                    type="text" 
                    name="job_phone" 
                    value={form.job_phone} 
                    onChange={handleChange} 
                    placeholder="ไม่มีก็ได้"
                  />
                </div>
              </div>

              <div className="modal-actions-horizontal">
                <button type="button" className="btn-cancel" onClick={handleBack}>
                  {currentFamilyIndex === 0 ? "กลับ" : "ก่อนหน้า"}
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading 
                    ? "กำลังบันทึก..." 
                    : currentFamilyIndex === familyCount - 1 
                      ? "บันทึกทั้งหมด" 
                      : "ถัดไป"
                  }
                </button>
              </div>
            </form>
          )}
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
        style={{ zIndex: 10000 }}
      />
    </>
  );
}