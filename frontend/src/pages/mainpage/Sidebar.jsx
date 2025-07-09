import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-title">เมนู</div>
      <ul>
        <li className="active" onClick={() => navigate("/")} >หน้าหลัก</li>
        <li className="" onClick={() => navigate("addguest")} >เพิ่มผู้พักอาศัย</li>
        <li onClick={() => navigate("/")}>แก้ไขบ้าน</li>
      </ul>
    </aside>
  );
}