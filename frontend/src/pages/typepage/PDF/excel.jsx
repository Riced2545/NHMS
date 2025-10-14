import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";

export default function ExcelDownloadButton() {
  const [homes, setHomes] = useState([]);
  const [guests, setGuests] = useState([]);

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

  const exportToExcel = () => {
    if (!homes.length) return alert("ไม่มีข้อมูลบ้าน");

    // Sheet บ้าน
    const exportData = homes.map(h => ({
      "เลขที่บ้าน": h.Address,
      "ประเภทบ้าน": h.hType,
      "สถานะ": h.status,
      "ชื่อพื้นที่/แถว/อาคาร": h.unit_name || "",
      "จำนวนผู้พัก": h.guest_count || 0
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Sheet Guest
    const guestData = guests.map(g => ({
      "ยศ/คำนำหน้า": g.rank || g.title || "",
      "เลขที่บ้าน": g.Address,
      "ชื่อ": g.name,
      "นามสกุล": g.lname,
      "เบอร์โทร": g.phone || "",
      "วันเกิด": g.dob || "",
      "สถานะ": g.is_right_holder ? "ผู้ถือสิทธิ" : "สมาชิกครอบครัว"
    }));
    const wsGuest = XLSX.utils.json_to_sheet(guestData);

    // สร้าง workbook และเพิ่มทั้ง 2 sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Homes");
    XLSX.utils.book_append_sheet(wb, wsGuest, "Guests");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "homes_and_guests.xlsx");
  };

  return (
    <button onClick={exportToExcel} style={{
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      padding: "10px 24px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer"
    }}>
      ดาวน์โหลด Excel
    </button>
  );
}