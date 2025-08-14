import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Addguest.css";

export default function AddGuestModal({ isOpen, onClose, homeId, onUpdate }) {
  // State สำหรับขั้นตอนต่างๆ
  const [step, setStep] = useState("right_holder");
  const [familyCount, setFamilyCount] = useState(0);
  const [currentFamilyIndex, setCurrentFamilyIndex] = useState(0);
  const [rightHolderData, setRightHolderData] = useState(null);
  const [familyForms, setFamilyForms] = useState([]);
  
  // เพิ่ม state สำหรับตรวจสอบผู้ถือสิทธิ
  const [hasRightHolder, setHasRightHolder] = useState(false);
  const [currentRightHolder, setCurrentRightHolder] = useState(null);
  
  // เพิ่ม state สำหรับ preview รูปภาพ
  const [previewImage, setPreviewImage] = useState(null);

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
    is_right_holder: false,
    image: null
  });
  const [home, setHome] = useState(null);
  const [ranks, setRanks] = useState([]);
  const [eligibleRanks, setEligibleRanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingGuests, setExistingGuests] = useState([]);

  // สำหรับวัน เดือน ปี ของผู้ถือสิทธิ
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // สำหรับวัน เดือน ปี ของสมาชิกครอบครัว
  const [familyDays, setFamilyDays] = useState([]);
  const [familyMonths, setFamilyMonths] = useState([]);
  const [familyYears, setFamilyYears] = useState([]);

  // สร้าง options สำหรับปี พ.ศ.
  const buddhistYearNow = new Date().getFullYear() + 543;
  const years_options = [];
  for (let y = buddhistYearNow - 80; y <= buddhistYearNow; y++) {
    years_options.push(y);
  }
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  // แก้ไขฟังก์ชัน getStepTitle
  const getStepTitle = () => {
    if (hasRightHolder) {
      switch (step) {
        case "family_count": 
          return "👨‍👩‍👧‍👦 เพิ่มสมาชิกครอบครัว";
        case "family_forms": 
          return `👤 ข้อมูลสมาชิกครอบครัวคนที่ ${currentFamilyIndex + 1}`;
        default: 
          return "เพิ่มสมาชิกครอบครัว";
      }
    } else {
      switch (step) {
        case "right_holder": 
          return "🏠 เพิ่มผู้ถือสิทธิเข้าพัก";
        case "family_count": 
          return "👨‍👩‍👧‍👦 จำนวนสมาชิกครอบครัว";
        case "family_forms": 
          return `👤 ข้อมูลสมาชิกครอบครัวคนที่ ${currentFamilyIndex + 1}`;
        default: 
          return "เพิ่มผู้พัก";
      }
    }
  };

  // เพิ่มฟังก์ชันจัดการรูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
        return;
      }

      setForm(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // โหลดข้อมูลเมื่อ modal เปิด
  useEffect(() => {
    if (isOpen && homeId) {
      console.log("Modal opened, fetching data...");
      fetchHomeData();
      fetchRanks();
      fetchExistingGuests();
      checkRightHolder(); // เพิ่มการตรวจสอบผู้ถือสิทธิ
      resetModal();
    }
  }, [isOpen, homeId]);

  // เพิ่มฟังก์ชันตรวจสอบผู้ถือสิทธิ
  const checkRightHolder = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/guests/home/${homeId}`);
      const guests = response.data || [];
      const rightHolder = guests.find(guest => guest.is_right_holder === 1);
      
      if (rightHolder) {
        setHasRightHolder(true);
        setCurrentRightHolder(rightHolder);
        setStep("family_count"); // ไปขั้นตอนเพิ่มสมาชิกครอบครัวเลย
      } else {
        setHasRightHolder(false);
        setCurrentRightHolder(null);
        setStep("right_holder"); // ไปขั้นตอนเพิ่มผู้ถือสิทธิ
      }
    } catch (error) {
      console.error("Error checking right holder:", error);
      setHasRightHolder(false);
      setCurrentRightHolder(null);
      setStep("right_holder");
    }
  };

  const resetModal = () => {
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
      is_right_holder: true,
      image: null
    });
    setDay("");
    setMonth("");
    setYear("");
    setPreviewImage(null);
    setFamilyDays([]);
    setFamilyMonths([]);
    setFamilyYears([]);
  };

  // ฟังก์ชันอื่นๆ เหมือนเดิม...
  const fetchHomeData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/homes/${homeId}`);
      setHome(response.data);
    } catch (error) {
      console.error("Error fetching home data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลบ้านได้");
    }
  };

  const fetchRanks = async () => {
    try {
      // ดึงยศที่สามารถเข้าพักได้ตามบ้านที่เลือก
      const eligibleResponse = await axios.get(`http://localhost:3001/api/eligible-ranks/${homeId}`);
      const eligibleRanks = eligibleResponse.data || [];
      
      // ดึงยศทั้งหมดสำหรับ reference
      const allRanksResponse = await axios.get("http://localhost:3001/api/ranks");
      const allRanks = allRanksResponse.data || [];
      
      setRanks(allRanks);
      setEligibleRanks(eligibleRanks);
      
      console.log("📋 All ranks:", allRanks.length);
      console.log("✅ Eligible ranks for this home:", eligibleRanks.length);
      
      // แสดงรายชื่อยศที่สามารถเข้าได้
      console.log("Eligible ranks:", eligibleRanks.map(r => r.name));
      
    } catch (error) {
      console.error("Error fetching ranks:", error);
      setRanks([]);
      setEligibleRanks([]);
    }
  };

  const fetchExistingGuests = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/guests/home/${homeId}`);
      setExistingGuests(response.data || []);
    } catch (error) {
      console.error("Error fetching existing guests:", error);
      setExistingGuests([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleRightHolderSubmit = (e) => {
    e.preventDefault();
    
    // รวม วัน เดือน ปี เป็น dob
    if (day && month !== "" && year) {
      const dobString = `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setForm(prev => ({ ...prev, dob: dobString }));
    }
    
    setRightHolderData({ ...form, dob: form.dob || `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` });
    setStep("family_count");
    toast.success("บันทึกข้อมูลผู้ถือสิทธิแล้ว");
  };

  // แก้ไขฟังก์ชัน handleFamilyCountSubmit
  const handleFamilyCountSubmit = () => {
    if (familyCount === 0) {
      if (!hasRightHolder) {
        // ไม่มีสมาชิกครอบครัว - บันทึกเฉพาะผู้ถือสิทธิ
        saveRightHolderOnly();
      } else {
        toast.warning("กรุณาระบุจำนวนสมาชิกครอบครัวที่ต้องการเพิ่ม");
      }
      return;
    }
    
    // มีสมาชิกครอบครัว - ไปขั้นตอนกรอกข้อมูลครอบครัว
    setStep("family_forms");
    setCurrentFamilyIndex(0);
    
    // สร้างฟอร์มสำหรับสมาชิกครอบครัว
    const forms = [];
    const days = [];
    const months_arr = [];
    const years_arr = [];
    
    for (let i = 0; i < familyCount; i++) {
      forms.push({
        home_id: homeId,
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
      days.push("");
      months_arr.push("");
      years_arr.push("");
    }
    
    setFamilyForms(forms);
    setFamilyDays(days);
    setFamilyMonths(months_arr);
    setFamilyYears(years_arr);
  };

  // แก้ไขฟังก์ชัน saveRightHolderOnly
  const saveRightHolderOnly = async () => {
    if (!rightHolderData) return;
    
    setLoading(true);
    try {
      let guestData = { ...rightHolderData };
      
      if (rightHolderData.image) {
        console.log("📷 Uploading image:", rightHolderData.image.name);
        
        const formData = new FormData();
        formData.append('image', rightHolderData.image);
        
        const imageResponse = await axios.post("http://localhost:3001/api/upload", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log("✅ Image upload response:", imageResponse.data);
        guestData.image_url = imageResponse.data.imageUrl;
      }
      
      delete guestData.image;
      
      console.log("📤 Sending guest data:", guestData);
      
      await axios.post("http://localhost:3001/api/guests", {
        ...guestData,
        home_id: Number(guestData.home_id)
      });
      
      toast.success("บันทึกข้อมูลผู้ถือสิทธิสำเร็จ!");
      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Error adding right holder:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // แก้ไขฟังก์ชันจัดการฟอร์มสมาชิกครอบครัว
  const handleFamilyFormChange = (index, field, value) => {
    const updatedForms = [...familyForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value
    };
    setFamilyForms(updatedForms);
  };

  // เพิ่มฟังก์ชันจัดการวันเกิดสมาชิกครอบครัว
  const handleFamilyDateChange = (index, type, value) => {
    if (type === 'day') {
      const newDays = [...familyDays];
      newDays[index] = value;
      setFamilyDays(newDays);
    } else if (type === 'month') {
      const newMonths = [...familyMonths];
      newMonths[index] = value;
      setFamilyMonths(newMonths);
    } else if (type === 'year') {
      const newYears = [...familyYears];
      newYears[index] = value;
      setFamilyYears(newYears);
    }
  };

  const handleFamilyFormSubmit = (e) => {
    e.preventDefault();
    
    // รวม วัน เดือน ปี ของสมาชิกปัจจุบัน
    const currentDay = familyDays[currentFamilyIndex];
    const currentMonth = familyMonths[currentFamilyIndex];
    const currentYear = familyYears[currentFamilyIndex];
    
    if (currentDay && currentMonth !== "" && currentYear) {
      const dobString = `${currentYear}-${String(parseInt(currentMonth) + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
      handleFamilyFormChange(currentFamilyIndex, 'dob', dobString);
    }
    
    if (currentFamilyIndex < familyCount - 1) {
      setCurrentFamilyIndex(currentFamilyIndex + 1);
      toast.success(`บันทึกข้อมูลสมาชิกคนที่ ${currentFamilyIndex + 1} แล้ว`);
    } else {
      saveAllData();
    }
  };

  // แก้ไขฟังก์ชัน saveAllData
  const saveAllData = async () => {
    setLoading(true);
    try {
      if (hasRightHolder) {
        // มีผู้ถือสิทธิแล้ว - บันทึกเฉพาะสมาชิกครอบครัว
        const promises = familyForms.map(guestData => 
          axios.post("http://localhost:3001/api/guests", {
            ...guestData,
            home_id: Number(guestData.home_id)
          })
        );

        await Promise.all(promises);
        toast.success(`เพิ่มสมาชิกครอบครัว ${familyForms.length} คน สำเร็จ!`);
      } else {
        // ไม่มีผู้ถือสิทธิ - บันทึกทั้งผู้ถือสิทธิและสมาชิกครอบครัว
        const allData = [];
        
        if (rightHolderData) {
          let processedRightHolder = { ...rightHolderData };
          
          if (rightHolderData.image) {
            console.log("📷 Uploading right holder image:", rightHolderData.image.name);
            
            const formData = new FormData();
            formData.append('image', rightHolderData.image);
            
            const imageResponse = await axios.post("http://localhost:3001/api/upload", formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            console.log("✅ Right holder image upload response:", imageResponse.data);
            processedRightHolder.image_url = imageResponse.data.imageUrl;
          }
          
          delete processedRightHolder.image;
          allData.push(processedRightHolder);
        }
        
        allData.push(...familyForms);

        const promises = allData.map(guestData => {
          console.log("📤 Sending guest data:", guestData);
          return axios.post("http://localhost:3001/api/guests", {
            ...guestData,
            home_id: Number(guestData.home_id)
          });
        });

        await Promise.all(promises);
        toast.success(`บันทึกข้อมูลผู้พักอาศัย ${allData.length} คน สำเร็จ!`);
      }
      
      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Error adding guests:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบว่าไม่ปิด modal
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-horizontal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{getStepTitle()}</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* แสดงข้อมูลผู้ถือสิทธิปัจจุบัน (ถ้ามี) */}
          {hasRightHolder && currentRightHolder && (
            <div className="current-right-holder-info">
              <div className="info-header">
                <h4>👤 ผู้ถือสิทธิปัจจุบัน</h4>
              </div>
              <div className="info-content">
                <div className="right-holder-details">
                  {currentRightHolder.image_url && (
                    <img 
                      src={`http://localhost:3001${currentRightHolder.image_url}`}
                      alt="ผู้ถือสิทธิ"
                      className="right-holder-avatar"
                    />
                  )}
                  <div className="right-holder-text">
                    <strong>{currentRightHolder.name} {currentRightHolder.lname}</strong>
                    <span>ตำแหน่ง: {currentRightHolder.pos}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ขั้นตอนผู้ถือสิทธิ - แสดงเฉพาะเมื่อยังไม่มีผู้ถือสิทธิ */}
          {!hasRightHolder && step === "right_holder" && (
            <form onSubmit={handleRightHolderSubmit} className="modal-form-horizontal">
              <div className="step-info">
                <p>กรุณากรอกข้อมูลผู้ถือสิทธิในการเข้าพักบ้านหลังนี้</p>
              </div>

              {/* ส่วนรูปภาพ */}
              <div className="form-row-horizontal image-section">
                <div className="form-field image-upload-field">
                  <label>รูปภาพผู้ถือสิทธิ</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="right-holder-image"
                      className="image-input"
                    />
                    <label htmlFor="right-holder-image" className="image-upload-label">
                      📷 เลือกรูปภาพ
                    </label>
                    <div className="image-upload-hint">
                      รองรับไฟล์ JPG, PNG, GIF (สูงสุด 5MB)
                    </div>
                  </div>
                </div>
                
                <div className="form-field image-preview-field">
                  <label>ตัวอย่างรูปภาพ</label>
                  <div className="image-preview-container">
                    {previewImage ? (
                      <div className="image-preview-wrapper">
                        <img src={previewImage} alt="Preview" className="image-preview" />
                        <button
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, image: null }));
                            setPreviewImage(null);
                          }}
                          className="remove-image-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="no-image-placeholder">
                        <span>👤</span>
                        <p>ไม่มีรูปภาพ</p>
                      </div>
                    )}
                  </div>
                </div>
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
                    {eligibleRanks.map(rank => (
                      <option key={rank.id} value={rank.id}>
                        {rank.name}
                      </option>
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
                      {years_options.map((y) => {
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
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "กำลังบันทึก..." : "ถัดไป"}
                </button>
              </div>
            </form>
          )}

          {/* ขั้นตอนจำนวนสมาชิก */}
          {step === "family_count" && (
            <div className="modal-form-horizontal">
              <div className="step-info">
                <h3>เพิ่มสมาชิกครอบครัว</h3>
                <p>
                  {hasRightHolder 
                    ? "ต้องการเพิ่มสมาชิกครอบครัวกี่คน?" 
                    : "มีสมาชิกครอบครัวเพิ่มเติมกี่คน? (ไม่รวมผู้ถือสิทธิ)"
                  }
                </p>
              </div>
              
              <div className="form-field">
                <label>จำนวนสมาชิก</label>
                <input 
                  type="number" 
                  value={familyCount}
                  onChange={(e) => setFamilyCount(parseInt(e.target.value) || 0)}
                  min={hasRightHolder ? "1" : "0"}
                  max="5"
                />
              </div>

              <div className="modal-actions-horizontal">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={hasRightHolder ? onClose : () => setStep("right_holder")}
                >
                  {hasRightHolder ? "ยกเลิก" : "← กลับ"}
                </button>
                <button 
                  type="button" 
                  className="btn-save" 
                  onClick={handleFamilyCountSubmit}
                  disabled={hasRightHolder && familyCount === 0}
                >
                  {familyCount === 0 && !hasRightHolder ? "บันทึก" : "ถัดไป"}
                </button>
              </div>
            </div>
          )}
          
          {/* ขั้นตอนฟอร์มสมาชิกครอบครัว */}
          {step === "family_forms" && (
            <form onSubmit={handleFamilyFormSubmit} className="modal-form-horizontal">
              <div className="step-info">
                <h3>ข้อมูลสมาชิกครอบครัวคนที่ {currentFamilyIndex + 1}</h3>
                <p>กรุณากรอกข้อมูลสมาชิกครอบครัว ({currentFamilyIndex + 1} จาก {familyCount} คน)</p>
                
                {/* Progress bar */}
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentFamilyIndex + 1) / familyCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{currentFamilyIndex + 1}/{familyCount}</span>
                </div>
              </div>

              {/* ฟอร์มข้อมูลสมาชิก */}
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
                  <label>คำนำหน้า/ยศ <span className="required">*</span></label>
                  <input
                    type="text"
                    value={familyForms[currentFamilyIndex]?.rank_id || ""}
                    onChange={(e) => handleFamilyFormChange(currentFamilyIndex, 'rank_id', e.target.value)}
                    placeholder="เช่น นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง"
                    required
                  />
                  
                  <div className="field-hint">
                    กรุณากรอกคำนำหน้าหรือยศ เช่น นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง
                  </div>
                </div>
              </div>

              <div className="form-row-horizontal">
                <div className="form-field">
                  <label>ชื่อ <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={familyForms[currentFamilyIndex]?.name || ""}
                    onChange={(e) => handleFamilyFormChange(currentFamilyIndex, 'name', e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-field">
                  <label>นามสกุล <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={familyForms[currentFamilyIndex]?.lname || ""}
                    onChange={(e) => handleFamilyFormChange(currentFamilyIndex, 'lname', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-row-horizontal">
                <div className="form-field">
                  <label>ตำแหน่งงาน <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={familyForms[currentFamilyIndex]?.pos || ""}
                    onChange={(e) => handleFamilyFormChange(currentFamilyIndex, 'pos', e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-field">
                  <label>วันเกิด</label>
                  <div className="date-select-horizontal">
                    <select 
                      value={familyDays[currentFamilyIndex] || ""} 
                      onChange={e => handleFamilyDateChange(currentFamilyIndex, 'day', e.target.value)}
                    >
                      <option value="">วัน</option>
                      {[...Array(31)].map((_, i) => {
                        const d = i + 1;
                        return <option key={d} value={d}>{d}</option>;
                      })}
                    </select>
                    <select 
                      value={familyMonths[currentFamilyIndex] || ""} 
                      onChange={e => handleFamilyDateChange(currentFamilyIndex, 'month', e.target.value)}
                    >
                      <option value="">เดือน</option>
                      {months.map((m, i) => {
                        return <option key={i} value={i}>{m}</option>;
                      })}
                    </select>
                    <select 
                      value={familyYears[currentFamilyIndex] || ""} 
                      onChange={e => handleFamilyDateChange(currentFamilyIndex, 'year', e.target.value)}
                    >
                      <option value="">ปี</option>
                      {years_options.map((y) => {
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
                    value={familyForms[currentFamilyIndex]?.income || ""}
                    onChange={(e) => handleFamilyFormChange(currentFamilyIndex, 'income', e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-field">
                  <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={familyForms[currentFamilyIndex]?.phone || ""}
                    onChange={(e) => handleFamilyFormChange(currentFamilyIndex, 'phone', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-row-horizontal">
                <div className="form-field">
                  <label>เบอร์โทรที่ทำงาน <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={familyForms[currentFamilyIndex]?.job_phone || ""}
                    onChange={(e) => handleFamilyFormChange(currentFamilyIndex, 'job_phone', e.target.value)}
                    required 
                  />
                </div>
                <div className="form-field">
                  {/* สำหรับ balance layout */}
                </div>
              </div>

              <div className="modal-actions-horizontal">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    if (currentFamilyIndex > 0) {
                      setCurrentFamilyIndex(currentFamilyIndex - 1);
                    } else {
                      setStep("family_count");
                    }
                  }}
                >
                  ← {currentFamilyIndex > 0 ? 'คนก่อนหน้า' : 'กลับ'}
                </button>
                
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading 
                    ? "กำลังบันทึก..." 
                    : currentFamilyIndex < familyCount - 1 
                      ? "คนถัดไป →" 
                      : "บันทึกทั้งหมด"
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