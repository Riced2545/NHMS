import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ScorePdf() {
  const [rows, setRows] = useState([]);
  const printRef = useRef(null);

  useEffect(() => {
    // ดึงข้อมูลคะแนนจาก API (ใช้ /api/viewscore)
    axios.get("http://localhost:3001/api/viewscore")
      .then(r => setRows(r.data || []))
      .catch(e => {
        console.error("Failed to load scores:", e);
        setRows([]);
      });
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
    } catch { return iso; }
  };

  const exportToPdf = async () => {
    if (!printRef.current) return;
    const element = printRef.current;

    // เปลี่ยนเป็นพื้นหลังขาวและข้อความสีเข้มสำหรับการ export
    const prevBg = element.style.background;
    const prevColor = element.style.color;
    element.style.background = "#ffffff";
    element.style.color = "#111111";

    // ใช้ scale สูงขึ้นเพื่อความคมชัด และกำหนด backgroundColor เป็นขาว
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4"
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // ใส่รูปให้เต็มหน้า
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("score_report.pdf");

    // คืนค่าสไตล์เดิม
    element.style.background = prevBg || "";
    element.style.color = prevColor || "";
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button
          onClick={exportToPdf}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Export PDF
        </button>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.print(); }}
          style={{
            background: "#6b7280",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          Print
        </a>
      </div>

      {/* พื้นที่ที่จับเป็น PDF (พื้นหลังขาว) */}
      <div
        ref={printRef}
        id="score-pdf"
        style={{
          width: "1123px",            // เลย์เอาต์แบบ landscape A4 ที่ความละเอียดหน้าจอ
          minHeight: "794px",
          padding: 28,
          boxSizing: "border-box",
          background: "#ffffff",      // พื้นหลังขาว
          color: "#111111",           // ข้อความสีเข้ม
          fontFamily: "Tahoma, Arial, sans-serif"
        }}
      >
        <h1 style={{ textAlign: "center", margin: "8px 0 20px 0", color: "#111111" }}>
          รายชื่อผู้ลงคะแนนขอเข้าพัก
        </h1>

        <div style={{ maxWidth: "100%", overflow: "hidden" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#111111",
            tableLayout: "fixed",
            background: "transparent"
          }}>
            <thead>
              <tr>
                {["ลำดับ","ยศ","ชื่อ-นามสกุล","เบอร์โทร","คะแนนรวม","วันที่ของคะแนน"].map((h, i) => (
                  <th key={i} style={{
                    border: "1px solid #111111",
                    padding: "10px 8px",
                    textAlign: i === 0 ? "center" : "left",
                    background: "transparent",
                    fontWeight: "600",
                    fontSize: 16,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                // แสดงตัวอย่างแถวถ้าไม่มีข้อมูล
                <>
                  <tr>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}>1</td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{ ...cellStyle, minWidth: 220, color:"#111", border:"1px solid #111" }}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                  </tr>
                  <tr>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                    <td style={{...cellStyle, color:"#111", border:"1px solid #111"}}></td>
                  </tr>
                </>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td style={{ ...cellStyle, textAlign: "center", color:"#111", border:"1px solid #111" }}>{idx + 1}</td>
                    <td style={{ ...cellStyle, color:"#111", border:"1px solid #111" }}>{r.rank || r.title || ""}</td>
                    <td style={{ ...cellStyle, minWidth: 220, color:"#111", border:"1px solid #111" }}>{r.name} {r.lname}</td>
                    <td style={{ ...cellStyle, color:"#111", border:"1px solid #111" }}>{r.phone || ""}</td>
                    <td style={{ ...cellStyle, color:"#111", border:"1px solid #111" }}>{r.total_score ?? ""}</td>
                    {/* แสดงวันที่จาก `details` หากเป็นรูปแบบ YYYY-MM-DD มิฉะนั้นแสดงค่า details เป็นข้อความ */}
                    <td style={{ ...cellStyle, color:"#111", border:"1px solid #111", whiteSpace: "normal", maxWidth: 300 }}>
                      {r.details ? (
                        (/^\d{4}-\d{2}-\d{2}/.test(String(r.details).trim())
                          ? formatDate(String(r.details).trim())
                          : String(r.details))
                      ) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ฟังก์ชันสร้าง HTML ตารางสำหรับ rows
function buildTableHtml(rows, formatDate) {
  const headers = ["ลำดับ","ยศ","ชื่อ-นามสกุล","เบอร์โทร","คะแนนรวม","วันที่ของคะแนน"];
  const ths = headers.map(h => `<th style="border:1px solid #111;padding:10px 8px;font-weight:600">${h}</th>`).join("");
  const trs = rows.length === 0
    ? `<tr>
         <td style="border:1px solid #111;padding:12px">1</td><td style="border:1px solid #111;padding:12px"></td>
         <td style="border:1px solid #111;padding:12px"></td><td style="border:1px solid #111;padding:12px"></td>
         <td style="border:1px solid #111;padding:12px"></td><td style="border:1px solid #111;padding:12px"></td>
       </tr>`
    : rows.map((r, idx) => {
        const dateOrDetail = r.details
          ? (/^\d{4}-\d{2}-\d{2}/.test(String(r.details).trim())
              ? formatDate(String(r.details).trim())
              : String(r.details))
          : "";
        return `<tr>
          <td style="border:1px solid #111;padding:12px;text-align:center">${idx+1}</td>
          <td style="border:1px solid #111;padding:12px">${r.rank||r.title||""}</td>
          <td style="border:1px solid #111;padding:12px">${(r.name||"") + " " + (r.lname||"")}</td>
          <td style="border:1px solid #111;padding:12px">${r.phone||""}</td>
          <td style="border:1px solid #111;padding:12px">${r.total_score ?? ""}</td>
          <td style="border:1px solid #111;padding:12px">${dateOrDetail}</td>
        </tr>`;
      }).join("");

  return `
    <div style="width:1123px;min-height:794px;padding:28px;box-sizing:border-box;background:#ffffff;color:#111;font-family:Tahoma,Arial,sans-serif">
      <h1 style="text-align:center;margin:8px 0 20px 0">รายชื่อผู้ลงคะแนนขอเข้าพัก</h1>
      <div style="max-width:100%;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;table-layout:fixed">
          <thead><tr>${ths}</tr></thead>
          <tbody>${trs}</tbody>
        </table>
      </div>
    </div>
  `;
}

// helper formatDate (same as component)
function formatDateLocal(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
  } catch { return iso; }
}

// export ฟังก์ชันให้เรียกโดยตรงจากปุ่ม (ไม่ต้อง mount component)
export async function generateScorePdf() {
  try {
    const res = await axios.get("http://localhost:3001/api/viewscore");
    const rows = res.data || [];

    const html = buildTableHtml(rows, formatDateLocal);

    // สร้าง element ชั่วคราวใน DOM (นอกหน้าจอ)
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-2000px"; // ซ่อนไปนอกจอ
    wrapper.style.top = "0";
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    // ให้เวลาให้เบราว์เซอร์เรนเดอร์ภาพถ้ามีภาพหรือฟอนต์
    await new Promise(r => setTimeout(r, 50));

    const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4"
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`คะแนนรวม_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (err) {
    console.error("generateScorePdf error:", err);
    throw err;
  } finally {
    // ลบ element ชั่วคราวถ้ายังอยู่
    const tmp = document.querySelector('body > div[style*="-2000px"]');
    if (tmp) tmp.remove();
  }
}

// ใช้ซ้ำสำหรับแต่ละ cell เพื่อความสั้นของโค้ด
const cellStyle = {
  border: "1px solid #111",
  padding: "12px 8px",
  fontSize: 14,
  verticalAlign: "middle",
  color: "#111",
  background: "transparent",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};