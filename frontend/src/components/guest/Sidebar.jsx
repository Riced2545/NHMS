import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-title">เมนู</div>
      <ul>
       <li className="" onClick={() => navigate("/")} >หน้าหลัก</li>
        <li className="" onClick={() => navigate("../flat")} >แฟลตสัญญาบัตร</li>
      </ul>
    </aside>
  );
}