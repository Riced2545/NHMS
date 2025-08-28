import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from ".././Sidebar";
import GuestTable from "../guest/GuestTable";
import "./Search.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [houseTypes, setHouseTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);

  // โหลดประเภทบ้านทั้งหมด
  useEffect(() => {
    axios.get("http://localhost:3001/api/hometypes")
      .then(res => setHouseTypes(res.data))
      .catch(() => setHouseTypes([]));
  }, []);

  // โหลดผู้ถือสิทธิ์เมื่อเปิดหน้า
  useEffect(() => {
    fetchRightHolders();
    // eslint-disable-next-line
  }, []);

  const fetchRightHolders = () => {
    setLoading(true);
    
    let url = "http://localhost:3001/api/guests";
    let params = new URLSearchParams();
    
    // เพิ่ม parameter สำหรับผู้ถือสิทธิ์เสมอ
    params.append('right_holders_only', 'true');
    
    // ถ้ามีการค้นหา
    if (keyword.trim() !== "" || selectedType) {
      url = "http://localhost:3001/api/guests/search";
      
      if (keyword.trim() !== "") {
        params.append('q', keyword.trim());
      }
      if (selectedType) {
        params.append('type', selectedType);
      }
    }
    
    const fullUrl = `${url}?${params.toString()}`;
    console.log("Fetching from:", fullUrl);
    
    axios.get(fullUrl)
      .then(res => {
        console.log("Results:", res.data);
        setResults(res.data);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRightHolders();
  };

  // ฟังก์ชันลบ
  const handleDelete = async ({ id }) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/guests/${id}`);
      fetchRightHolders();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบทั้งหมดแบบ toast
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    toast(
      ({ closeToast }) => (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>ยืนยันการลบข้อมูล</div>
          <div style={{ marginBottom: 12 }}>
            ต้องการลบข้อมูลที่เลือกทั้งหมด ({selectedIds.length} รายการ) หรือไม่?
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={async () => {
                closeToast();
                for (const id of selectedIds) {
                  await handleDelete({ id });
                }
                setSelectedIds([]);
                fetchRightHolders();
                toast.success("ลบข้อมูลเรียบร้อยแล้ว", { position: "top-right" });
              }}
            >
              ลบ
            </button>
            <button
              style={{
                background: "#e5e7eb",
                color: "#333",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={closeToast}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ),
      { position: "top-right", autoClose: false }
    );
  };

  const handleDeleteWithConfirm = (guest) => {
    toast(
      ({ closeToast }) => (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>ยืนยันการลบข้อมูล</div>
          <div style={{ marginBottom: 12 }}>
            ต้องการลบข้อมูล {guest.name} {guest.lname} หรือไม่?
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={async () => {
                closeToast();
                await handleDelete({ id: guest.id });
                toast.success("ลบข้อมูลเรียบร้อยแล้ว", { position: "top-right" });
              }}
            >
              ลบ
            </button>
            <button
              style={{
                background: "#e5e7eb",
                color: "#333",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={closeToast}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ),
      { position: "top-right", autoClose: false }
    );
  };

  // Pagination logic
  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="search-bg dashboard-container">
      <Navbar />
      <div className="search-container">
        <h2 className="search-title">ค้นหาผู้ถือสิทธิ์</h2>
        <form onSubmit={handleSearch} className="search-form" style={{ gap: 16 }}>
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อหรือนามสกุลผู้ถือสิทธิ์"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="search-input"
            style={{ maxWidth: 200 }}
          >
            <option value="">ทุกประเภทบ้าน</option>
            {houseTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="search-btn"
            disabled={loading}
          >
            {loading ? "ค้นหา..." : "ค้นหา"}
          </button>
        </form>
        <div className="search-results">
          {results.length === 0 && !loading && (
            <div className="search-no-data">ไม่มีข้อมูลผู้ถือสิทธิ์</div>
          )}
          {results.length > 0 && (
            <>
              {/* ปุ่มลบทั้งหมด */}
              <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                  style={{
                    background: selectedIds.length === 0 ? "#eee" : "#ef4444",
                    color: selectedIds.length === 0 ? "#888" : "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontWeight: "bold",
                    cursor: selectedIds.length === 0 ? "not-allowed" : "pointer"
                  }}
                >
                  🗑️ ลบทั้งหมด
                </button>
                <span style={{ color: "#666", fontSize: 14 }}>
                  {selectedIds.length > 0 ? `เลือก ${selectedIds.length} รายการ` : ""}
                </span>
              </div>
              <GuestTable
                guests={paginatedResults}
                showAddress={true}
                showType={true}
                onEdit={g => window.location.href = `/editguest/${g.id}`}
                onDelete={handleDeleteWithConfirm} // เปลี่ยนตรงนี้
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
              {/* Pagination controls */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24, gap: 8 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ccc", background: currentPage === 1 ? "#eee" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  ◀
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: currentPage === i + 1 ? "#3b82f6" : "#fff",
                      color: currentPage === i + 1 ? "#fff" : "#333",
                      fontWeight: currentPage === i + 1 ? "bold" : "normal",
                      cursor: "pointer"
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ccc", background: currentPage === totalPages ? "#eee" : "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                >
                  ▶
                </button>
              </div>
            </>
          )}
        </div>
      </div>
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

function formatThaiDate(dob) {
  if (!dob) return "";
  const date = new Date(dob);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear() + 543;
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  return `${day} ${monthNames[month]} ${year}`;
}