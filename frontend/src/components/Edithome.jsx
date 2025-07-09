import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/styles.css";

export default function Edithome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ hType: "", Address: "", status: "", image: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // โหลดข้อมูลบ้านจาก backend
    axios.get(`http://localhost:3001/api/homes`)
      .then(res => {
        const home = res.data.find(h => String(h.home_id) === String(id));
        if (home) {
          setForm(home);
          if (home.image) setPreview(`http://localhost:3001/uploads/${home.image}`);
        }
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let imageName = form.image;
    if (file) {
      // อัปโหลดไฟล์ใหม่
      const data = new FormData();
      data.append("image", file);
      const res = await axios.post("http://localhost:3001/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      imageName = res.data.filename;
    }

    await axios.put(`http://localhost:3001/api/homes/${id}`, {
      ...form,
      image: imageName
    });

    setTimeout(() => {
      setSaving(false);
      navigate("/");
    }, 1500);
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 40 }}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="container">
      <h2 className="text-xl font-bold mb-4">แก้ไขบ้าน</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ประเภทบ้าน</label>
          <select
            name="hType"
            value={form.hType}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          >
            <option value="">-- กรุณาเลือกประเภทบ้าน --</option>
            <option value="แฟลตสัญญาบัตร">แฟลตสัญญาบัตร</option>
            <option value="บ้านพักเรือนแถว">บ้านพักเรือนแถว</option>
            <option value="บ้านพักแฝดพื้นที่ 1">บ้านพักแฝดพื้นที่ 1</option>
            <option value="บ้านพักแฝดพื้นที่ 2">บ้านพักแฝดพื้นที่ 2</option>
            <option value="บ้านพักลูกจ้าง">บ้านพักลูกจ้าง</option>
          </select>
        </div>
        <div>
          <label>ที่อยู่</label>
          <input
            type="text"
            name="Address"
            value={form.Address}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          />
        </div>
        <div>
          <label>สถานะ</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          >
            <option value="">-- สถานะ --</option>
            <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
            <option value="มีผู้พักอาศัย">มีผู้พักอาศัย</option>
          </select>
        </div>
        <div>
          <label>รูปภาพบ้าน</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border px-2 py-1 rounded w-full"
          />
          {preview && (
            <div style={{ marginTop: 10 }}>
              <img src={preview} alt="preview" style={{ maxWidth: 220, borderRadius: 8 }} />
            </div>
          )}
        </div>
        <div className="edit-form-actions">
          <button
            type="submit"
            className="save-btn"
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="delete-btn"
            disabled={saving}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}