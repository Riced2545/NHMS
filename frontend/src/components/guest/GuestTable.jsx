import { formatThaiDate } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './guest.css';

export default function GuestTable({
  guests = [],
  showAddress = false,
  showType = false,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();
  const role_id = localStorage.getItem("role_id");

  // เรียงลำดับให้ผู้ถือสิทธิ์ขึ้นก่อน
  const sortedGuests = [...guests].sort((a, b) => {
    // ถ้า a เป็นผู้ถือสิทธิ์ และ b ไม่ใช่ ให้ a อยู่ก่อน
    if (a.is_right_holder && !b.is_right_holder) return -1;
    // ถ้า b เป็นผู้ถือสิทธิ์ และ a ไม่ใช่ ให้ b อยู่ก่อน
    if (b.is_right_holder && !a.is_right_holder) return 1;
    // ถ้าทั้งคู่เป็นผู้ถือสิทธิ์ หรือทั้งคู่ไม่ใช่ ให้เรียงตาม id
    return a.id - b.id;
  });

  // ฟังก์ชันสำหรับแสดงชื่อเต็ม
  const formatGuestName = (guest) => {
    const parts = [];
    
    // ฟังก์ชันตรวจสอบว่าค่าเป็น "ค่าว่าง" หรือไม่
    const isEmptyValue = (value) => {
      return value === null || 
             value === undefined || 
             value === '' || 
             value === '0' || 
             value === 0 || 
             value === 'null' || 
             value === 'undefined' ||
             (typeof value === 'string' && value.trim() === '');
    };
    
    if (guest.is_right_holder) {
      // ผู้ถือสิทธิ - ใช้ rank (ยศทหาร)
      if (!isEmptyValue(guest.rank)) {
        parts.push(guest.rank);
      }
    } else {
      // สมาชิกครอบครัว - ใช้ title (คำนำหน้า)
      if (!isEmptyValue(guest.title)) {
        parts.push(guest.title);
      }
    }
    
    if (!isEmptyValue(guest.name)) parts.push(guest.name);
    if (!isEmptyValue(guest.lname)) parts.push(guest.lname);
    
    return parts.join(' ').trim();
  };

  return (
    <table className="search-table">
      <thead>
        <tr>
          <th>ชื่อ-นามสกุล</th>
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
        {sortedGuests.length === 0 ? (
          <tr>
            <td colSpan={10} className="no-data-cell">
              ไม่มีข้อมูล
            </td>
          </tr>
        ) : (
          sortedGuests.map(g => (
            <tr
              key={g.id}
              className={`guest-row ${g.is_right_holder ? 'right-holder-row' : ''}`}
              title="ดูรายละเอียดบ้าน"
            >
              <td className="guest-name-cell">
                <span className="guest-name">
                  {g.is_right_holder && <span className="right-holder-badge">🗝️</span>}
                  {formatGuestName(g)}
                </span>
              </td>
              
              {showAddress && <td className="guest-data-cell">{g.Address}</td>}
              {showType && <td className="guest-data-cell">{g.hType}</td>}
              <td className="guest-data-cell">{g.dob ? formatThaiDate(g.dob) : ""}</td>
              <td className="guest-data-cell">{g.phone || "-"}</td>
              <td className="guest-data-cell">{g.job_phone || "-"}</td>
              <td className="guest-data-cell">{g.income || "-"}</td>
             
              
              {((role_id === "1" && (onEdit || onDelete)) || role_id !== "1") && (
                <td className="action-cell" onClick={e => e.stopPropagation()}>
                  <div className="action-buttons">
                    {/* สำหรับ Admin (role_id = 1) - แสดงปุ่มแก้ไขและลบ */}
                    {role_id === "1" && onEdit && (
                      <button
                        className="btn-edit"
                        onClick={() => onEdit(g)}
                      >
                        ✏️แก้ไข
                      </button>
                    )}
                    {role_id === "1" && onDelete && (
                      <button
                        className="btn-delete"
                        onClick={() => onDelete(g)}
                      >
                        <FontAwesomeIcon icon={faTimes} className="btn-icon" />
                        ลบ
                      </button>
                    )}
                    
                    {/* สำหรับผู้ใช้ทั่วไป (role_id ≠ 1) - แสดงปุ่มรายละเอียดอย่างเดียว */}
                    {role_id !== "1" && (
                      <button
                        className="btn-detail"
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