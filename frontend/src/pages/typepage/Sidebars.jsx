import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
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
  
  // เพิ่ม state สำหรับ home types
  const [homeTypes, setHomeTypes] = useState([]);

  // ตรวจสอบหน้าปัจจุบัน
  const currentPage = location.pathname.split('/').pop();
  const searchParams = new URLSearchParams(location.search);
  const currentHomeType = searchParams.get('type');
  
  // โหลดข้อมูล home types
  useEffect(() => {
    loadHomeTypes();
  }, []);

  const loadHomeTypes = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/home_types");
      console.log("Home types loaded:", response.data);
      setHomeTypes(response.data);
    } catch (error) {
      console.error("Error loading home types:", error);
    }
  };

  // ฟังก์ชันสำหรับการนำทางแบบ Dynamic
  const handleHomeTypeClick = (homeTypeName) => {
    // ใช้ query parameter แทนการสร้าง route ใหม่
    navigate(`/homes?type=${encodeURIComponent(homeTypeName)}`);
  };

  // ฟังก์ชันตรวจสอบว่าประเภทบ้านนั้นถูกเลือกหรือไม่
  const isHomeTypeActive = (homeTypeName) => {
    return currentPage === 'homes' && currentHomeType === homeTypeName;
  };

  // ฟังก์ชันสำหรับสร้างไอคอนตามประเภทบ้าน
  const getHomeTypeIcon = (homeTypeName) => {
    switch(homeTypeName) {
      case 'บ้านพักแฝด':
      case 'บ้านพักเรือนแถว':
        return faHouseChimney;
      case 'แฟลตสัญญาบัตร':
        return faBuilding;
      case 'บ้านพักลูกจ้าง':
        return faUsers;
      default:
        return faHome;
    }
  };

  // ฟังก์ชันตรวจสอบว่าเป็นหน้าปัจจุบันหรือไม่
  const isActive = (page) => {
    return currentPage === page;
  };

  // ฟังก์ชันตรวจสอบว่าอยู่ในหน้า twin home หรือไม่
  const isTwinHomePage = () => {
    return (currentPage === 'homes' && currentHomeType === 'บ้านพักแฝด') ||
           currentPage === 'twinhome1' || 
           currentPage === 'twinhome2' ||
           currentPage === 'twinhome' || 
           location.pathname.includes('twin');
  };

  // เก็บฟังก์ชันเดิมสำหรับ dropdown
  const toggleRowDropdown = () => {
    setIsRowDropdownOpen(!isRowDropdownOpen);
  };

  const toggleTwinDropdown = () => {
    setIsTwinDropdownOpen(!isTwinDropdownOpen);
  };

  const selectRow = (rowId) => {
    if (onRowChange) {
      onRowChange(rowId);
    }
    setIsRowDropdownOpen(false);
  };

  const selectArea = (areaId) => {
    if (onAreaChange) {
      onAreaChange(areaId);
    }
    setIsTwinDropdownOpen(false);
  };

  const getRowCount = (rowKey) => {
    if (!rowCounts) return 0;
    return rowCounts[rowKey] || 0;
  };

  const getAreaCount = (areaKey) => {
    if (!areaCounts) return 0;
    return areaCounts[areaKey] || 0;
  };

  // ฟังก์ชันสำหรับข้อมูลสำรอง
  const getAvailableRows = () => {
    if (townhomeRows && townhomeRows.length > 0) {
      return townhomeRows;
    }
    
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
    return fallbackRows;
  };

  const getAvailableAreas = () => {
    if (twinAreas && twinAreas.length > 0) {
      return twinAreas;
    }
    
    const fallbackAreas = [
      { id: 1, name: 'พื้นที่ 1', max_capacity: 6, home_count: 0 },
      { id: 2, name: 'พื้นที่ 2', max_capacity: 4, home_count: 0 }
    ];
    return fallbackAreas;
  };

  const availableRows = getAvailableRows();
  const availableAreas = getAvailableAreas();

  // สร้าง menu items
  const staticMenuItems = [
    {
      id: 'home',
      label: 'หน้าหลัก',
      icon: faHome,
      path: '/',
      active: isActive('') && !currentHomeType
    }
  ];

  // สร้าง dynamic menu items จาก home types
  const dynamicMenuItems = homeTypes.map(homeType => ({
    id: homeType.id,
    label: homeType.name,
    icon: getHomeTypeIcon(homeType.name),
    homeTypeName: homeType.name,
    active: isHomeTypeActive(homeType.name),
    homeType: homeType
  }));

  const allMenuItems = [...staticMenuItems, ...dynamicMenuItems];

  return (
    <div style={{
      width: '260px', // เปลี่ยนจาก 280px
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
        {allMenuItems.map(item => {
          // ตรวจสอบว่าเป็นประเภทบ้านพิเศษที่ต้องมี dropdown หรือไม่
          const isTwinType = item.label === 'บ้านพักแฝด';
          const isTownhomeType = item.label === 'บ้านพักเรือนแถว';
          const hasDropdown = isTwinType || isTownhomeType;
          const isHomeTypeItem = item.homeTypeName !== undefined;

          if (hasDropdown && isHomeTypeItem) {
            return (
              <div key={item.id} style={{ position: 'relative', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    if (isTwinType) {
                      handleHomeTypeClick(item.homeTypeName);
                      if (item.active) {
                        toggleTwinDropdown();
                      }
                    } else if (isTownhomeType) {
                      handleHomeTypeClick(item.homeTypeName);
                      if (item.active) {
                        toggleRowDropdown();
                      }
                    }
                  }}
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
                    justifyContent: 'space-between',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      style={{ 
                        width: '16px',
                        color: item.active ? '#2563eb' : '#9ca3af'
                      }} 
                    />
                    {item.label}
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    style={{
                      fontSize: '12px',
                      transition: 'transform 0.2s',
                      transform: (isTwinType && isTwinDropdownOpen && item.active) || 
                                (isTownhomeType && isRowDropdownOpen && item.active)
                        ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: 0.8
                    }}
                  />
                </button>
                
                {/* Dropdown สำหรับบ้านพักแฝด */}
                {isTwinType && isTwinDropdownOpen && item.active && (
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

                {/* Dropdown สำหรับบ้านพักเรือนแถว */}
                {isTownhomeType && isRowDropdownOpen && item.active && (
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
            );
          } else {
            // สำหรับ menu item ปกติ
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isHomeTypeItem) {
                    handleHomeTypeClick(item.homeTypeName);
                  } else {
                    navigate(item.path);
                  }
                }}
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
            );
          }
        })}
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
            {currentHomeType ? `ข้อมูล${currentHomeType}` : 'ข้อมูลบ้านพัก'}
          </h4>
          <p style={{
            fontSize: '12px',
            color: '#0369a1',
            margin: '0',
            lineHeight: '1.5'
          }}>
            {currentHomeType === 'บ้านพักแฝด' ? (
              <>
                • ทุกพื้นที่: สูงสุด 6 คน<br />
                • เลือกพื้นที่เพื่อดูรายละเอียด<br />
                • สามารถจัดการผู้เข้าพักได้
              </>
            ) : currentHomeType === 'บ้านพักเรือนแถว' ? (
              <>
                • เลือกแถวเพื่อดูบ้านในแถวนั้น<br />
                • ทุกบ้าน: สูงสุด 6 คน<br />
                • คลิก "ทั้งหมด" เพื่อดูทุกแถว
              </>
            ) : currentHomeType ? (
              <>
                • แสดงข้อมูลบ้านประเภท {currentHomeType}<br />
                • ความจุสูงสุด: 6 คนต่อบ้าน<br />
                • สามารถจัดการข้อมูลได้
              </>
            ) : (
              <>
                • เลือกประเภทบ้านเพื่อดูข้อมูล<br />
                • ความจุสูงสุด: 6 คนต่อบ้าน<br />
                • จัดการผู้เข้าพักและสถานะ
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}