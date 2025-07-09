import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import GuestTable from "./GuestTable";
import "../../utils/dateUtils"; // ถ้ามีฟังก์ชัน formatThaiDate ใน utils

export default function ViewGuest() {
  const [guests, setGuests] = useState([]);
  const { home_id } = useParams();

  // โหลด guest ใหม่
  const fetchGuests = () => {
    axios.get(`http://localhost:3001/api/guests/home/${home_id}`)
      .then(res => setGuests(res.data))
      .catch(() => setGuests([]));
  };

  useEffect(() => {
    fetchGuests();
  }, [home_id]);

  // รับ guest object ตรงๆ
  const handleDelete = async (guest) => {
    if (window.confirm("ยืนยันการลบข้อมูลนี้?")) {
      await axios.delete(`http://localhost:3001/api/guests/${guest.id}`);
      fetchGuests(); // โหลดใหม่หลังลบ
    }
  };

  const handleEdit = (guest) => {
    window.location.href = `/editguest/${guest.id}`;
  };

  return (
    <div className="guest-table-container" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <h2>รายชื่อผู้พักอาศัย</h2>
        <GuestTable
          guests={guests}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}