import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ScoreForm() {
	const [step, setStep] = useState(1);
    const [criteria, setCriteria] = useState([]);
    const [selected, setSelected] = useState([]);
    const [ranks, setRanks] = useState([]);
    const [rankId, setRankId] = useState("");
    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [details, setDetails] = useState(""); // เพิ่ม state สำหรับรายละเอียด
    const [saving, setSaving] = useState(false);
    const [childrenEdu, setChildrenEdu] = useState({
        kinder: 0,
        primary: 0,
        secondary: 0,
        university: 0
    });
    // เพิ่ม state
    const [waitMonth, setWaitMonth] = useState(0);

    // ดึงข้อมูลยศจาก backend
    useEffect(() => {
        axios.get("http://localhost:3001/api/ranks").then(res => {
            setRanks(res.data);
        });
    }, []);

    // ดึง criteria จาก backend
    useEffect(() => {
        axios.get("http://localhost:3001/api/score-criteria").then(res => {
            setCriteria(res.data);
            setSelected(Array(res.data.length).fill(null));
        });
    }, []);

    // ถ้าเลือกยศที่เป็น "นาย", "นาง", "นางสาว" ให้ setTitle อัตโนมัติ
    useEffect(() => {
        const rankObj = ranks.find(r => r.id == rankId);
        if (rankObj && ["นาย", "นาง", "นางสาว"].includes(rankObj.name)) {
            setTitle(rankObj.name);
        } else {
            setTitle("");
        }
    }, [rankId, ranks]);

    const handleChange = (criIdx, optIdx) => {
        const newSelected = [...selected];
        newSelected[criIdx] = optIdx;
        setSelected(newSelected);
    };

    const totalScore = selected.reduce((sum, optIdx, criIdx) => {
      if (criIdx === 6) {
        // ข้อ 7: คำนวณจาก childrenEdu
        return sum +
          (childrenEdu.kinder * 1) +
          (childrenEdu.primary * 2) +
          (childrenEdu.secondary * 3) +
          (childrenEdu.university * 5);
      }
      // ข้ออื่น: ใช้คะแนนจาก options
      const cri = criteria[criIdx];
      if (!cri || !cri.options || optIdx == null) return sum;
      return sum + (cri.options[optIdx]?.score || 0);
    }, 0) + Math.floor(waitMonth / 3); // เพิ่มคะแนนไตรมาส

    // ขั้นตอนที่ 1: กรอกข้อมูลส่วนตัว
    const handleNext = () => {
        if (!rankId && !title) return alert("กรุณาเลือกคำนำหน้า/ยศ");
        if (!name || !lname || !phone) return alert("กรุณากรอกข้อมูลให้ครบ");
        setStep(2);
    };

    // ขั้นตอนที่ 2: ส่งข้อมูลไป backend
    const handleSubmit = async () => {
        // ข้าม index 6 (ข้อที่ 7) เพราะใช้ input number
        const isMissing = selected.some((s, idx) =>
    idx !== 6 && idx !== criteria.length - 1 && s === null
);
        if (isMissing) return alert("กรุณาให้คะแนนครบทุกข้อ");
        setSaving(true);

        try {
            await axios.post("http://localhost:3001/api/score", {
                rank_id: rankId,
                title,
                name,
                lname,
                phone,
                total_score: totalScore,
                details
            });
            alert("บันทึกคะแนนสำเร็จ");
            setSelected(Array(criteria.length).fill(null));
            setRankId("");
            setTitle("");
            setName("");
            setLname("");
            setPhone("");
            setDetails("");
            setChildrenEdu({ kinder: 0, primary: 0, secondary: 0, university: 0 }); // รีเซตจำนวนบุตรแต่ละระดับ
            setWaitMonth(0); // รีเซตจำนวนเดือน
            setStep(1);
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการบันทึก");
        }
        setSaving(false);
    };

    return (
        <div className="h-screen w-screen bg-blue-50 flex justify-center items-center p-5">
            <div
                style={{
                    maxWidth: 600,
                    width: "100%",
                    background: "#ffffff",
                    borderRadius: 10,
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                    border: "1px solid #e0e7ff",
                    maxHeight: "calc(100vh - 4rem)",
                    overflowY: "auto",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "20px 30px",
                        background: "#ffffff",
                        borderBottom: "1px solid #e0e7ff",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#1e40af",
                        }}
                    >
                        แบบฟอร์มให้คะแนนการเข้าพัก
                    </h2>
                </div>

                {/* Step 1: ข้อมูลส่วนตัว */}
                {step === 1 && (
                    <div style={{ padding: "20px 30px" }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: "bold", marginRight: 8 }}>คำนำหน้า/ยศ:</label>
                            <select
                                value={rankId}
                                onChange={e => setRankId(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    fontSize: "15px",
                                    marginRight: 10
                                }}
                            >
                                <option value="">-- เลือก --</option>
                                {ranks.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: "bold", marginRight: 8 }}>ชื่อ:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    fontSize: "15px",
                                    width: "60%"
                                }}
                                placeholder="ชื่อจริง"
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: "bold", marginRight: 8 }}>นามสกุล:</label>
                            <input
                                type="text"
                                value={lname}
                                onChange={e => setLname(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    fontSize: "15px",
                                    width: "60%"
                                }}
                                placeholder="นามสกุล"
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: "bold", marginRight: 8 }}>เบอร์โทร:</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    fontSize: "15px",
                                    width: "60%"
                                }}
                                placeholder="เบอร์โทรศัพท์"
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: "bold", marginRight: 8 }}>รายละเอียดการให้คะแนน:</label>
                            <textarea
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    fontSize: "15px",
                                    width: "60%",
                                    minHeight: "60px"
                                }}
                                placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                            />
                        </div>
                        <div style={{ textAlign: "center", marginTop: 24 }}>
                            <button
                                type="button"
                                style={{
                                    background: "#0284c7",
                                    color: "white",
                                    border: "none",
                                    padding: "12px 30px",
                                    borderRadius: 6,
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    cursor: "pointer"
                                }}
                                onClick={handleNext}
                            >
                                ถัดไป
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: ฟอร์มคะแนน */}
                {step === 2 && (
                    <div style={{ padding: "20px 30px" }}>
                        {criteria.map((cri, criIdx) => {
                            if (criIdx === 6) {
                                return (
                                    <div key={cri.label} style={{ marginBottom: 32 }}>
                                        <div style={{ fontWeight: "500", marginBottom: 15, fontSize: "16px" }}>
                                            {criIdx + 1}. {cri.label}
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            gap: 32,
                                            flexWrap: "wrap",
                                            marginBottom: 10,
                                        }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 180 }}>
                                                <label style={{ fontWeight: "bold", marginBottom: 6 }}>อนุบาล <span style={{ color: "#0284c7" }}>x 1 คะแนน</span></label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={childrenEdu.kinder}
                                                    onChange={e => setChildrenEdu({ ...childrenEdu, kinder: +e.target.value })}
                                                    style={{
                                                        width: 100,
                                                        height: 48,
                                                        fontSize: 20,
                                                        borderRadius: 8,
                                                        border: "1.5px solid #a5b4fc",
                                                        padding: "8px 16px",
                                                        boxSizing: "border-box"
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 180 }}>
                                                <label style={{ fontWeight: "bold", marginBottom: 6 }}>ประถม <span style={{ color: "#0284c7" }}>x 2 คะแนน</span></label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={childrenEdu.primary}
                                                    onChange={e => setChildrenEdu({ ...childrenEdu, primary: +e.target.value })}
                                                    style={{
                                                        width: 100,
                                                        height: 48,
                                                        fontSize: 20,
                                                        borderRadius: 8,
                                                        border: "1.5px solid #a5b4fc",
                                                        padding: "8px 16px",
                                                        boxSizing: "border-box"
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 180 }}>
                                                <label style={{ fontWeight: "bold", marginBottom: 6 }}>มัธยม <span style={{ color: "#0284c7" }}>x 3 คะแนน</span></label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={childrenEdu.secondary}
                                                    onChange={e => setChildrenEdu({ ...childrenEdu, secondary: +e.target.value })}
                                                    style={{
                                                        width: 100,
                                                        height: 48,
                                                        fontSize: 20,
                                                        borderRadius: 8,
                                                        border: "1.5px solid #a5b4fc",
                                                        padding: "8px 16px",
                                                        boxSizing: "border-box"
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 180 }}>
                                                <label style={{ fontWeight: "bold", marginBottom: 6 }}>อุดมศึกษา <span style={{ color: "#0284c7" }}>x 5 คะแนน</span></label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={childrenEdu.university}
                                                    onChange={e => setChildrenEdu({ ...childrenEdu, university: +e.target.value })}
                                                    style={{
                                                        width: 100,
                                                        height: 48,
                                                        fontSize: 20,
                                                        borderRadius: 8,
                                                        border: "1.5px solid #a5b4fc",
                                                        padding: "8px 16px",
                                                        boxSizing: "border-box"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // ข้ออื่น (รวมข้อ 8)
                            return (
                                <div key={cri.label} style={{
                                    marginBottom: 20,
                                    paddingBottom: 20,
                                    borderBottom: criIdx < criteria.length - 1 ? "1px solid #e0e7ff" : "none",
                                }}>
                                    <div style={{
                                        fontWeight: "500",
                                        marginBottom: 15,
                                        fontSize: "16px",
                                        color: "#1f2937",
                                        lineHeight: "1.5",
                                    }}>
                                        {criIdx + 1}. {cri.label}
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                    }}>
                                        {cri.options.map((opt, optIdx) => (
                                            <label key={opt.id} style={{
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "12px 15px",
                                                background: selected[criIdx] === optIdx ? "#e0f2fe" : "#ffffff",
                                                border: selected[criIdx] === optIdx ? "2px solid #0284c7" : "1px solid #e5e7eb",
                                                borderRadius: 6,
                                                transition: "all 0.2s ease",
                                                fontSize: "14px",
                                                color: "#374151",
                                            }}>
                                                <input
                                                    type="radio"
                                                    name={`criteria-${criIdx}`}
                                                    checked={selected[criIdx] === optIdx}
                                                    onChange={() => handleChange(criIdx, optIdx)}
                                                    style={{
                                                        marginRight: 10,
                                                        accentColor: "#0284c7",
                                                    }}
                                                />
                                                <span style={{ flex: 1 }}>
                                                    {opt.label}
                                                    <span style={{
                                                        color: "#6b7280",
                                                        fontWeight: "400",
                                                        marginLeft: 5,
                                                        fontSize: "13px",
                                                    }}>
                                                        ({opt.score} คะแนน)
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* ข้อ 9: คะแนนไตรมาส (แยกนอก map) */}
                        <div style={{ marginBottom: 32 }}>
    <div style={{ fontWeight: "500", marginBottom: 15, fontSize: "16px" }}>
        {criteria.length + 1}. คะแนนไตรมาส (นับจากวันที่คณะกรรมการพิจารณาเข้าลำดับครั้งแรก 3 เดือน = 1 คะแนน)
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <label style={{ fontWeight: "bold" }}>จำนวนเดือน:</label>
        <input
            type="number"
            min={0}
            value={waitMonth}
            onChange={e => setWaitMonth(+e.target.value)}
            style={{
                width: 100,
                height: 48,
                fontSize: 20,
                borderRadius: 8,
                border: "1.5px solid #a5b4fc",
                padding: "8px 16px",
                boxSizing: "border-box"
            }}
        />
        <span style={{ fontWeight: "bold", color: "#0284c7" }}>
            = {Math.floor(waitMonth / 3)} คะแนน
        </span>
    </div>
</div>

                        {/* Score Display */}
                        <div style={{
                            background: "#0284c7",
                            color: "white",
                            padding: "15px 20px",
                            borderRadius: 6,
                            textAlign: "center",
                            marginTop: 20,
                            marginBottom: 20,
                        }}>
                            <div style={{
                                fontWeight: "600",
                                fontSize: "16px",
                            }}>
                                รวมคะแนนที่ได้: {totalScore} คะแนน
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div style={{ textAlign: "center" }}>
                            <button
                                type="button"
                                style={{
                                    background: "#0284c7",
                                    color: "white",
                                    border: "none",
                                    padding: "12px 30px",
                                    borderRadius: 6,
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    opacity: saving ? 0.6 : 1
                                }}
                                disabled={saving}
                                onClick={handleSubmit}
                            >
                                {saving ? "กำลังบันทึก..." : "บันทึกคะแนน"}
                            </button>
                            <button
                                type="button"
                                style={{
                                    marginLeft: 16,
                                    background: "#e5e7eb",
                                    color: "#374151",
                                    border: "none",
                                    padding: "12px 30px",
                                    borderRadius: 6,
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    cursor: "pointer"
                                }}
                                onClick={() => setStep(1)}
                            >
                                ย้อนกลับ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}