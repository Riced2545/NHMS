import { useNavigate, useParams } from "react-router-dom";
import "./Addguest.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const { home_id } = useParams(); // เปลี่ยน id เป็น home_id
  return (
    <aside className="sidebar">
      <div className="sidebar-title">เมนู</div>
      <ul>
        <li onClick={() => navigate(-1) }>กลับ</li>
        <li className="active">เพิ่มผู้พักอาศัย</li>
      </ul>
    </aside>
  );
}
