import { formatThaiDate } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";

export default function GuestTable({
  guests = [],
  showAddress = false,
  showType = false,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const role_id = localStorage.getItem("role_id");

  return (
    <table className="search-table">
      <thead>
        <tr>
          <th>คำนำหน้า</th>
          <th>ชื่อ</th>
          <th>นามสกุล</th>
          {showAddress && <th>บ้านเลขที่</th>}
          {showType && <th>ประเภทบ้าน</th>}
          <th>วันเกิด</th>
          <th>เบอร์โทรศัพท์</th>
          <th>เบอร์โทรที่ทำงาน</th>
          <th>เงินเดือน</th>
          {((role_id === "1" && (onEdit || onDelete)) || role_id !== "1") && <th>จัดการ</th>}
        </tr>
      </thead>
      <tbody>
        {guests.length === 0 ? (
          <tr>
            <td colSpan={9} style={{ textAlign: "center", color: "#ef4444" }}>
              ไม่มีข้อมูล
            </td>
          </tr>
        ) : (
          guests.map(g => (
            <tr
              key={g.id}
              style={{ height: 56, cursor: "pointer", transition: "background 0.15s" }}
              title="ดูรายละเอียดบ้าน"
              // onClick={() => g.home_id && navigate(`/viewhome/${g.home_id}`)}
              onMouseOver={e => (e.currentTarget.style.background = "#f0f7ff")}
              onMouseOut={e => (e.currentTarget.style.background = "")}
            >
              <td style={{ verticalAlign: "middle" }}>{g.rank}</td>
              <td style={{ verticalAlign: "middle" }}>
                <span style={{ fontWeight: 500 }}>{g.name}</span>
              </td>
              <td style={{ verticalAlign: "middle" }}>{g.lname}</td>
              {showAddress && <td style={{ verticalAlign: "middle" }}>{g.Address}</td>}
              {showType && <td style={{ verticalAlign: "middle" }}>{g.hType}</td>}
              <td style={{ verticalAlign: "middle" }}>{g.dob ? formatThaiDate(g.dob) : ""}</td>
              <td style={{ verticalAlign: "middle" }}>{g.phone || "-"}</td>
              <td style={{ verticalAlign: "middle" }}>{g.job_phone || "-"}</td>
              <td style={{ verticalAlign: "middle" }}>{g.income || "-"}</td>
              {((role_id === "1" && (onEdit || onDelete)) || role_id !== "1") && (
                <td
                  style={{ verticalAlign: "middle" }}
                  onClick={e => e.stopPropagation()} // ป้องกันคลิกปุ่มแล้วไปหน้า viewhome
                >
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {/* สำหรับ Admin (role_id = 1) - แสดงปุ่มแก้ไขและลบ */}
                    {role_id === "1" && onEdit && (
                      <button
                        style={{
                          background: "#facc15",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 18px",
                          fontWeight: "bold",
                          fontSize: 15,
                          cursor: "pointer"
                        }}
                        onClick={() => onEdit(g)}
                      >
                        ✏️แก้ไข
                      </button>
                    )}
                    {role_id === "1" && onDelete && (
                      <button
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 18px",
                          fontWeight: "bold",
                          fontSize: 15,
                          cursor: "pointer"
                        }}
                        onClick={() => onDelete(g)}
                      >
                        ❌ลบ
                      </button>
                    )}
                    
                    {/* สำหรับผู้ใช้ทั่วไป (role_id ≠ 1) - แสดงปุ่มรายละเอียดอย่างเดียว */}
                    {role_id !== "1" && (
                      <button
                        style={{
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 18px",
                          fontWeight: "bold",
                          fontSize: 15,
                          cursor: "pointer"
                        }}
                        onClick={() => g.home_id && navigate(`/viewhome/${g.home_id}`)}
                      >
                        📋 รายละเอียด
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}