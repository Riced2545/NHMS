import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Sidebar";
import { useNavigate, useParams } from "react-router-dom";

function formatThaiDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543;
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} ${hour}:${minute} น.`;
}

export default function GuestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { home_id } = useParams();

  useEffect(() => {
    axios.get(`http://localhost:3001/api/guest_history?home_id=${home_id}`)
      .then(res => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [home_id]);

  return (
    <div className="search-bg dashboard-container">
      <Navbar />
      <div className="search-container">
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          justifyContent: "flex-start"
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              padding: "8px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "15px"
            }}
          >
            ← ย้อนกลับ
          </button>
          <h2 style={{
            margin: 0,
            color: "#3b2566",
            fontSize: "28px",
            fontWeight: "bold"
          }}>
            ประวัติผู้เข้าพัก
          </h2>
        </div>
        <table className="search-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ยศ/คำนำหน้า</th>
              <th>ชื่อ</th>
              <th>นามสกุล</th>
              <th>สาเหตุ</th>
              <th>วันที่ออก</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>กำลังโหลด...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={6}>ไม่มีข้อมูล</td></tr>
            ) : (
              history.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.rank_display}</td>
                  <td>{item.name}</td>
                  <td>{item.lname}</td>
                  <td>{item.move_status_name}</td>
                  <td>{formatThaiDate(item.moved_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}