import { formatThaiDate } from "../../utils/dateUtils";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './guest.css';
import { useState, useEffect } from "react";
import EditGuestModal from "./Editguest/editguest";

export default function GuestTable({ guests = [], showAddress, showType, onEdit, onDelete, selectedIds, setSelectedIds, onSaved }) {
  const navigate = useNavigate();
  const role_id = localStorage.getItem("role_id");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState(null);

  // เรียงลำดับให้ผู้ถือสิทธิ์ขึ้นก่อน
  const sortedGuests = [...guests].sort((a, b) => {
    if (a.is_right_holder && !b.is_right_holder) return -1;
    if (b.is_right_holder && !a.is_right_holder) return 1;
    return a.id - b.id;
  });

  // ฟังก์ชันสำหรับแสดงชื่อเต็ม
  const formatGuestName = (guest) => {
    const parts = [];
    const isEmptyValue = (value) => {
      return value === null || value === undefined || value === '' || value === '0' || value === 0 || value === 'null' || value === 'undefined' || (typeof value === 'string' && value.trim() === '');
    };
    if (guest.is_right_holder) {
      if (!isEmptyValue(guest.rank)) parts.push(guest.rank);
    } else {
      if (!isEmptyValue(guest.title)) parts.push(guest.title);
    }
    if (!isEmptyValue(guest.name)) parts.push(guest.name);
    if (!isEmptyValue(guest.lname)) parts.push(guest.lname);
    return parts.join(' ').trim();
  };

  const handleEdit = (guest) => {
    setSelectedGuestId(guest.id);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedGuestId(null);
  };

  // เลือก/ยกเลิกเลือกแต่ละแถว
  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
    );
  };

  // เลือก/ยกเลิกเลือกทั้งหมด
  const handleSelectAll = () => {
    if (selectedIds.length === sortedGuests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedGuests.map(g => g.id));
    }
  };

  return (
    <>
      <table className="search-table">
        <thead>
          <tr>
            <th>
              <div
                className="checkbox-wrapper-13"
                style={{ userSelect: "none" }}
                onClick={handleSelectAll}
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleSelectAll(); }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.length === sortedGuests.length && sortedGuests.length > 0}
                  readOnly
                  style={{ pointerEvents: "none" }}
                />
                <span style={{ fontSize: 15, color: "#333" }}>เลือกทั้งหมด</span>
              </div>
            </th>
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
              <td colSpan={11} className="no-data-cell">
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
                <td>
                  <div
                    className="checkbox-wrapper-13"
                    style={{ userSelect: "none" }}
                    onClick={() => handleSelect(g.id)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleSelect(g.id); }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(g.id)}
                      readOnly
                      style={{ pointerEvents: "none" }}
                    />
                    <span style={{ fontSize: 15, color: "#333" }}>เลือก</span>
                  </div>
                </td>
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
                      {role_id === "1" && onEdit && (
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(g)}
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
      <EditGuestModal
        open={editModalOpen}
        onClose={handleModalClose}
        guestId={selectedGuestId}
        onSaved={onSaved}
      />
    </>
  );
}