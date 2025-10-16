import { formatThaiDate } from "../../utils/dateUtils";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './guest.css';
import { useState, useEffect } from "react";
import EditGuestModal from "./Editguest/editguest";
import { toast } from "react-toastify";

export default function GuestTable({ guests = [], showAddress, showType, onEdit, onDelete, selectedIds, setSelectedIds, onSaved }) {
  const navigate = useNavigate();
  const role_id = localStorage.getItem("role_id");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveStatusOptions, setMoveStatusOptions] = useState([]);
  const [moveStatusId, setMoveStatusId] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [movingGuest, setMovingGuest] = useState(null);
  const [showOtherInput, setShowOtherInput] = useState(false);

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

  useEffect(() => {
    // โหลดเหตุผลการออกจาก move_status
    fetch("http://localhost:3001/api/move_status")
      .then(res => res.json())
      .then(data => setMoveStatusOptions(data));
  }, []);

  const handleMove = (guest) => {
    setMovingGuest(guest);
    setMoveStatusId("");
    setMoveReason("");
    setShowOtherInput(false);
    setMoveModalOpen(true);
  };

  const handleMoveConfirm = async () => {
    let finalMoveStatusId = moveStatusId;

    // ถ้าเลือก "อื่นๆ" และกรอกเหตุผลใหม่ ให้เพิ่มใน move_status ก่อน
    if (moveStatusId === "other" && moveReason.trim()) {
      const res = await fetch("http://localhost:3001/api/move_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: moveReason.trim() })
      });
      const result = await res.json();
      if (result.success && result.id) {
        finalMoveStatusId = result.id;
      } else {
        toast.error("เพิ่มเหตุผลใหม่ไม่สำเร็จ");
        return;
      }
    }

    // 1. ถ้าเป็นผู้ถือสิทธิ์ ให้ลบสมาชิกครอบครัวทั้งหมด (ยกเว้นตัวเอง)
    if (movingGuest.is_right_holder) {
      await fetch(`http://localhost:3001/api/delete_family/${movingGuest.home_id}/${movingGuest.id}`, {
        method: "DELETE"
      });
    }

    // 2. ดำเนินการย้ายออกตามปกติ
    fetch("http://localhost:3001/api/guest_move_out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_id: movingGuest.id,
        rank_id: movingGuest.rank_id,
        name: formatGuestName(movingGuest),
        home_id: movingGuest.home_id,
        home_address: movingGuest.Address,
        move_status_id: finalMoveStatusId
      })
    }).then(res => res.json())
      .then((result) => {
        setMoveModalOpen(false);
        setMovingGuest(null);
        setMoveStatusId("");
        setMoveReason("");
        setShowOtherInput(false);
        toast.success("บันทึกประวัติการออกเรียบร้อยแล้ว!");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      });
  };

  return (
    <>
      <table className="search-table">
        <thead>
          <tr>
            {role_id !== "2" && (
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
            )}
            <th>ลำดับ</th>
            <th>ชื่อ-นามสกุล</th>
            {showAddress && <th>บ้านเลขที่</th>}
            {showType && <th>ประเภทบ้าน</th>}
            <th>วันที่เข้าพัก</th>
            {role_id !== "2" && <th>วันเกิด</th>}
            {role_id !== "2" && <th>เบอร์โทรศัพท์</th>}
            {role_id !== "2" && <th>เบอร์โทรที่ทำงาน</th>}
            {role_id !== "2" && <th>เงินเดือน</th>}
            {role_id === "1" && (onEdit || onDelete) && <th>จัดการ</th>}
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
            sortedGuests.map((g, idx) => (
              <tr
                key={g.id}
                className={`guest-row ${g.is_right_holder ? 'right-holder-row' : ''}`}
                title="ดูรายละเอียดบ้าน"
              >
                {role_id !== "2" && (
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
                )}
                <td>{idx + 1}</td>
                <td className="guest-name-cell">
                  <span className="guest-name">
                    {g.is_right_holder && <span className="right-holder-badge">🗝️</span>}
                    {formatGuestName(g)}
                  </span>
                </td>
                {showAddress && <td className="guest-data-cell">{g.Address}</td>}
                {showType && <td className="guest-data-cell">{g.hType}</td>}
                {/* วันที่เข้า */}
                <td className="guest-data-cell">
                  {g.created_at ? formatThaiDate(g.created_at) : "-"}
                </td>
                {role_id !== "2" && <td className="guest-data-cell">{g.dob ? formatThaiDate(g.dob) : ""}</td>}
                {role_id !== "2" && <td className="guest-data-cell">{g.phone || "-"}</td>}
                {role_id !== "2" && <td className="guest-data-cell">{g.job_phone || "-"}</td>}
                {role_id !== "2" && <td className="guest-data-cell">{g.income || "-"}</td>}
                {role_id === "1" && (onEdit || onDelete) && (
                  <td className="action-cell" onClick={e => e.stopPropagation()}>
                    <div className="action-buttons">
                      {onEdit && (
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(g)}
                        >
                          ✏️แก้ไข
                        </button>
                      )}
                      {/* แสดงปุ่มย้ายออกเฉพาะผู้ถือสิทธิ์เท่านั้น */}
                      {g.is_right_holder ? (
                        <button
                          className="btn-move"
                          onClick={() => handleMove(g)}
                          style={{
                            marginLeft: 4,
                            background: "#f59e0b",
                            color: "#fff",
                            borderRadius: 6,
                            padding: "4px 10px",
                            border: "none"
                          }}
                        >
                          🚚 ย้ายออก
                        </button>
                      ) : null}
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

      {/* Modal สำหรับกรอกเหตุผลการออก */}
      {moveModalOpen && (
        <div className="modal-bg">
          <div className="modal-content">
            <h3>ระบุเหตุผลการออกจากบ้าน</h3>
            <div style={{ marginBottom: 12 }}>
              <b>ชื่อ:</b> {movingGuest && formatGuestName(movingGuest)}
              <br />
              <b>บ้านเลขที่:</b> {movingGuest && movingGuest.Address}
            </div>
            <select
              value={moveStatusId}
              onChange={e => setMoveStatusId(e.target.value)}
              style={{
                width: "100%",
                minWidth: "400px",
                fontSize: "18px",
                marginBottom: 12,
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
              disabled={showOtherInput}
            >
              <option value="">-- เลือกเหตุผล --</option>
              {moveStatusOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
            <button
              style={{
                marginLeft: 8,
                background: "#e0e7ef",
                color: "#333",
                borderRadius: 6,
                padding: "6px 18px",
                border: "none"
              }}
              onClick={() => {
                setShowOtherInput(true);
                setMoveStatusId("");
              }}
              disabled={showOtherInput}
            >
              เพิ่มเหตุผลใหม่
            </button>
            {showOtherInput && (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  value={moveReason}
                  onChange={e => setMoveReason(e.target.value)}
                  placeholder="ชื่อเหตุผลใหม่ เช่น ย้ายออก, ย้ายไปต่างจังหวัด"
                  style={{ width: "100%", marginBottom: 8, padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={async () => {
                      if (!moveReason.trim()) return;
                      // เพิ่มเหตุผลใหม่
                      const res = await fetch("http://localhost:3001/api/move_status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: moveReason.trim() })
                      });
                      const result = await res.json();
                      if (result.success && result.id) {
                        setMoveStatusOptions(prev => [...prev, { id: result.id, name: moveReason.trim() }]);
                        setMoveStatusId(result.id);
                        setShowOtherInput(false);
                        setMoveReason("");
                        toast.success("เพิ่มเหตุผลใหม่สำเร็จ");
                      } else {
                        toast.error("เพิ่มเหตุผลใหม่ไม่สำเร็จ");
                      }
                    }}
                    disabled={!moveReason.trim()}
                    style={{ background: "#22c55e", color: "#fff", borderRadius: 6, padding: "6px 18px", border: "none" }}
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => {
                      setShowOtherInput(false);
                      setMoveReason("");
                    }}
                    style={{ background: "#ef4444", color: "#fff", borderRadius: 6, padding: "6px 18px", border: "none" }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={handleMoveConfirm}
                disabled={
                  !moveStatusId
                }
                style={{ background: "#22c55e", color: "#fff", borderRadius: 6, padding: "6px 18px", border: "none" }}
              >
                บันทึกการออก
              </button>
              <button
                onClick={() => {
                  setMoveModalOpen(false);
                  setShowOtherInput(false);
                  setMoveReason("");
                }}
                style={{ background: "#ef4444", color: "#fff", borderRadius: 6, padding: "6px 18px", border: "none" }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}