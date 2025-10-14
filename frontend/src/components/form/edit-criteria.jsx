import React, { useEffect, useState } from "react";
import axios from "axios";

const apiBase = "http://localhost:3001/api";

export default function EditCriteria() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // โหลด criteria+options
  useEffect(() => {
    axios.get(`${apiBase}/score-criteria`).then(res => {
      setCriteria(res.data);
      setLoading(false);
    });
  }, []);

  // แก้ไขชื่อเกณฑ์
  const handleLabelChange = (criIdx, value) => {
    const newCriteria = [...criteria];
    newCriteria[criIdx].label = value;
    setCriteria(newCriteria);
  };

  // แก้ไขตัวเลือก/คะแนน
  const handleOptionChange = (criIdx, optIdx, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[criIdx].options[optIdx][field] = value;
    setCriteria(newCriteria);
  };

  // เพิ่มตัวเลือกใหม่
  const handleAddOption = async (criIdx) => {
    const cri = criteria[criIdx];
    const res = await axios.post(`${apiBase}/score-options`, {
      criteria_id: cri.id,
      label: "",
      score: 0
    });
    const newCriteria = [...criteria];
    newCriteria[criIdx].options.push({
      id: res.data.id,
      label: "",
      score: 0
    });
    setCriteria(newCriteria);
  };

  // ลบตัวเลือก
  const handleDeleteOption = async (criIdx, optIdx, optionId) => {
    await axios.delete(`${apiBase}/score-options/${optionId}`);
    const newCriteria = [...criteria];
    newCriteria[criIdx].options.splice(optIdx, 1);
    setCriteria(newCriteria);
  };

  // บันทึกการแก้ไข
  const handleSave = async () => {
    setSaving(true);
    for (const cri of criteria) {
      // อัปเดต label
      await axios.put(`${apiBase}/score-criteria/${cri.id}`, { label: cri.label });
      // อัปเดต options
      for (const opt of cri.options) {
        await axios.put(`${apiBase}/score-options/${opt.id}`, {
          label: opt.label,
          score: opt.score
        });
      }
    }
    setSaving(false);
    alert("บันทึกสำเร็จ");
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!Array.isArray(criteria) || criteria.length === 0) return <div style={{ padding: 40 }}>ไม่มีข้อมูลเกณฑ์</div>;

  return (
    <div style={{ padding: 40, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 32 }}>แก้ไขเกณฑ์/ตัวเลือก</h2>
      {criteria.map((cri, criIdx) => (
        <div key={cri.id} style={{ marginBottom: 32, borderBottom: "1px solid #eee", paddingBottom: 24 }}>
          <input
            type="text"
            value={cri.label}
            onChange={e => handleLabelChange(criIdx, e.target.value)}
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: "100%",
              marginBottom: 12,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #d1d5db"
            }}
          />
          <div style={{ marginLeft: 24 }}>
            {cri.options && cri.options.length > 0 ? cri.options.map((opt, optIdx) => (
              <div key={opt.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="text"
                  value={opt.label}
                  onChange={e => handleOptionChange(criIdx, optIdx, "label", e.target.value)}
                  placeholder="ตัวเลือก"
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    width: 260
                  }}
                />
                <input
                  type="number"
                  value={opt.score}
                  onChange={e => handleOptionChange(criIdx, optIdx, "score", Number(e.target.value))}
                  style={{
                    width: 80,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db"
                  }}
                />
                <button
                  onClick={() => handleDeleteOption(criIdx, optIdx, opt.id)}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 16px",
                    cursor: "pointer"
                  }}
                >
                  ลบ
                </button>
              </div>
            )) : <div style={{ color: "#888" }}>ไม่มีตัวเลือก</div>}
            <button
              onClick={() => handleAddOption(criIdx)}
              style={{
                marginTop: 8,
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 16px",
                cursor: "pointer"
              }}
            >
              + เพิ่มตัวเลือก
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: "#0284c7",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "12px 32px",
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          opacity: saving ? 0.6 : 1
        }}
      >
        {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
      </button>
    </div>
  );
}