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
        <li onClick={() => navigate("../twin1")}>บ้านพักแฝดพื้นที่ 1</li>
        <li onClick={() => navigate("../twin2")}>บ้านพักแฝดพื้นที่ 2</li>
        <li className="active" onClick={() => navigate("../townhome")}>บ้านพักเรือนแถว</li>
        <li className="" onClick={() => navigate("../emphome")}>บ้านพักลูกจ้าง</li>
      </ul>
    </aside>
  );
}