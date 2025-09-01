import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Sidebar";
import "../Search/Search.css"; // เพิ่มบรรทัดนี้ ถ้ายังไม่ได้ import

export default function ViewScore() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [ranks, setRanks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // โหลดข้อมูลคะแนน
  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line
  }, [keyword, selectedRank]);

  // โหลดข้อมูลยศสำหรับ filter
  useEffect(() => {
    axios.get("http://localhost:3001/api/ranks")
      .then(res => setRanks(res.data.map(r => r.name)))
      .catch(() => setRanks([]));
  }, []);

  const fetchScores = () => {
    setLoading(true);
    let url = "http://localhost:3001/api/viewscore";
    let params = new URLSearchParams();
    if (keyword.trim() !== "") params.append("q", keyword.trim());
    if (selectedRank) params.append("rank", selectedRank);
    url += "?" + params.toString();

    axios.get(url)
      .then(res => {
        setScores(res.data);
      })
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  };

  // Pagination logic
  const paginatedScores = scores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(scores.length / itemsPerPage);

  const handleSearch = e => {
    e.preventDefault();
    setCurrentPage(1);
    fetchScores();
  };

  return (
    <div className="search-bg dashboard-container">
      <Navbar />
      <div className="search-container">
        <h2 className="search-title">รายชื่อผู้ลงคะแนน</h2>
        {/* ฟอร์มค้นหาและ filter */}
        <form onSubmit={handleSearch} className="search-form" style={{ gap: 16 }}>
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อหรือนามสกุล"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedRank}
            onChange={e => setSelectedRank(e.target.value)}
            className="search-input"
            style={{ maxWidth: 200 }}
          >
            <option value="">ทุกยศ</option>
            {ranks.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
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
          {scores.length === 0 && !loading && (
            <div className="search-no-data">ไม่มีข้อมูลผู้ลงคะแนน</div>
          )}
          {scores.length > 0 && (
            <>
              <table className="search-table">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>คำนำหน้า/ยศ</th>
                    <th>ชื่อ</th>
                    <th>นามสกุล</th>
                    <th>เบอร์โทร</th>
                    <th>คะแนนรวม</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedScores.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{item.title || item.rank_id || "-"}</td>
                      <td>{item.name}</td>
                      <td>{item.lname}</td>
                      <td>{item.phone}</td>
                      <td>{item.total_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
}