import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/home.css';

export default function HomePage({ onLogout }) {
  const navigate = useNavigate();
  const [homes, setHomes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/api/homes")
      .then(res => setHomes(res.data))
      .catch(() => setHomes([]));
  }, []);



  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) {
      await axios.delete(`http://localhost:3001/api/homes/${id}`);
      setHomes(homes.filter(h => h.home_id !== id));
    }
  };

  return (
    <div className="container">
      <div className="header-row">
        <h2>ข้อมูลบ้าน</h2>
        <button className="add-btn" onClick={() => navigate("/addhome")}>🏠 เพิ่มบ้าน</button>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Actions</th>
            <th>ประเภทบ้าน</th>
            <th>เลขที่บ้าน</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {homes.map((item) => (
            <tr key={item.home_id}>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edithome/${item.home_id}`)}
                >
                  ✏ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.home_id)}
                >
                  🗑 Delete
                </button>
              </td>
              <td>{item.hType}</td>
              <td>{item.Address}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}