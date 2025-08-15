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
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [homeTypes, setHomeTypes] = useState([]);
  
  // ✅ เพิ่ม state สำหรับข้อมูล dropdown ใน Sidebar
  const [sidebarTwinAreas, setSidebarTwinAreas] = useState([]);
  const [sidebarTownhomeRows, setSidebarTownhomeRows] = useState([]);
  const [sidebarAreaCounts, setSidebarAreaCounts] = useState({});
  const [sidebarRowCounts, setSidebarRowCounts] = useState({});

  // ตรวจสอบหน้าปัจจุบัน
  const currentPage = location.pathname.split('/').pop();
  const searchParams = new URLSearchParams(location.search);
  const currentHomeType = searchParams.get('type');

  // ✅ โหลดข้อมูลสำหรับ Sidebar เสมอ
  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    try {
      // โหลดข้อมูล twin areas
      const twinAreasRes = await axios.get("http://localhost:3001/api/twin-areas");
      setSidebarTwinAreas(twinAreasRes.data);
      
      // โหลดข้อมูล townhome rows
      const townhomeRowsRes = await axios.get("http://localhost:3001/api/townhome-rows");
      setSidebarTownhomeRows(townhomeRowsRes.data);
      
      // โหลดข้อมูล homes เพื่อคำนวณ counts
      const homesRes = await axios.get("http://localhost:3001/api/homes");
      
      // คำนวณ area counts
      const twinHomes = homesRes.data.filter(h => h.hType === 'บ้านพักแฝด');
      const areaCounts = { total: twinHomes.length };
      twinAreasRes.data.forEach(area => {
        areaCounts[area.id] = twinHomes.filter(h => h.twin_area_id == area.id).length;
      });
      setSidebarAreaCounts(areaCounts);
      
      // คำนวณ row counts
      const townhomeHomes = homesRes.data.filter(h => h.hType === 'บ้านพักเรือนแถว');
      const rowCounts = { total: townhomeHomes.length };
      townhomeRowsRes.data.forEach(row => {
        rowCounts[row.id] = townhomeHomes.filter(h => h.row_id == row.id).length;
      });
      setSidebarRowCounts(rowCounts);
      
      console.log("Sidebar data loaded:", {
        twinAreas: twinAreasRes.data.length,
        townhomeRows: townhomeRowsRes.data.length,
        areaCounts,
        rowCounts
      });
      
    } catch (error) {
      console.error("Error loading sidebar data:", error);
    }
  };

  // ✅ ใช้ข้อมูลจาก Sidebar หรือ props (ใช้ที่มีข้อมูลครบกว่า)
  const availableTwinAreas = sidebarTwinAreas.length > 0 ? sidebarTwinAreas : twinAreas;
  const availableTownhomeRows = sidebarTownhomeRows.length > 0 ? sidebarTownhomeRows : townhomeRows;
  const availableAreaCounts = Object.keys(sidebarAreaCounts).length > 0 ? sidebarAreaCounts : areaCounts;
  const availableRowCounts = Object.keys(sidebarRowCounts).length > 0 ? sidebarRowCounts : rowCounts;

  // ✅ แก้ไขฟังก์ชัน getAreaCount และ getRowCount
  const getAreaCount = (areaId) => {
    if (areaId === "total") {
      return availableAreaCounts.total || 0;
    }
    return availableAreaCounts[areaId] || 0;
  };

  const getRowCount = (rowId) => {
    if (rowId === "total") {
      return availableRowCounts.total || 0;
    }
    return availableRowCounts[rowId] || 0;
  };

  // ✅ สร้าง handleHomeTypeClickWithFilter
  const handleHomeTypeClickWithFilter = (homeTypeName, filterType = null, filterValue = null) => {
    let url = `/homes?type=${encodeURIComponent(homeTypeName)}`;
    
    if (filterType && filterValue) {
      url += `&${filterType}=${filterValue}`;
    }
    
    console.log("Navigating to:", url);
    navigate(url);
  };

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

  // เพิ่มฟังก์ชันจัดการ hover
  const handleMouseEnter = (type) => {
    // ยกเลิก timeout ก่อนหน้า
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // เปิด dropdown ทันที
    if (type === 'twin') {
      setIsTwinDropdownOpen(true);
      setIsRowDropdownOpen(false);
    } else if (type === 'row') {
      setIsRowDropdownOpen(true);
      setIsTwinDropdownOpen(false);
    }
  };

  const handleMouseLeave = (type) => {
    // ตั้ง timeout เพื่อปิด dropdown หลังจาก 300ms
    const timeout = setTimeout(() => {
      if (type === 'twin') {
        setIsTwinDropdownOpen(false);
      } else if (type === 'row') {
        setIsRowDropdownOpen(false);
      }
    }, 300);
    
    setHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    // ยกเลิก timeout เมื่อเมาส์เข้า dropdown
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  };

  const handleDropdownMouseLeave = (type) => {
    // ปิด dropdown เมื่อเมาส์ออกจาก dropdown
    if (type === 'twin') {
      setIsTwinDropdownOpen(false);
    } else if (type === 'row') {
      setIsRowDropdownOpen(false);
    }
  };

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
        {allMenuItems.map(item => {
          const isTwinType = item.label === 'บ้านพักแฝด';
          const isTownhomeType = item.label === 'บ้านพักเรือนแถว';
          const hasDropdown = isTwinType || isTownhomeType;
          const isHomeTypeItem = item.homeTypeName !== undefined;

          if (hasDropdown && isHomeTypeItem) {
            return (
              <div 
                key={item.id} 
                style={{ position: 'relative', marginTop: '8px' }}
                onMouseEnter={() => {
                  if (isTwinType) {
                    handleMouseEnter('twin');
                  } else if (isTownhomeType) {
                    handleMouseEnter('row');
                  }
                }}
                onMouseLeave={() => {
                  if (isTwinType) {
                    handleMouseLeave('twin');
                  } else if (isTownhomeType) {
                    handleMouseLeave('row');
                  }
                }}
              >
                <button
                  onClick={() => {
                    if (isTwinType) {
                      handleHomeTypeClick(item.homeTypeName);
                    } else if (isTownhomeType) {
                      handleHomeTypeClick(item.homeTypeName);
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
                
                {/* ✅ Dropdown สำหรับบ้านพักแฝด - ใช้ availableTwinAreas */}
                {isTwinType && isTwinDropdownOpen && (
                  <div 
                    style={{
                      marginTop: '8px',
                      marginLeft: '20px',
                      marginRight: '20px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      animation: 'fadeIn 0.2s ease-in-out',
                      zIndex: 1000
                    }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={() => handleDropdownMouseLeave('twin')}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHomeTypeClickWithFilter(item.homeTypeName, 'area', 'all');
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: selectedArea === "all" && item.active ? '#2563eb' : 'transparent',
                        color: selectedArea === "all" && item.active ? 'white' : '#6b7280',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        borderBottom: '1px solid #e9ecef',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!(selectedArea === "all" && item.active)) {
                          e.target.style.background = '#e5e7eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(selectedArea === "all" && item.active)) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      ทั้งหมด ({getAreaCount("total")})
                    </button>
                    
                    {availableTwinAreas.map(area => (
                      <button
                        key={area.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHomeTypeClickWithFilter(item.homeTypeName, 'area', area.id.toString());
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: selectedArea === area.id.toString() && item.active ? '#2563eb' : 'transparent',
                          color: selectedArea === area.id.toString() && item.active ? 'white' : '#6b7280',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '13px',
                          borderBottom: area.id === availableTwinAreas[availableTwinAreas.length - 1].id ? 'none' : '1px solid #e9ecef',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!(selectedArea === area.id.toString() && item.active)) {
                            e.target.style.background = '#e5e7eb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(selectedArea === area.id.toString() && item.active)) {
                            e.target.style.background = 'transparent';
                          }
                        }}
                      >
                        {area.name} ({getAreaCount(area.id)})
                      </button>
                    ))}
                  </div>
                )}

                {/* ✅ Dropdown สำหรับบ้านพักเรือนแถว - ใช้ availableTownhomeRows */}
                {isTownhomeType && isRowDropdownOpen && (
                  <div 
                    style={{
                      marginTop: '8px',
                      marginLeft: '20px',
                      marginRight: '20px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      animation: 'fadeIn 0.2s ease-in-out',
                      zIndex: 1000
                    }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={() => handleDropdownMouseLeave('row')}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHomeTypeClickWithFilter(item.homeTypeName, 'row', 'all');
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: selectedRow === "all" && item.active ? '#2563eb' : 'transparent',
                        color: selectedRow === "all" && item.active ? 'white' : '#6b7280',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        borderBottom: '1px solid #e9ecef',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!(selectedRow === "all" && item.active)) {
                          e.target.style.background = '#e5e7eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(selectedRow === "all" && item.active)) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      ทั้งหมด ({getRowCount("total")})
                    </button>
                    
                    {availableTownhomeRows.map(row => (
                      <button
                        key={row.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHomeTypeClickWithFilter(item.homeTypeName, 'row', row.id.toString());
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: selectedRow === row.id.toString() && item.active ? '#2563eb' : 'transparent',
                          color: selectedRow === row.id.toString() && item.active ? 'white' : '#6b7280',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '13px',
                          borderBottom: row.id === availableTownhomeRows[availableTownhomeRows.length - 1].id ? 'none' : '1px solid #e9ecef',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!(selectedRow === row.id.toString() && item.active)) {
                            e.target.style.background = '#e5e7eb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(selectedRow === row.id.toString() && item.active)) {
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