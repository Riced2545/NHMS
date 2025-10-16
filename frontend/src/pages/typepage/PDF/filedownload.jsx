import React, { useEffect, useState } from "react";
import PDFDownload from "./pdf";
import ExcelDownloadButton from "./excel";

export default function FileDownloadModal({ open, onClose }) {
  const [homes, setHomes] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลบ้านและ guest
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      fetch("http://localhost:3001/api/homes").then(res => res.json()),
      fetch("http://localhost:3001/api/guests").then(res => res.json())
    ]).then(([homesData, guestsData]) => {
      setHomes(homesData);
      setGuests(guestsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [open]);

  // สร้าง typeStats และ houseStatus สำหรับ PDF
  const typeStats = React.useMemo(() => {
    const types = {};
    homes.forEach(h => {
      const type = h.hType || "ไม่ระบุ";
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  }, [homes]);

  const houseStatus = React.useMemo(() => {
    let occupied = 0, vacant = 0;
    homes.forEach(h => {
      if (h.status_id === 1) occupied++;
      else vacant++;
    });
    return { occupied, vacant };
  }, [homes]);

  // detailData สำหรับ PDF (รวม homes และ guest)
  const detailData = React.useMemo(() => {
    return homes.map(h => {
      // หา guest ที่เป็นผู้ถือสิทธิ์ของบ้านนี้
      const guest = guests.find(
        g => g.home_id === h.home_id && g.is_right_holder
      );
      let residentName = "ว่าง";
      if (guest) {
        // ใช้ rank หรือ title
        residentName = [
          guest.rank || guest.title || "",
          guest.name || "",
          guest.lname || ""
        ].join(" ").replace(/\s+/g, " ").trim();
      }
      return {
        ...h,
        residentName,
        phone: guest?.phone || "",
      };
    });
  }, [homes, guests]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          minWidth: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ margin: 0, marginBottom: 16, color: "#4B2673" }}>ดาวน์โหลดไฟล์</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PDFDownload
            typeStats={typeStats}
            houseStatus={houseStatus}
            detailData={detailData}
            disabled={loading}
          />
          <ExcelDownloadButton />
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 24,
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: "#ef4444",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ปิด
        </button>
      </div>
    </div>
  );
}