import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./page2.css";

export default function LoobyPage2({ onLogout }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    // สมมุติ login แล้วเก็บ username ใน localStorage
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
    // ถ้าไม่มี username ให้กลับไป login
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="lobby-bg">
      <nav className="lobby-navbar">
        <div className="navbar-content">
          {/* Username อยู่ตรงกลาง bar */}
          <div className="navbar-username-center">{username}</div>
          <ul className="navbar-menu">
            <li className="navbar-item active" onClick={() => navigate("/")}>
              หน้าแรก
            </li>
            <li className="navbar-item" onClick={() => navigate("/d")}>
              aaaaaaaaaaaaaa
            </li>
            <li className="navbar-item" onClick={() => navigate("/flat")}>
              sssssss OA
            </li>
            <li className="navbar-item" onClick={() => navigate("/twin1")}>
              ssssssssss
            </li>
            <li className="navbar-item" onClick={() => navigate("/townhome")}>
              ddddddddddd
            </li>
          </ul>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>
     
    </div>
  );
}