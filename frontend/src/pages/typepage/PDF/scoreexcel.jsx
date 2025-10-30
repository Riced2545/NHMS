import React from "react";
import * as XLSX from "xlsx";

export default function ScoreExcel({ apiUrl = "http://localhost:3001/api/viewscore" }) {
  const exportToExcel = async () => {
    try {
      const res = await fetch(apiUrl);
      const rows = await res.json();

      const headers = ["ลำดับ","ยศ","ชื่อ-นามสกุล","เบอร์โทร","คะแนนรวม","วันที่/รายละเอียด"];
      const data = (rows && rows.length ? rows : []).map((r, i) => {
        const dateOrDetail = r.details
          ? (/^\d{4}-\d{2}-\d{2}/.test(String(r.details).trim())
              ? formatDate(String(r.details).trim())
              : String(r.details))
          : "";
        return {
          "ลำดับ": i + 1,
          "ยศ": r.rank || r.title || "",
          "ชื่อ-นามสกุล": `${r.name || ""} ${r.lname || ""}`.trim(),
          "เบอร์โทร": r.phone || "",
          "คะแนนรวม": r.total_score ?? "",
          "วันที่/รายละเอียด": dateOrDetail
        };
      });

      // สร้าง sheet จาก data
      const ws = XLSX.utils.json_to_sheet(data, { header: headers });

      // คำนวณความยาวข้อความสูงสุดของแต่ละคอลัมน์ เพื่อกำหนดความกว้างอัตโนมัติ
      const maxLens = headers.map(h => h.length);
      data.forEach(row => {
        headers.forEach((h, idx) => {
          const v = row[h] ?? "";
          const len = String(v).length;
          if (len > maxLens[idx]) maxLens[idx] = len;
        });
      });

      // แปลงความยาวตัวอักษรเป็น wch (character width) และกำหนดขอบเขต
      ws['!cols'] = maxLens.map(n => {
        const wch = Math.min(Math.max(n + 2, 10), 50); // padding + min/max
        return { wch };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "คะแนนรวม");
      const filename = `คะแนนรวม_${new Date().toISOString().slice(0,10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("Export Excel error:", err);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด Excel");
    }
  };

  return (
    <button
      onClick={exportToExcel}
      style={{
        background: "#0ea5a4",
        color: "#fff",
        border: "none",
        padding: "8px 12px",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
      }}
      type="button"
    >
      คะแนนขอเข้าพัก Excel
    </button>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
  } catch { return iso; }
}