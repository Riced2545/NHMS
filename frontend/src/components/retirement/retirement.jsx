import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Sidebar";
import { useNavigate } from "react-router-dom";
import "./retirement.css";

export default function RetirementPage() {
  const [retirementData, setRetirementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timeRange: '',
    homeType: '',
    area: '',
    searchName: ''
  });
  
  // เพิ่ม state สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // default 5 รายการต่อหน้า
  
  // เปลี่ยนค่า default retirementYearFilter เป็นปีนี้
  const [retirementYearFilter, setRetirementYearFilter] = useState(String(new Date().getFullYear()));
  
  const [homeTypes, setHomeTypes] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRetirementData();
  }, []);

  useEffect(() => {
    // ดึงประเภทบ้านจาก backend
    axios.get("http://localhost:3001/api/home-types")
      .then(res => setHomeTypes(res.data))
      .catch(() => setHomeTypes([]));
  }, []);

  const fetchRetirementData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/retirement");
      // ไม่ต้องกรอง isWithinOneYear ที่นี่
      setRetirementData(response.data);
    } catch (error) {
      setRetirementData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'buddhist',
      numberingSystem: 'latn'
    };
    
    return date.toLocaleDateString('th-TH', options);
  };

const getDaysMessage = (days) => {
    if (days <= 0) return "เกษียณแล้ว";
    
    const totalMonths = Math.ceil(days / 30);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (days <= 30) return `เหลือ ${totalMonths} เดือน`;
    
    if (years > 0 && months > 0) {
        return `เหลือ ${years} ปี ${months} เดือน`;
    } else if (years > 0) {
        return `เหลือ ${years} ปี`;
    } else {
        return `เหลือ ${months} เดือน`;
    }
};

  const getStatusColor = (days) => {
    if (days <= 0) return "#ef4444"; // แดง - เกษียณแล้ว
    if (days <= 30) return "#dc2626"; // แดงเข้ม - เกือบเกษียณ
    if (days <= 90) return "#f59e0b"; // ส้ม - 3 เดือน
    if (days <= 180) return "#eab308"; // เหลือง - 6 เดือน
    if (days <= 365) return "#10b981"; // เขียว - 1 ปี
    return "#6b7280"; // เทา
  };

  function getRetirementDate(dob) {
    const birthDate = new Date(dob);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    let retirementYear = birthYear + 60;
    // ถ้าเกิดหลังวันที่ 2 ตุลาคม ให้เลื่อนไปปีหน้า
    if (birthMonth > 10 || (birthMonth === 10 && birthDay > 2)) {
      retirementYear += 1;
    }
    return new Date(`${retirementYear}-09-30`);
  }

  // ใช้ retirement_date จาก backend ในการคำนวณวันเหลือ
  const calculateDaysToRetirement = (retirement_date) => {
    const retirementDate = new Date(retirement_date);
    const today = new Date();
    const diffTime = retirementDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // คำนวณจำนวนเดือนที่เหลือ
  const getMonthsToRetirement = (days) => {
    return Math.ceil(days / 30);
  };

  // ฟังก์ชันกรองข้อมูล
  const getFilteredData = () => {
    let filtered = retirementData;

    // กรองเฉพาะผู้ถือสิทธิ
    filtered = filtered.filter(person => person.is_right_holder);

    // กรองตามปีเกษียณ
    if (retirementYearFilter !== "all") {
      filtered = filtered.filter(person => {
        const year = new Date(person.retirement_date).getFullYear();
        return year === parseInt(retirementYearFilter);
      });
    }

    // กรองตามช่วงเวลา
    if (filters.timeRange) {
      filtered = filtered.filter(person => {
        const days = calculateDaysToRetirement(person.retirement_date);
        return days <= parseInt(filters.timeRange);
      });
    }
    
    // กรองตามประเภทบ้าน
    if (filters.homeType) {
      filtered = filtered.filter(person => 
        person.home_type_name === filters.homeType
      );
    }
    
    // กรองตามชื่อ
    if (filters.searchName) {
      filtered = filtered.filter(person => 
        `${person.name} ${person.lname}`.toLowerCase()
          .includes(filters.searchName.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => calculateDaysToRetirement(a.retirement_date) - calculateDaysToRetirement(b.retirement_date));
  };

  // ฟังก์ชันสำหรับข้อมูลในหน้าปัจจุบัน
  const getPaginatedData = () => {
    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  // Reset หน้าเมื่อมีการกรอง
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // กลับไปหน้าแรก
  };

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนขึ้นบนสุด
  };

  // ฟังก์ชันเปลี่ยนจำนวนรายการต่อหน้า
  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1); // กลับไปหน้าแรก
  };

  return (
    <div className="dashboard-container" style={{ 
      minHeight: "100vh", 
      background: "#fafbff", 
      padding: "0 0 64px 0",
      width: "100vw",
      margin: 0,
      overflow: "hidden"
    }}>
      <Navbar />
      <div className="content-container" style={{ 
        padding: "32px",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box"
      }}>

                {/* สถิติสรุปพร้อมตัวกรอง */}
         {!loading && retirementData.length > 0 && (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 4px 24px #e5e7eb",
            marginBottom: "24px"
          }}>
            {/* Header */}
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#3b2566",
              marginBottom: "8px",
              textAlign: "center"
            }}>
              📊 สรุปผู้ถือสิทธิที่จะเกษียณในปีนี้
            </div>

            {/* ตัวกรองข้อมูล */}
            <div style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
              marginTop: "20px"
            }}>
              {/* บรรทัดแรก - ตัวกรองหลัก */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                
                {/* ค้นหาชื่อ */}
                <input
                  type="text"
                  placeholder="🔍 ค้นหาชื่อ-นามสกุล..."
                  value={filters.searchName}
                  onChange={(e) => handleFilterChange({...filters, searchName: e.target.value})}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    minWidth: "220px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
                
                {/* กรองตามประเภทบ้าน */}
                <select
                  value={filters.homeType}
                  onChange={(e) => handleFilterChange({...filters, homeType: e.target.value})}
                  style={{ 
                    padding: "10px 12px", 
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    fontSize: "14px",
                    minWidth: "180px"
                  }}
                >
                  <option value="">🏠 ทุกประเภทบ้าน</option>
                  {homeTypes.map(ht => (
                    <option key={ht.name} value={ht.name}>
                      {ht.name}
                    </option>
                  ))}
                </select>
                
                {/* กรองตามปีเกษียณ */}
                <select
                  value={retirementYearFilter}
                  onChange={e => setRetirementYearFilter(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                    fontSize: "14px",
                    minWidth: "160px"
                  }}
                >
                  <option value={new Date().getFullYear()}>🎯 ปีนี้ ({new Date().getFullYear()})</option>
                  <option value={new Date().getFullYear() + 1}>🎯 ปีหน้า ({new Date().getFullYear() + 1})</option>
                </select>
                
                {/* ปุ่มล้างตัวกรอง */}
                <button
                  onClick={() => {
                    handleFilterChange({timeRange: '', homeType: '', area: '', searchName: ''});
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                >
                  🗑️ ล้างตัวกรอง
                </button>
              </div>

              {/* บรรทัดสอง - การจัดการหน้าและจำนวนรายการ */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #e5e7eb"
              }}>
                
                {/* จำนวนรายการต่อหน้า */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#6b7280" }}>
                    📄 แสดงต่อหน้า:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px"
                    }}
                  >
                    <option value="5">5 รายการ</option>
                    <option value="10">10 รายการ</option>
                    <option value="20">20 รายการ</option>
                    <option value="50">50 รายการ</option>
                    <option value="100">100 รายการ</option>
                  </select>
                </div>

                {/* สถิติ */}
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  📊 แสดงผลลัพธ์: <strong>{getPaginatedData().length}</strong> จาก <strong>{getFilteredData().length}</strong> คน 
                  (ทั้งหมด {retirementData.length} คน)
                </div>

                {/* ข้อมูลหน้าปัจจุบันและปุ่ม Pagination */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    📖 หน้า <strong>{currentPage}</strong> จาก <strong>{totalPages}</strong> หน้า
                  </div>
                  
                  {/* ปุ่ม Pagination แบบย่อ */}
                  {totalPages > 1 && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {/* ปุ่มหน้าก่อนหน้า */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: currentPage === 1 ? "#e5e7eb" : "#3b82f6",
                          color: currentPage === 1 ? "#9ca3af" : "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: "500"
                        }}
                      >
                        ◀️
                      </button>

                      {/* แสดงเฉพาะ 3 หน้าใกล้เคียง */}
                      {(() => {
                        const pages = [];
                        const startPage = Math.max(1, currentPage - 1);
                        const endPage = Math.min(totalPages, currentPage + 1);

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: currentPage === i ? "#3b82f6" : "#f3f4f6",
                                color: currentPage === i ? "white" : "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: currentPage === i ? "600" : "400",
                                minWidth: "28px"
                              }}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}

                      {/* ปุ่มหน้าถัดไป */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: currentPage === totalPages ? "#e5e7eb" : "#3b82f6",
                          color: currentPage === totalPages ? "#9ca3af" : "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: "500"
                        }}
                      >
                        ▶️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Content */}
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            color: "#19b0d9", 
            fontWeight: "bold",
            fontSize: "18px",
            marginTop: "64px",
            width: "100%"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            กำลังโหลดข้อมูล...
          </div>
        ) : getFilteredData().length === 0 ? (
          <div style={{
            textAlign: "center",
            backgroundColor: "#fff",
            padding: "48px",
            borderRadius: "18px",
            boxShadow: "0 4px 24px #e5e7eb",
            maxWidth: "600px",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <div style={{ 
              fontSize: "20px", 
              color: "#6b7280", 
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              ไม่พบข้อมูลที่ตรงกับเงื่อนไข
            </div>
            <div style={{ color: "#6b7280" }}>
              ลองปรับเงื่อนไขการค้นหาใหม่
            </div>
          </div>
        ) : (
          <>
            {/* รายการข้อมูล */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              width: "100%",
              maxWidth: "100%",
              margin: "0 auto",
              boxSizing: "border-box"
            }}>
              {getPaginatedData().map((person, index) => {
                const daysToRetirement = calculateDaysToRetirement(person.retirement_date);
                const monthsToRetirement = getMonthsToRetirement(daysToRetirement);
                
                return (
                  <div
                    key={person.id}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "18px",
                      padding: "24px",
                      boxShadow: "0 4px 24px #e5e7eb",
                      border: `3px solid ${getStatusColor(daysToRetirement)}`,
                      borderLeftWidth: "8px",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 24px #e5e7eb";
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "16px"
                    }}>
                      <div style={{ 
                        flex: 1, 
                        minWidth: "300px",
                        width: "100%"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px"
                        }}>
                          <div style={{ fontSize: "24px" }}>
                            {daysToRetirement <= 30 ? "🔥" : daysToRetirement <= 90 ? "⚠️" : "🎯"}
                          </div>
                          <div>
                            <h3 style={{
                              margin: "0",
                              fontSize: "20px",
                              color: "#1f2937",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              {person.rank_name} {person.name} {person.lname}
                            </h3>
                            <div style={{
                              fontSize: "14px",
                              color: "#6b7280",
                              marginTop: "4px"
                            }}>
                              อายุปัจจุบัน: {person.current_age} ปี • จะครบ 60 ปีในอีก {monthsToRetirement} เดือน
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: "16px",
                          marginBottom: "16px",
                          width: "100%"
                        }}>
                          <div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                              📍 ที่อยู่
                            </div>
                            <div style={{ fontWeight: "500" }}>
                              {person.Address} ({person.home_type_name})
                            </div>
                            {/* เพิ่มข้อมูลพื้นที่/แถว */}
                            <div style={{ 
                              fontSize: "14px", 
                              color: "#151618ff", 
                              marginTop: "4px",
                              fontStyle: "italic"
                            }}>
                              {(() => {
                                if (person.home_type_name === 'บ้านพักเรือนแถว') {
                                  if (person.row_name) {
                                    return ` ${person.row_name}`;
                                  } else if (person.row_number) {
                                    return ` แถว ${person.row_number}`;
                                  }
                                } else if (person.home_type_name === 'บ้านพักแฝด') {
                                  if (person.twin_area_name) {
                                    return ` ${person.twin_area_name}`;
                                  }
                                } 
                                return '';
                              })()}
                            </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                              🎂 วันเกิด
                            </div>
                            <div style={{ fontWeight: "500" }}>
                              {formatDate(person.dob)}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                              🏆 วันเกษียณอายุ
                            </div>
                            <div style={{ fontWeight: "500", color: getStatusColor(daysToRetirement) }}>
                              {formatDate(person.retirement_date)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        textAlign: "center",
                        padding: "16px",
                        backgroundColor: `${getStatusColor(daysToRetirement)}15`,
                        borderRadius: "12px",
                        minWidth: "160px",
                        flexShrink: 0,
                        border: `2px solid ${getStatusColor(daysToRetirement)}`
                      }}>
                        <div style={{
                          fontSize: "28px",
                          fontWeight: "bold",
                          color: getStatusColor(daysToRetirement),
                          marginBottom: "8px"
                        }}>
                          {daysToRetirement}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: getStatusColor(daysToRetirement),
                          fontWeight: "600",
                          marginBottom: "4px"
                        }}>
                          วันที่เหลือ
                        </div>
                        <div style={{
                          fontSize: "14px",
                          color: getStatusColor(daysToRetirement),
                          fontWeight: "bold"
                        }}>
                          {getDaysMessage(daysToRetirement)}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: daysToRetirement <= 30 ? "#fef3c7" : 
                                      daysToRetirement <= 90 ? "#fef3e2" : 
                                      daysToRetirement <= 180 ? "#f0fdf4" : "#f8fafc",
                      borderRadius: "8px",
                      border: `1px solid ${getStatusColor(daysToRetirement)}`,
                      color: daysToRetirement <= 30 ? "#92400e" : 
                             daysToRetirement <= 90 ? "#c2410c" : 
                             daysToRetirement <= 180 ? "#166534" : "#374151",
                      fontSize: "14px",
                      fontWeight: "500",
                      width: "100%",
                      boxSizing: "border-box"
                    }}>
                      {daysToRetirement <= 30 && "🔥 เร่งด่วน: ผู้ถือสิทธิต้องเตรียมการสำหรับการเกษียณอายุ"}
                      {daysToRetirement > 30 && daysToRetirement <= 90 && "⚠️ แจ้งเตือน: ผู้ถือสิทธิใกล้จะถึงเวลาเกษียณ"}
                      {daysToRetirement > 90 && daysToRetirement <= 180 && "📋 ผู้ถือสิทธิควรเริ่มเตรียมการสำหรับการเกษียณ"}
                      {daysToRetirement > 180 && "📅 ผู้ถือสิทธิอยู่ในรายชื่อที่จะเกษียณใน 1 ปีนี้"}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}