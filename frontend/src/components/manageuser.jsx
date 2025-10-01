import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Sidebar";
import { RegisterFormTH } from "./RegisterForm";
import "./guest/guest.css";

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState(""); // เพิ่ม state สำหรับรหัสผ่านใหม่
  const [roles, setRoles] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    fetchUsers();
    axios.get("http://localhost:3001/api/roles").then(res => setRoles(res.data));
  }, []);

  const fetchUsers = () => {
    axios.get("http://localhost:3001/api/users").then(res => setUsers(res.data));
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditUsername(user.username);
    setEditRole(user.role_id.toString());
    setEditPassword(""); // reset password field
  };

  const handleSave = () => {
    axios.put(`http://localhost:3001/api/users/${editId}`, {
      username: editUsername,
      role_id: editRole,
      password: editPassword // ส่ง password ไปด้วย
    }).then(() => {
      setEditId(null);
      fetchUsers();
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("ต้องการลบบัญชีนี้จริงหรือไม่?")) {
      axios.delete(`http://localhost:3001/api/users/${id}`).then(fetchUsers);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafbff",
      width: "100vw",
      margin: 0,
      overflow: "hidden"
    }}>
      <Navbar />
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "calc(100vh - 84px)",
        padding: "48px 0"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px #e5e7eb",
          padding: 32,
          width: "100%",
          maxWidth: "1200px",
          border: "2px solid #e5e7eb",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24
          }}>
            <h2 style={{ fontWeight: "bold", fontSize: 24, color: "#3b2566", margin: 0 }}>
              จัดการบัญชีผู้ใช้งาน
            </h2>
            <button
              onClick={() => setShowAddUser(true)}
              style={{
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 28px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59,130,246,0.12)"
              }}
            >
              + เพิ่มผู้ใช้งาน
            </button>
          </div>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 16,
            background: "#fff"
          }}>
            <thead>
              <tr>
                <th style={{
                  background: "#e0f2fe",
                  color: "#2563eb",
                  padding: "12px 8px",
                  borderTopLeftRadius: 12,
                  borderBottom: "2px solid #e5e7eb"
                }}>ชื่อผู้ใช้</th>
                <th style={{
                  background: "#e0f2fe",
                  color: "#2563eb",
                  padding: "12px 8px",
                  borderBottom: "2px solid #e5e7eb"
                }}>ประเภทบัญชี</th>
                <th style={{
                  background: "#e0f2fe",
                  color: "#2563eb",
                  padding: "12px 8px",
                  textAlign: "center",
                  borderTopRightRadius: 12,
                  borderBottom: "2px solid #e5e7eb"
                }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "24px", color: "#ef4444" }}>ไม่มีข้อมูลผู้ใช้</td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id} style={{
                    background: idx % 2 === 0 ? "#f8fafc" : "#fff",
                    transition: "background 0.2s"
                  }}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      {editId === user.id ? (
                        <>
                          <input
                            value={editUsername}
                            onChange={e => setEditUsername(e.target.value)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              fontSize: 15,
                              marginBottom: 6,
                              display: "block"
                            }}
                          />
                          {/* ช่องเปลี่ยนรหัสผ่าน */}
                          <input
                            type="password"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              fontSize: 15,
                              marginBottom: 6,
                              marginTop: 6,
                              display: "block"
                            }}
                            placeholder="เปลี่ยนรหัสผ่าน (ถ้าไม่กรอกจะไม่เปลี่ยน)"
                          />
                        </>
                      ) : user.username}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      {editId === user.id ? (
                        <select
                          value={editRole}
                          onChange={e => setEditRole(e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                            fontSize: 15
                          }}
                        >
                          {(roles.length > 0 ? roles : [
                            { id: 1, name: "admin" },
                            { id: 2, name: "user" }
                          ]).map(r => (
                            <option key={r.id} value={r.id}>
                              {r.name === "admin" ? "Admin" : "User"}
                            </option>
                          ))}
                        </select>
                      ) : (
                        (() => {
                          const roleObj = roles.find(r => String(r.id) === String(user.role_id));
                          if (roleObj) {
                            return roleObj.name === "admin" ? "Admin" : "User";
                          }
                          // fallback ถ้าไม่เจอ
                          return user.role_id === 1 || user.role_id === "1" ? "Admin" : "User";
                        })()
                      )}
                    </td>
                    <td style={{
                      padding: "10px 8px",
                      borderBottom: "1px solid #e5e7eb",
                      textAlign: "center",
                      minWidth: 140
                    }}>
                      <div style={{
                        display: "inline-flex",
                        gap: 8,
                        justifyContent: "center",
                        alignItems: "center"
                      }}>
                        {editId === user.id ? (
                          <>
                            <button
                              onClick={handleSave}
                              style={{
                                background: "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "6px 16px",
                                fontWeight: "bold",
                                fontSize: 15,
                                cursor: "pointer"
                              }}
                            >💾 บันทึก</button>
                            <button
                              onClick={() => setEditId(null)}
                              style={{
                                background: "#6b7280",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "6px 16px",
                                fontWeight: "bold",
                                fontSize: 15,
                                cursor: "pointer"
                              }}
                            >❌ ยกเลิก</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              style={{
                                background: "#f59e42",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "6px 16px",
                                fontWeight: "bold",
                                fontSize: 15,
                                cursor: "pointer"
                              }}
                            >✏️ แก้ไข</button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "6px 16px",
                                fontWeight: "bold",
                                fontSize: 15,
                                cursor: "pointer"
                              }}
                            >🗑️ ลบ</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
                
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal เพิ่มผู้ใช้งาน */}
      <RegisterFormTH
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}