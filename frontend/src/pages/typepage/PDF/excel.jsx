import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";

export default function ExcelDownloadButton() {
  const [homes, setHomes] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลบ้าน
  useEffect(() => {
    axios.get("http://localhost:3001/api/homes")
      .then(res => setHomes(res.data))
      .catch(() => setHomes([]));
    // ดึงข้อมูล guest
    axios.get("http://localhost:3001/api/guests")
      .then(res => setGuests(res.data))
      .catch(() => setGuests([]));
  }, []);

  function formatThaiDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }

  const exportToExcel = () => {
    if (!homes.length) return alert("ไม่มีข้อมูลบ้าน");
    setLoading(true);

    setTimeout(() => {
      // Sheet บ้าน
      const exportData = homes.map(h => ({
        "เลขที่บ้าน": h.Address,
        "ประเภทบ้าน": h.hType,
        "สถานะ": h.status,
        "ชื่อพื้นที่/แถว/อาคาร": h.unit_name || "",
        "จำนวนผู้พัก": h.guest_count || 0
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Sheet Guest (แสดงเฉพาะผู้ถือสิทธิ)
      const guestData = guests
        .filter(g => g.is_right_holder)
        .map(g => {
          // หา home ที่ตรงกับ guest ด้วย home_id (แม่นยำกว่า Address)
          const home = homes.find(h => h.home_id === g.home_id);
          return {
            "ประเภทบ้าน": home?.hType || "",
            "เลขที่บ้าน": home?.Address || "",
            "ยศ/คำนำหน้า": g.rank || g.title || "",
            "ชื่อพื้นที่/แถว/อาคาร": home?.unit_name || home?.home_unit || "",
            "ชื่อ": g.name,
            "นามสกุล": g.lname,
            "เบอร์โทร": g.phone || "",
            "วันเกิด": formatThaiDate(g.dob),
            "สถานะ": "ผู้ถือสิทธิ"
          };
        });
      const wsGuest = XLSX.utils.json_to_sheet(guestData);

      // กำหนดความกว้างคอลัมน์
      ws['!cols'] = [
        { wch: 12 }, // เลขที่บ้าน
        { wch: 12 }, // ประเภทบ้าน
        { wch: 10 }, // สถานะ
        { wch: 18 }, // ชื่อพื้นที่/แถว/อาคาร
        { wch: 12 }, // จำนวนผู้พัก
      ];
      wsGuest['!cols'] = [
        { wch: 14 }, // ยศ/คำนำหน้า
        { wch: 12 }, // ประเภทบ้าน
        { wch: 12 }, // เลขที่บ้าน
        { wch: 18 }, // ชื่อพื้นที่/แถว/อาคาร
        { wch: 12 }, // ชื่อ
        { wch: 14 }, // นามสกุล
        { wch: 14 }, // เบอร์โทร
        { wch: 14 }, // วันเกิด
        { wch: 12 }, // สถานะ
      ];

      // ใส่ header bold (ใช้ cell style)
      function boldHeader(ws) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
          if (cell) cell.s = { font: { bold: true } };
        }
      }
      boldHeader(ws);
      boldHeader(wsGuest);

      // สร้าง workbook และเพิ่มทั้ง 2 sheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Homes");
      XLSX.utils.book_append_sheet(wb, wsGuest, "Guests");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), "homes_and_guests.xlsx");
      setLoading(false);
    }, 600); // เพิ่ม delay เล็กน้อยเพื่อแสดง loading
  };

  return (
    <button onClick={exportToExcel} style={{
      background: "#15a52dff",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      padding: "10px 24px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer"
    }}>
      {loading ? (
        <span>⏳ กำลังสร้าง Excel...</span>
      ) : (
        <span>📊 ดาวน์โหลด Excel</span>
      )}
    </button>
  );
}