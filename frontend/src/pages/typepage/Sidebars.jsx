import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./townhome/index.css"; // ใช้ CSS ของ townhome

export default function Sidebar({ selectedRow, onRowChange, rowCounts, townhomeRows }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRowDropdownOpen, setIsRowDropdownOpen] = useState(false);

  // ตรวจสอบหน้าปัจจุบัน
  const currentPage = location.pathname.split('/').pop();
  
  // Debug useEffect
  useEffect(() => {
    console.log("=== Sidebar Debug ===");
    console.log("Current page:", currentPage);
    console.log("townhomeRows:", townhomeRows);
    console.log("rowCounts:", rowCounts);
    console.log("selectedRow:", selectedRow);
  }, [townhomeRows, rowCounts, selectedRow, currentPage]);

  const toggleRowDropdown = () => {
    console.log("Toggle dropdown:", !isRowDropdownOpen);
    setIsRowDropdownOpen(!isRowDropdownOpen);
  };

  const selectRow = (rowId) => {
    console.log("Selected row:", rowId);
    if (onRowChange) {
      onRowChange(rowId);
    }
    setIsRowDropdownOpen(false);
  };

  const getSelectedRowName = () => {
    if (selectedRow === "all") return "ทั้งหมด";
    const selectedRowData = getAvailableRows().find(r => r.id === parseInt(selectedRow));
    return selectedRowData ? selectedRowData.name : `แถว ${selectedRow}`;
  };

  const getRowCount = (rowKey) => {
    if (!rowCounts) return 0;
    return rowCounts[rowKey] || 0;
  };

  // ฟังก์ชันสำหรับใช้ข้อมูลสำรองถ้า townhomeRows ไม่มีข้อมูล
  const getAvailableRows = () => {
    console.log("=== getAvailableRows ===");
    console.log("townhomeRows array:", townhomeRows);
    console.log("townhomeRows length:", townhomeRows?.length);
    
    // ใช้ข้อมูลสำรองเสมอเพื่อ test
    console.log("Using fallback rows for testing");
    const fallbackRows = [];
    for (let i = 1; i <= 10; i++) {
      fallbackRows.push({
        id: i,
        row_number: i,
        name: `แถว ${i}`,
        max_capacity: 10,
        home_count: 0
      });
    }
    console.log("Fallback rows:", fallbackRows);
    return fallbackRows;
  };

  const availableRows = getAvailableRows();
  console.log("Available rows for render:", availableRows);

  // ฟังก์ชันตรวจสอบว่าเป็นหน้าปัจจุบันหรือไม่
  const isActive = (page) => {
    return currentPage === page;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">เมนู</div>
      <ul>
        <li className={isActive('') ? 'active' : ''} onClick={() => navigate("/")} >หน้าหลัก</li>
        <li className={isActive('flat') ? 'active' : ''} onClick={() => navigate("/flat")} >แฟลตสัญญาบัตร</li>
        <li className={isActive('twin1') ? 'active' : ''} onClick={() => navigate("/twin1")}>บ้านพักแฝดพื้นที่ 1</li>
        <li className={isActive('twin2') ? 'active' : ''} onClick={() => navigate("/twin2")}>บ้านพักแฝดพื้นที่ 2</li>
        
        {/* Dropdown สำหรับบ้านพักเรือนแถว */}
        <li 
          className={isActive('townhome') ? 'active' : ''}
          style={{
            position: 'relative',
            padding: '12px 16px',
            marginBottom: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            color: isActive('townhome') ? 'white' : '#6b7280',
            background: isActive('townhome') ? '#4B2993' : 'transparent',
            fontWeight: isActive('townhome') ? '500' : 'normal'
          }}
        >
          <div 
            onClick={() => {
              // ถ้าไม่ใช่หน้า townhome ให้ navigate ไป
              if (!isActive('townhome')) {
                navigate("/townhome");
              } else {
                // ถ้าอยู่หน้า townhome อยู่แล้ว ให้ toggle dropdown
                toggleRowDropdown();
              }
            }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <span>บ้านพักเรือนแถว</span>
            <span 
              style={{
                fontSize: '12px',
                transition: 'transform 0.2s',
                transform: isRowDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 0.8
              }}
            >
              ▼
            </span>
          </div>
          
          {/* Dropdown รายการแถว - แสดงเฉพาะในหน้า townhome */}
          {isRowDropdownOpen && isActive('townhome') && (
            <div 
              style={{
                marginTop: '8px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <div 
                className={`submenu-item ${selectedRow === "all" ? "selected" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectRow("all");
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  background: selectedRow === "all" ? '#4B2993' : 'transparent',
                  color: selectedRow === "all" ? 'white' : '#6b7280',
                  borderBottom: '1px solid #e9ecef'
                }}
              >
                ทั้งหมด ({getRowCount("total")})
              </div>
              
              {availableRows.map(row => {
                console.log("Rendering row:", row);
                return (
                  <div 
                    key={row.id}
                    className={`submenu-item ${selectedRow === row.id.toString() ? "selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectRow(row.id.toString());
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      background: selectedRow === row.id.toString() ? '#4B2993' : 'transparent',
                      color: selectedRow === row.id.toString() ? 'white' : '#6b7280',
                      borderBottom: row.id === availableRows.length ? 'none' : '1px solid #e9ecef'
                    }}
                  >
                    {row.name} ({getRowCount(row.id)})
                  </div>
                );
              })}
            </div>
          )}
        </li>
        
        <li className={isActive('emphome') ? 'active' : ''} onClick={() => navigate("/emphome")}>บ้านพักลูกจ้าง</li>
      </ul>

      {/* เอา debug info ออกเพื่อให้ sidebar สะอาด */}
    </aside>
  );
}