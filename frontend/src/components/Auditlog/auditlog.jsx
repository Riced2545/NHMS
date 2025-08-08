import React, { useEffect, useState } from "react";
import Navbar from ".././Sidebar";
import axios from "axios";

export default function AuditLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState(""); // เพิ่ม state สำหรับ filter
    const [searchUser, setSearchUser] = useState(""); // filter ชื่อผู้กระทำ
    const [typeFilter, setTypeFilter] = useState(""); // เพิ่ม state สำหรับประเภท

    useEffect(() => {
        fetchLogs();
        
        // เพิ่ม interval เพื่อ refresh ข้อมูลทุก 30 วินาที
        const interval = setInterval(() => {
            fetchLogs();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = () => {
        setLoading(true);
        axios.get("http://localhost:3001/api/guest_logs")
            .then(res => {
                setLogs(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleClearLogs = async () => {
        if (window.confirm("ต้องการล้างประวัติทั้งหมดใช่หรือไม่?")) {
            await axios.delete("http://localhost:3001/api/guest_logs");
            fetchLogs();
        }
    };

    // ตัวเลือกประเภทการกระทำ
    const actionOptions = [
        { value: "", label: "ทุกการกระทำ" },
        { value: "add", label: "เพิ่ม" },
        { value: "edit", label: "แก้ไข" },
        { value: "delete", label: "ลบ" },
        { value: "move", label: "ย้าย" }
    ];

    // ตัวเลือกประเภท (type)
    const typeOptions = [
        { value: "", label: "ทั้งหมด" },
        { value: "guest", label: "ผู้พัก" },
        { value: "home", label: "บ้าน" }
    ];

    // ฟิลเตอร์ log ตาม action, ชื่อผู้กระทำ, และประเภท
    const filteredLogs = logs.filter(log => {
        // ถ้าเลือก actionFilter ให้ match ทั้ง action ของผู้พักและบ้าน
        let matchAction = true;
        if (actionFilter) {
            if (actionFilter === "add") {
                matchAction = log.action === "add" || log.action === "add_home";
            } else if (actionFilter === "edit") {
                matchAction = log.action === "edit" || log.action === "edit_home";
            } else if (actionFilter === "delete") {
                matchAction = log.action === "delete" || log.action === "delete_home";
            } else {
                matchAction = log.action === actionFilter;
            }
        }

        const matchUser = searchUser
            ? (log.detail || "").toLowerCase().includes(searchUser.toLowerCase())
            : true;

        // กำหนดประเภทจาก action
        let type = "";
        if (["add", "edit", "delete", "move"].includes(log.action)) type = "guest";
        if (["add_home", "edit_home", "delete_home"].includes(log.action)) type = "home";
        const matchType = typeFilter ? type === typeFilter : true;

        return matchAction && matchUser && matchType;
    });

    return (
        <div className="dashboard-container" style={{ background: "#f8fafc", minHeight: "100vh" }}>
            <Navbar />
            <div className="content-container" style={{
                width: "100vw",
                margin: 0,
                padding: "32px 0",
                display: "flex",
                justifyContent: "center"
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 4px 12px #e5e7eb1a",
                    padding: 32,
                    width: "100vw",
                    maxWidth: "100vw",
                    overflowX: "auto",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: '100%' }}>
                        <h2 style={{ color: "#3b2566", fontWeight: "bold", marginBottom: 24, flexGrow: 1, textAlign: "center" }}>
                            ประวัติการบันทึกการพักอาศัย
                        </h2>
                        <button
                            onClick={handleClearLogs}
                            style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 20px",
                                fontWeight: "bold",
                                fontSize: 16,
                                cursor: "pointer",
                                marginBottom: 16
                            }}
                        >
                            ล้างประวัติ
                        </button>
                    </div>
                    {/* Filter */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
                        <select
                            value={actionFilter}
                            onChange={e => setActionFilter(e.target.value)}
                            style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
                        >
                            {actionOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
                        >
                            {typeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="ค้นหารายละเอียด ชื่อผู้พัก"
                            value={searchUser}
                            onChange={e => setSearchUser(e.target.value)}
                            style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd", minWidth: 200 }}
                        />
                        {/* ปุ่มรีเซ็ต filter */}
                        <button
                            onClick={() => {
                                setActionFilter("");
                                setSearchUser("");
                                setTypeFilter("");
                            }}
                            style={{
                                background: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 20px",
                                fontWeight: "bold",
                                fontSize: 16,
                                cursor: "pointer",
                                marginBottom: 16
                            }}
                        >
                            รีเซ็ต
                        </button>
                    </div>
                    {loading ? (
                        <div>กำลังโหลดข้อมูล...</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#ede9fe" }}>
                                    {/* <th style={{ padding: 8, textAlign: 'center' }}>บ้านพัก หมายเลข</th> */}
                                    <th style={{ padding: 8, textAlign: 'center' }}>ประเภทบ้านพัก</th>
                                    <th style={{ padding: 8, textAlign: 'center' }}>วันที่</th>
                                    <th style={{ padding: 8, textAlign: 'center' }}>เวลา</th>
                                    <th style={{ padding: 8, textAlign: 'center' }}>การกระทำ</th>
                                    <th style={{ padding: 8, textAlign: 'center' }}>รายละเอียด</th>
                                    {/* <th style={{ padding: 8, textAlign: 'center' }}>ผู้กระทำ</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: "center", color: "#ef4444" }}>
                                            ไม่พบประวัติการบันทึก
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                                            {/* เพิ่มคอลัมน์ หมายเลขบ้าน/แถว */}

                                            <td style={{ padding: 8, textAlign: 'center' }}>{log.home_type_name || "-"}</td>
                                            <td style={{ padding: 8, textAlign: 'center' }}>
                                                {log.created_at ? new Date(log.created_at).toLocaleDateString() : "-"}
                                            </td>
                                            <td style={{ padding: 8, textAlign: 'center' }}>
                                                {log.created_at
                                                    ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                    : "-"}
                                            </td>
                                            <td style={{
                                                padding: 8, textAlign: 'center', color:
                                                    log.action === "delete" || log.action === "delete_home"
                                                        ? "#ef4444"
                                                        : log.action === "edit" || log.action === "edit_home"
                                                            ? "#f59e42"
                                                            : log.action === "move"
                                                                ? "#3b82f6"
                                                                : log.action === "add" || log.action === "add_home"
                                                                    ? "#22c55e"
                                                                    : "#000"
                                            }}>
                                                {log.action === "add" && "เพิ่ม"}
                                                {log.action === "edit" && "แก้ไข"}
                                                {log.action === "delete" && "ลบ"}
                                                {log.action === "move" && "ย้าย"}
                                                {log.action === "add_home" && "เพิ่มบ้าน"}
                                                {log.action === "edit_home" && "แก้ไขบ้าน"}
                                                {log.action === "delete_home" && "ลบบ้าน"}
                                                {!["add", "edit", "delete", "move", "add_home", "edit_home", "delete_home"].includes(log.action) && log.action}
                                            </td>
                                            <td style={{ 
  padding: 8, 
  textAlign: 'center',

}}>
  {(() => {
    let detailText = log.detail || "-";
    
    // เก็บการเพิ่มข้อมูลแถวไว้เฉพาะที่จำเป็น
    if (log.home_type_name === 'บ้านพักเรือนแถว' && 
        (log.row_name || log.row_number) && 
        detailText !== "-") {
      
      const rowInfo = log.row_name || `แถว ${log.row_number}`;
      
      // เพิ่มข้อมูลแถวเฉพาะกรณีที่ยังไม่มี
      if (detailText.includes('เข้าพักบ้านเลขที่') && !detailText.includes('แถว')) {
        detailText = detailText.replace(
          /(เข้าพักบ้านเลขที่\s*\w+)/g, 
          `$1 ${rowInfo}`
        );
      } else if (detailText.includes('บ้านเลขที่') && !detailText.includes('แถว')) {
        detailText = detailText.replace(
          /(บ้านเลขที่\s*\w+)/g, 
          `$1 ${rowInfo}`
        );
      }
    }

                                                    return detailText;
                                                })()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}