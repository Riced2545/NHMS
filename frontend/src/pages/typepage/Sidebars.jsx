import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBuilding, 
  faHouseChimney, 
  faUsers, 
  faChevronDown 
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ selectedRow, onRowChange, rowCounts, townhomeRows, selectedArea, onAreaChange, areaCounts, twinAreas }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRowDropdownOpen, setIsRowDropdownOpen] = useState(false);
  const [isTwinDropdownOpen, setIsTwinDropdownOpen] = useState(false);

  // ตรวจสอบหน้าปัจจุบัน
  const currentPage = location.pathname.split('/').pop();
  
  // Debug useEffect
  useEffect(() => {
    console.log("=== Sidebar Debug ===");
    console.log("Current page:", currentPage);
    console.log("townhomeRows:", townhomeRows);
    console.log("rowCounts:", rowCounts);
    console.log("selectedRow:", selectedRow);
    console.log("twinAreas:", twinAreas);
    console.log("areaCounts:", areaCounts);
    console.log("selectedArea:", selectedArea);
  }, [townhomeRows, rowCounts, selectedRow, currentPage, twinAreas, areaCounts, selectedArea]);

  const toggleRowDropdown = () => {
    console.log("Toggle row dropdown:", !isRowDropdownOpen);
    setIsRowDropdownOpen(!isRowDropdownOpen);
  };

  const toggleTwinDropdown = () => {
    console.log("Toggle twin dropdown:", !isTwinDropdownOpen);
    setIsTwinDropdownOpen(!isTwinDropdownOpen);
  };

  const selectRow = (rowId) => {
    console.log("Selected row:", rowId);
    if (onRowChange) {
      onRowChange(rowId);
    }
    setIsRowDropdownOpen(false);
  };

  const selectArea = (areaId) => {
    console.log("Selected area:", areaId);
    if (onAreaChange) {
      onAreaChange(areaId);
    }
    setIsTwinDropdownOpen(false);
  };

  const getSelectedRowName = () => {
    if (selectedRow === "all") return "ทั้งหมด";
    const selectedRowData = getAvailableRows().find(r => r.id === parseInt(selectedRow));
    return selectedRowData ? selectedRowData.name : `แถว ${selectedRow}`;
  };

  const getSelectedAreaName = () => {
    if (selectedArea === "all") return "ทั้งหมด";
    const selectedAreaData = getAvailableAreas().find(a => a.id === parseInt(selectedArea));
    return selectedAreaData ? selectedAreaData.name : `พื้นที่ ${selectedArea}`;
  };

  const getRowCount = (rowKey) => {
    if (!rowCounts) return 0;
    return rowCounts[rowKey] || 0;
  };

  const getAreaCount = (areaKey) => {
    if (!areaCounts) return 0;
    return areaCounts[areaKey] || 0;
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

  // ฟังก์ชันสำหรับ twin areas
  const getAvailableAreas = () => {
    console.log("=== getAvailableAreas ===");
    console.log("twinAreas array:", twinAreas);
    console.log("twinAreas length:", twinAreas?.length);
    
    if (twinAreas && twinAreas.length > 0) {
      console.log("Using real twin areas:", twinAreas);
      return twinAreas;
    }
    
    // ใช้ข้อมูลสำรอง
    console.log("Using fallback areas");
    const fallbackAreas = [
      { id: 1, name: 'พื้นที่ 1', max_capacity: 6, home_count: 0 },
      { id: 2, name: 'พื้นที่ 2', max_capacity: 4, home_count: 0 }
    ];
    console.log("Fallback areas:", fallbackAreas);
    return fallbackAreas;
  };

  const availableRows = getAvailableRows();
  const availableAreas = getAvailableAreas();
  console.log("Available rows for render:", availableRows);
  console.log("Available areas for render:", availableAreas);

  // ฟังก์ชันตรวจสอบว่าเป็นหน้าปัจจุบันหรือไม่
  const isActive = (page) => {
    return currentPage === page;
  };

  // ฟังก์ชันตรวจสอบว่าอยู่ในหน้า twin home หรือไม่
  const isTwinHomePage = () => {
    return currentPage === 'twinhome1' || 
           currentPage === 'twinhome2' ||
           currentPage === 'twinhome' || // เพิ่มหน้า twinhome ทั้งหมด
           location.pathname.includes('twin');
  };

  const menuItems = [
    {
      id: 'home',
      label: 'หน้าหลัก',
      icon: faHome,
      path: '/',
      active: isActive('')
    },
    {
      id: 'flat',
      label: 'แฟลตสัญญาบัตร',
      icon: faBuilding,
      path: '/flat',
      active: isActive('flat')
    },
    {
      id: 'emphome',
      label: 'บ้านพักลูกจ้าง',
      icon: faUsers,
      path: '/emphome',
      active: isActive('emphome')
    }
  ];

  return (
    <div style={{
      width: '280px',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '24px 0',
      minHeight: '100%'
    }}>
      <div style={{
        padding: '0 24px',
        marginBottom: '32px',
        borderBottom: '2px solid #f3f4f6',
        paddingBottom: '16px'
      }}>
        <h3 style={{
          color: '#374151',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FontAwesomeIcon icon={faHome} style={{ color: '#6366f1' }} />
          เมนูหลัก
        </h3>
      </div>

      <nav>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: item.active ? '#f0f7ff' : 'transparent',
              color: item.active ? '#2563eb' : '#6b7280',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderLeft: item.active ? '4px solid #2563eb' : '4px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: item.active ? '600' : '500'
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                e.target.style.background = '#f9fafb';
                e.target.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6b7280';
              }
            }}
          >
            <FontAwesomeIcon 
              icon={item.icon} 
              style={{ 
                width: '16px',
                color: item.active ? '#2563eb' : '#9ca3af'
              }} 
            />
            {item.label}
          </button>
        ))}

        {/* Dropdown สำหรับบ้านพักแฝด */}
        <div style={{
          position: 'relative',
          marginTop: '8px'
        }}>
          <button
            onClick={() => {
              if (!isTwinHomePage()) {
                navigate("/twinhome"); // ไปที่หน้าบ้านพักแฝดทั้งหมด
              } else {
                toggleTwinDropdown();
              }
            }}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: isTwinHomePage() ? '#f0f7ff' : 'transparent',
              color: isTwinHomePage() ? '#2563eb' : '#6b7280',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderLeft: isTwinHomePage() ? '4px solid #2563eb' : '4px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '14px',
              fontWeight: isTwinHomePage() ? '600' : '500'
            }}
            onMouseEnter={(e) => {
              if (!isTwinHomePage()) {
                e.target.style.background = '#f9fafb';
                e.target.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (!isTwinHomePage()) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6b7280';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FontAwesomeIcon 
                icon={faHouseChimney} 
                style={{ 
                  width: '16px',
                  color: isTwinHomePage() ? '#2563eb' : '#9ca3af'
                }} 
              />
              บ้านพักแฝด
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              style={{
                fontSize: '12px',
                transition: 'transform 0.2s',
                transform: isTwinDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 0.8
              }}
            />
          </button>
          
          {/* Dropdown เลือกพื้นที่ - แสดงเฉพาะในหน้า twinhome */}
          {isTwinDropdownOpen && isTwinHomePage() && (
            <div style={{
              marginTop: '8px',
              marginLeft: '20px',
              marginRight: '20px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectArea("all");
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: selectedArea === "all" ? '#2563eb' : 'transparent',
                  color: selectedArea === "all" ? 'white' : '#6b7280',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  borderBottom: '1px solid #e9ecef',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedArea !== "all") {
                    e.target.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedArea !== "all") {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                ทั้งหมด ({getAreaCount("total")})
              </button>
              
              {availableAreas.map(area => (
                <button
                  key={area.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectArea(area.id.toString());
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: selectedArea === area.id.toString() ? '#2563eb' : 'transparent',
                    color: selectedArea === area.id.toString() ? 'white' : '#6b7280',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    borderBottom: area.id === availableAreas.length ? 'none' : '1px solid #e9ecef',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedArea !== area.id.toString()) {
                      e.target.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedArea !== area.id.toString()) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {area.name} ({getAreaCount(area.id)})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown สำหรับบ้านพักเรือนแถว */}
        <div style={{
          position: 'relative',
          marginTop: '8px'
        }}>
          <button
            onClick={() => {
              if (!isActive('townhome')) {
                navigate("/townhome");
              } else {
                toggleRowDropdown();
              }
            }}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: isActive('townhome') ? '#f0f7ff' : 'transparent',
              color: isActive('townhome') ? '#2563eb' : '#6b7280',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderLeft: isActive('townhome') ? '4px solid #2563eb' : '4px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '14px',
              fontWeight: isActive('townhome') ? '600' : '500'
            }}
            onMouseEnter={(e) => {
              if (!isActive('townhome')) {
                e.target.style.background = '#f9fafb';
                e.target.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('townhome')) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6b7280';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FontAwesomeIcon 
                icon={faHouseChimney} 
                style={{ 
                  width: '16px',
                  color: isActive('townhome') ? '#2563eb' : '#9ca3af'
                }} 
              />
              บ้านพักเรือนแถว
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              style={{
                fontSize: '12px',
                transition: 'transform 0.2s',
                transform: isRowDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 0.8
              }}
            />
          </button>
          
          {/* Dropdown รายการแถว - แสดงเฉพาะในหน้า townhome */}
          {isRowDropdownOpen && isActive('townhome') && (
            <div style={{
              marginTop: '8px',
              marginLeft: '20px',
              marginRight: '20px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectRow("all");
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: selectedRow === "all" ? '#2563eb' : 'transparent',
                  color: selectedRow === "all" ? 'white' : '#6b7280',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  borderBottom: '1px solid #e9ecef',
                  transition: 'all 0.2s ease'
                }}
              >
                ทั้งหมด ({getRowCount("total")})
              </button>
              
              {availableRows.map(row => (
                <button
                  key={row.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectRow(row.id.toString());
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: selectedRow === row.id.toString() ? '#2563eb' : 'transparent',
                    color: selectedRow === row.id.toString() ? 'white' : '#6b7280',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    borderBottom: row.id === availableRows.length ? 'none' : '1px solid #e9ecef',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRow !== row.id.toString()) {
                      e.target.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRow !== row.id.toString()) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {row.name} ({getRowCount(row.id)})
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ข้อมูลสำคัญด้านล่าง */}
      <div style={{
        padding: '24px',
        marginTop: '32px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <div style={{
          background: '#f0f7ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e0f2fe'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#0369a1',
            margin: '0 0 8px 0'
          }}>
            {isTwinHomePage() ? 'ข้อมูลบ้านแฝด' : 'ข้อมูลบ้านเรือนแถว'}
          </h4>
          <p style={{
            fontSize: '12px',
            color: '#0369a1',
            margin: '0',
            lineHeight: '1.5'
          }}>
            {isTwinHomePage() ? (
              <>
                • พื้นที่ 1: สูงสุด 6 คน<br/>
                • พื้นที่ 2: สูงสุด 4 คน<br/>
                • เลือกพื้นที่เพื่อดูรายละเอียด
              </>
            ) : (
              <>
                • เลือกแถวเพื่อดูบ้านในแถวนั้น<br/>
                • ตัวเลขในวงเล็บคือจำนวนบ้าน<br/>
                • คลิก "ทั้งหมด" เพื่อดูทุกแถว
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}