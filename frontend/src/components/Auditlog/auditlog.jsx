import React, { useEffect, useState } from "react";
import Navbar from ".././Sidebar";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AuditLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    useEffect(() => {
        fetchLogs();
        
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
                console.log("✅ Loaded logs:", res.data.length, "records");
            })
            .catch(error => {
                console.error("❌ Error fetching logs:", error);
                setLoading(false);
                toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", {
                    position: "top-right",
                    autoClose: 5000,
                });
            });
    };

    const handleClearLogs = async () => {
        // ✅ แจ้งเตือนด้วย toast แบบ confirm เหมือน viewguest
        const confirmToast = toast(
            ({ closeToast }) => (
                <div style={{ padding: '10px' }}>
                    <div style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
                        ⚠️ ยืนยันการล้างประวัติ
                    </div>
                    <div style={{ marginBottom: '15px', color: '#666' }}>
                        ต้องการล้างประวัติการบันทึกทั้งหมดหรือไม่?<br/>
                        <span style={{ color: '#ef4444', fontSize: '14px' }}>การกระทำนี้ไม่สามารถย้อนกลับได้!</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => {
                                closeToast();
                                performClearLogs();
                            }}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            ล้างประวัติ
                        </button>
                        <button
                            onClick={() => {
                                closeToast();
                                toast.info("ยกเลิกการล้างประวัติ", {
                                    position: "top-right",
                                    autoClose: 2000,
                                });
                            }}
                            style={{
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            ),
            {
                position: "top-right",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                closeButton: false,
                style: {
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    minWidth: '400px'
                }
            }
        );

        const performClearLogs = async () => {
            try {
                fetchLogs();
                // แจ้งเมื่อล้างสำเร็จ
                toast.success("✅ ล้างประวัติทั้งหมดเสร็จแล้ว!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } catch (error) {
                console.error("❌ Error clearing logs:", error);
                
                let errorMessage = "เกิดข้อผิดพลาดในการล้างประวัติ";
                
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    console.error('Error status:', error.response.status);
                    
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    } else {
                        errorMessage = `เกิดข้อผิดพลาด: ${error.response.status}`;
                    }
                } else if (error.request) {
                    console.error('No response received:', error.request);
                    errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
                }
                
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        };
    };

    // ✅ ปรับปรุง actionOptions
    const actionOptions = [
        { value: "", label: "ทุกการกระทำ", icon: "📋" },
        { value: "add", label: "เพิ่ม", icon: "➕" },
        { value: "edit", label: "แก้ไข", icon: "✏️" },
        { value: "delete", label: "ลบ", icon: "🗑️" },
        { value: "move", label: "ย้าย", icon: "🔄" }
    ];

    // ✅ ปรับปรุง typeOptions
    const typeOptions = [
        { value: "", label: "ทั้งหมด", icon: "🏠" },
        { value: "guest", label: "ผู้พัก", icon: "👥" },
        { value: "home", label: "บ้าน", icon: "🏘️" }
    ];

    // ✅ ฟังก์ชันสำหรับแสดงไอคอนตาม action
    const getActionIcon = (action) => {
        switch(action) {
            case "add": case "add_home": return "➕";
            case "edit": case "edit_home": return "✏️";
            case "delete": case "delete_home": return "🗑️";
            case "move": return "🔄";
            default: return "📝";
        }
    };

    // ✅ ฟังก์ชันสำหรับแสดงสีตาม action
    const getActionColor = (action) => {
        switch(action) {
            case "delete": case "delete_home": return "#ef4444";
            case "edit": case "edit_home": return "#f59e0b";
            case "move": return "#3b82f6";
            case "add": case "add_home": return "#10b981";
            default: return "#6b7280";
        }
    };

    // ✅ ฟังก์ชันสำหรับแสดงชื่อ action ภาษาไทย
    const getActionName = (action) => {
        const actions = {
            "add": "เพิ่มผู้พัก",
            "edit": "แก้ไขผู้พัก", 
            "delete": "ลบผู้พัก",
            "move": "ย้ายผู้พัก",
            "add_home": "เพิ่มบ้าน",
            "edit_home": "แก้ไขบ้าน",
            "delete_home": "ลบบ้าน"
        };
        return actions[action] || action;
    };

    // ฟิลเตอร์ log
    const filteredLogs = logs.filter(log => {
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
                padding: "32px 16px", // ✅ เพิ่ม padding ข้าง
                display: "flex",
                justifyContent: "center"
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", // ✅ เพิ่มเงาให้สวย
                    padding: 32,
                    width: "100%",
                    maxWidth: "1400px", // ✅ จำกัดความกว้างสูงสุด
                    overflowX: "auto",
                }}>
                    {/* ✅ Header พร้อมสถิติ */}
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h2 style={{
                                color: "#3b2566",
                                fontWeight: "bold",
                                fontSize: "28px",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                textAlign: "center", // เพิ่มบรรทัดนี้
                                width: "100%",       // เพิ่มบรรทัดนี้
                                justifyContent: "center" // เพิ่มบรรทัดนี้
                                
                            }}>
                                📊 ประวัติการบันทึกการพักอาศัย
                            </h2>
                        </div>
                        
                        {/* ✅ แสดงสถิติ */}
                  
                    </div>

                    {/* ✅ Filter ที่สวยขึ้น */}
                    <div style={{ 
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 24 
                    }}>
                        <div style={{ marginBottom: 12, fontWeight: "600", color: "#374151" }}>🔍 ตัวกรอง</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, alignItems: "end" }}>
                            <div>
                                <label style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px", display: "block" }}>การกระทำ</label>
                                <select
                                    value={actionFilter}
                                    onChange={e => setActionFilter(e.target.value)}
                                    style={{ 
                                        padding: "10px 12px", 
                                        borderRadius: 8, 
                                        border: "1px solid #d1d5db",
                                        width: "100%",
                                        fontSize: "14px"
                                    }}
                                >
                                    {actionOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.icon} {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px", display: "block" }}>ประเภท</label>
                                <select
                                    value={typeFilter}
                                    onChange={e => setTypeFilter(e.target.value)}
                                    style={{ 
                                        padding: "10px 12px", 
                                        borderRadius: 8, 
                                        border: "1px solid #d1d5db",
                                        width: "100%",
                                        fontSize: "14px"
                                    }}
                                >
                                    {typeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.icon} {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px", display: "block" }}>ค้นหา</label>
                                <input
                                    type="text"
                                    placeholder="🔍 ค้นหารายละเอียด ชื่อผู้พัก"
                                    value={searchUser}
                                    onChange={e => setSearchUser(e.target.value)}
                                    style={{ 
                                        padding: "10px 12px", 
                                        borderRadius: 8, 
                                        border: "1px solid #d1d5db", 
                                        width: "100%",
                                        fontSize: "14px"
                                    }}
                                />
                            </div>
  <button
                                onClick={handleClearLogs}
                                style={{
                                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 12,
                                    padding: "12px 24px",
                                    fontWeight: "600",
                                    fontSize: 14,
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
                                }}
                            >
                                🗑️ ล้างประวัติทั้งหมด
                            </button>
                        </div>
                        {/* ✅ แสดงจำนวนผลลัพธ์ */}
                        <div style={{ marginTop: 12, fontSize: "14px", color: "#6b7280" }}>
                            📋 แสดงผลลัพธ์ {filteredLogs.length} จาก {logs.length} รายการ
                        </div>
                    </div>

                    {/* ✅ ตาราง */}
                    {loading ? (
                        <div style={{ 
                            textAlign: "center", 
                            padding: "60px 0", 
                            fontSize: "16px", 
                            color: "#6b7280" 
                        }}>
                            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                            <table style={{ 
                                width: "100%", 
                                borderCollapse: "collapse",
                                background: "#fff"
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                                        color: "#fff"
                                    }}>
                                        <th style={{ padding: "16px 12px", textAlign: 'center', fontWeight: "600" }}>🏠 ประเภทบ้าน</th>
                                        <th style={{ padding: "16px 12px", textAlign: 'center', fontWeight: "600" }}>📅 วันที่</th>
                                        <th style={{ padding: "16px 12px", textAlign: 'center', fontWeight: "600" }}>⏰ เวลา</th>
                                        <th style={{ padding: "16px 12px", textAlign: 'center', fontWeight: "600" }}>⚡ การกระทำ</th>
                                        <th style={{ padding: "16px 12px", textAlign: 'center', fontWeight: "600" }}>📝 รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ 
                                                textAlign: "center", 
                                                padding: "60px 0", 
                                                color: "#ef4444",
                                                fontSize: "16px" 
                                            }}>
                                                <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
                                                ไม่พบประวัติการบันทึก
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log, idx) => (
                                            <tr key={idx} style={{ 
                                                borderBottom: "1px solid #f3f4f6",
                                                transition: "all 0.2s ease",
                                                background: idx % 2 === 0 ? "#fafafa" : "#fff"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#f0f9ff";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = idx % 2 === 0 ? "#fafafa" : "#fff";
                                            }}
                                            >
                                                <td style={{ 
                                                    padding: "16px 12px", 
                                                    textAlign: 'center',
                                                    fontWeight: "500"
                                                }}>
                                                    {log.home_type_name || "-"}
                                                </td>
                                                <td style={{ padding: "16px 12px", textAlign: 'center' }}>
                                                    {log.created_at 
                                                        ? new Date(log.created_at).toLocaleDateString('th-TH')
                                                        : "-"}
                                                </td>
                                                <td style={{ padding: "16px 12px", textAlign: 'center' }}>
                                                    {log.created_at
                                                        ? new Date(log.created_at).toLocaleTimeString('th-TH', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit', 
                                                            second: '2-digit' 
                                                        })
                                                        : "-"}
                                                </td>
                                                <td style={{
                                                    padding: "16px 12px", 
                                                    textAlign: 'center',
                                                    fontWeight: "600"
                                                }}>
                                                    <span style={{
                                                        color: getActionColor(log.action),
                                                        background: `${getActionColor(log.action)}15`,
                                                        padding: "4px 8px",
                                                        borderRadius: "6px",
                                                        fontSize: "13px",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}>
                                                        {getActionIcon(log.action)} {getActionName(log.action)}
                                                    </span>
                                                </td>
                                                <td style={{ 
                                                    padding: "16px 12px", 
                                                    textAlign: 'left',
                                                    maxWidth: "400px",
                                                    wordWrap: "break-word",
                                                    lineHeight: "1.5"
                                                }}>
                                                    {(() => {
                                                        let detailText = log.detail || "-";
                                                        
                                                        if (log.home_type_name === 'บ้านพักเรือนแถว' && 
                                                            (log.row_name || log.row_number) && 
                                                            detailText !== "-") {
                                                            
                                                            const rowInfo = log.row_name || `แถว ${log.row_number}`;
                                                            
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
                        </div>
                    )}
                </div>
            </div>
            
            {/* ✅ เพิ่ม ToastContainer */}
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ zIndex: 9999 }}
            />
        </div>
    );
}