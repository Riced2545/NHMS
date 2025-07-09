import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from ".././Sidebar";
import GuestTable from "../guest/GuestTable";
import "./Search.css";

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [houseTypes, setHouseTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  // โหลดประเภทบ้านทั้งหมด
  useEffect(() => {
    axios.get("http://localhost:3001/api/hometypes")
      .then(res => setHouseTypes(res.data))
      .catch(() => setHouseTypes([]));
  }, []);

  // โหลด guest ทั้งหมดเมื่อเปิดหน้า (หรือเมื่อ keyword ว่าง)
  useEffect(() => {
    fetchGuests();
    // eslint-disable-next-line
  }, [keyword, selectedType]);

  const fetchGuests = () => {
    setLoading(true);
    let url = "http://localhost:3001/api/guests";
    let params = [];
    if (keyword.trim() !== "" || selectedType) {
      url = "http://localhost:3001/api/guests/search?";
      if (keyword.trim() !== "") params.push(`q=${encodeURIComponent(keyword)}`);
      if (selectedType) params.push(`type=${encodeURIComponent(selectedType)}`);
      url += params.join("&");
    }
    axios.get(url)
      .then(res => setResults(res.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGuests();
  };

  // ฟังก์ชันลบ
  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:3001/api/guests/${id}`);
        setResults(results.filter(g => g.id !== id));
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  return (
    <div className="search-bg">
      <Navbar />
      <div className="search-container">
        <h2 className="search-title">ค้นหาผู้พักอาศัย</h2>
        <form onSubmit={handleSearch} className="search-form" style={{ gap: 16 }}>
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อหรือนามสกุล"
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
        <div>
          {results.length === 0 && !loading && (
            <div className="search-no-data">ไม่มีข้อมูล</div>
          )}
          {results.length > 0 && (
            <GuestTable
              guests={results}
              showAddress={true}
              showType={true}
              onEdit={g => window.location.href = `/editguest/${g.id}`}
              onDelete={g => handleDelete(g.id)}
            />
          )}
        </div>
      </div>
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