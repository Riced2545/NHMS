import { useNavigate } from "react-router-dom";
import "./page.css";

export default function LoobyPage() {
  const navigate = useNavigate();

  return (
    <div className="main-bg">
      <nav className="main-navbar">
        <div className="navbar-content">
          {/* เมนูซ้าย */}
          <ul className="navbar-menu">
            <li
              className="navbar-item active"
              onClick={() => navigate("/d")}
            >
              หน้าแรก
            </li>
            <li
              className="navbar-item"
              onClick={() => navigate("/")}
            >
              aaaaaaaaaaaaaa
            </li>
            <li
              className="navbar-item"
              onClick={() => navigate("/flat")}
            >
              sssssss OA
            </li>
            <li
              className="navbar-item"
              onClick={() => navigate("/twin1")}
            >
              ssssssssss
            </li>
            <li
              className="navbar-item"
              onClick={() => navigate("/townhome")}
            >
              ddddddddddd
            </li>
          </ul>
          {/* เมนูขวา */}
          <ul className="navbar-menu-right">
            <li
              className="navbar-item"
              onClick={() => navigate("/login")}
            >
              Login
            </li>
            <li
              className="navbar-item"
              onClick={() => navigate("/register")}
            >
              Signin
            </li>
          </ul>
        </div>
      </nav>
      <div className="black-bg">
        {/* ตัวอย่างพื้นหลังดำ */}
      </div>
    </div>
  );
}