require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// เพิ่ม dependency ก่อน: npm install jsonwebtoken
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET; // ควรเก็บใน env
console.log(process.env) 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// *** ย้าย multer config มาไว้ที่นี่ ***
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    if (!fs.existsSync('uploads/')) {
      fs.mkdirSync('uploads/');
    }
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// เสิร์ฟไฟล์รูปภาพ
app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "abc",
});

// ต้อง connect ก่อน!
db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");

  // ---------- สร้างตารางใหม่ ----------
  db.query(`CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS ranks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS home_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS home_eligibility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_type_id INT,
    rank_id INT,
    FOREIGN KEY (home_type_id) REFERENCES home_types(id),
    FOREIGN KEY (rank_id) REFERENCES ranks(id)
  )`);

  // ---------- สร้างตารางเดิม ----------
  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS home (
    home_id INT AUTO_INCREMENT PRIMARY KEY,
    home_type_id INT,
    Address VARCHAR(255),
    status_id INT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_type_id) REFERENCES home_types(id),
    FOREIGN KEY (status_id) REFERENCES status(id)
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS guest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_id INT,
    rank_id INT,
    name VARCHAR(255),
    lname VARCHAR(255),
    dob DATE,
    pos VARCHAR(255),
    income INT,
    phone VARCHAR(12),
    job_phone VARCHAR(11),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_id) REFERENCES home(home_id),
    FOREIGN KEY (rank_id) REFERENCES ranks(id)
  )`);

  db.query(`CREATE TABLE IF NOT EXISTS guest_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT,
    home_id INT,
    action VARCHAR(50),         -- เช่น "add", "edit", "delete"
    detail TEXT,                -- รายละเอียดเพิ่มเติม
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guest(id),
    FOREIGN KEY (home_id) REFERENCES home(home_id)
  )`);

  // เพิ่มข้อมูลเริ่มต้น
  db.query("INSERT IGNORE INTO home_types (name) VALUES ('บ้านพักแฝดพื้นที่1'), ('บ้านพักแฝดพื้นที่2'), ('บ้านพักเรือนแถว'),('แฟลตสัญญาบัตร'),('บ้านพักลูกจ้าง')", (err) => {
    if (err) console.log("Warning: Failed to insert default home_types");
    else console.log("✅ Default home_types created");
  });

  db.query("INSERT IGNORE INTO status (name) VALUES ('มีผู้พักอาศัย'), ('ไม่มีผู้พักอาศัย'), ('ปิดปรับปรุง')", (err) => {
    if (err) console.log("Warning: Failed to insert default status");
    else console.log("✅ Default status created");
  });

});

// Register (แก้ไขให้รับข้อมูล profile)
app.post("/api/register", (req, res) => {
  const { username, password, firstName, lastName, gender } = req.body;
  const hash = bcrypt.hashSync(password, 3);
  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hash],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Username already exists" });
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      SECRET,
      { expiresIn: "24h" }
    );
    
    res.json({
      success: true,
      token,
      role_id: user.role_id,
      username: user.username, // เพิ่มบรรทัดนี้
      user_id: user.id,
      message: "เข้าสู่ระบบสำเร็จ"
    });
  });
});

// ตัวอย่าง middleware ตรวจสอบ token
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// API endpoints
app.get("/api/home-types", (req, res) => {
  const sql = "SELECT * FROM home_types ORDER BY name";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/api/status", (req, res) => {
  const sql = "SELECT * FROM status ORDER BY name";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// API สำหรับดึงข้อมูลบ้านเดี่ยว
app.get("/api/homes/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT h.*, ht.name as hType, s.name as status
    FROM home h
    LEFT JOIN home_types ht ON h.home_type_id = ht.id
    LEFT JOIN status s ON h.status_id = s.id
    WHERE h.home_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Home not found" });
    }
    res.json(results[0]);
  });
});

// API สำหรับอัพเดทบ้าน
app.put("/api/homes/:id", upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { Address, home_type_id, status_id } = req.body;
  
  console.log("Updating home:", { id, Address, home_type_id, status_id });
  console.log("File:", req.file);
  
  // ดึงข้อมูลบ้านเดิมก่อนอัพเดท
  const getOldDataSql = `
    SELECT h.*, ht.name as hType, s.name as status
    FROM home h
    LEFT JOIN home_types ht ON h.home_type_id = ht.id
    LEFT JOIN status s ON h.status_id = s.id
    WHERE h.home_id = ?
  `;
  
  db.query(getOldDataSql, [id], (err, oldData) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    
    if (oldData.length === 0) {
      return res.status(404).json({ error: "Home not found" });
    }
    
    const oldHome = oldData[0];
    
    // อัพเดทข้อมูลบ้าน
    let sql = "UPDATE home SET Address = ?, home_type_id = ?, status_id = ?";
    let params = [Address, home_type_id, status_id];
    
    if (req.file) {
      sql += ", image = ?";
      params.push(req.file.filename);
    }
    
    sql += " WHERE home_id = ?";
    params.push(id);
    
    console.log("SQL:", sql);
    console.log("Params:", params);
    
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Home not found" });
      }
      
      // ดึงข้อมูลใหม่หลังอัพเดท
      const getNewDataSql = `
        SELECT h.*, ht.name as hType, s.name as status
        FROM home h
        LEFT JOIN home_types ht ON h.home_type_id = ht.id
        LEFT JOIN status s ON h.status_id = s.id
        WHERE h.home_id = ?
      `;
      
      db.query(getNewDataSql, [id], (err, newData) => {
        if (err) {
          console.error("Error fetching new data:", err);
          return res.json({ message: "Home updated successfully, but failed to log" });
        }
        
        const newHome = newData[0];
        
        // สร้างรายละเอียดการเปลี่ยนแปลง
        let changes = [];
        
        if (oldHome.Address !== newHome.Address) {
          changes.push(`หมายเลขบ้าน: ${oldHome.Address} → ${newHome.Address}`);
        }
        
        if (oldHome.hType !== newHome.hType) {
          changes.push(`ประเภทบ้าน: ${oldHome.hType} → ${newHome.hType}`);
        }
        
        if (oldHome.status !== newHome.status) {
          changes.push(`สถานะ: ${oldHome.status} → ${newHome.status}`);
        }
        
        if (req.file) {
          changes.push(`อัพโหลดรูปภาพใหม่: ${req.file.filename}`);
        }
        
        const detail = changes.length > 0 
          ? `แก้ไขบ้านหมายเลข ${newHome.Address}: ${changes.join(', ')}`
          : `แก้ไขบ้านหมายเลข ${newHome.Address} (ไม่มีการเปลี่ยนแปลง)`;
        
        // บันทึก audit log
        const logSql = `
          INSERT INTO guest_logs (guest_id, home_id, action, detail, created_at)
          VALUES (NULL, ?, 'edit_home', ?, NOW())
        `;
        
        db.query(logSql, [id, detail], (logErr) => {
          if (logErr) {
            console.error("Error logging audit:", logErr);
          } else {
            console.log("Audit log saved successfully");
          }
          
          console.log("Update successful:", results);
          res.json({ 
            message: "Home updated successfully", 
            affectedRows: results.affectedRows,
            changes: changes
          });
        });
      });
    });
  });
});

// ดึงบ้านทั้งหมด (JOIN home_types)
app.get("/api/homes", (req, res) => {
  db.query(
    `SELECT home.*, home_types.name as hType, status.name as status,
      (SELECT COUNT(*) FROM guest WHERE guest.home_id = home.home_id) AS guest_count
     FROM home
     LEFT JOIN home_types ON home.home_type_id = home_types.id
     LEFT JOIN status ON home.status_id = status.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// *** ลบ multer config ซ้ำออก (ถ้ามี) ***
// ลบส่วนนี้ออก:
/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));
*/

// ดึง guest ทั้งหมด (JOIN ranks)
app.get("/api/guests", (req, res) => {
  db.query(
    `SELECT guest.*, ranks.name as rank, home_types.name as hType, home.Address 
     FROM guest 
     LEFT JOIN ranks ON guest.rank_id = ranks.id
     LEFT JOIN home ON guest.home_id = home.home_id
     LEFT JOIN home_types ON home.home_type_id = home_types.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// Home management APIs
app.get("/api/homes", (req, res) => {
  db.query(
    `SELECT home.*, home_types.name as hType, status.name as status,
      (SELECT COUNT(*) FROM guest WHERE guest.home_id = home.home_id) AS guest_count
     FROM home
     LEFT JOIN home_types ON home.home_type_id = home_types.id
     LEFT JOIN status ON home.status_id = status.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

app.put("/api/homes/:id", (req, res) => {
  const { hType, Address, status, image } = req.body; // hType คือชื่อประเภทบ้าน

  // หา home_type_id จากชื่อ hType
  db.query(
    "SELECT id FROM home_types WHERE name = ?",
    [hType],
    (err, results) => {
      if (err || results.length === 0) return res.status(400).json({ error: "ไม่พบประเภทบ้าน" });
      const home_type_id = results[0].id;

      // หา status_id จากชื่อ status
      db.query(
        "SELECT id FROM status WHERE name = ?",
        [status],
        (err2, results2) => {
          if (err2) return res.status(500).json({ error: "Database error" });
          let status_id = results2.length > 0 ? results2[0].id : null;

          function updateHome(finalStatusId) {
            db.query(
              "UPDATE home SET home_type_id=?, Address=?, status_id=?, image=? WHERE home_id=?",
              [home_type_id, Address, finalStatusId, image, req.params.id],
              (err3, result) => {
                if (err3) return res.status(500).json({ error: "Database error" });
                // เพิ่ม log
                db.query(
                  "INSERT INTO guest_logs (home_id, action, detail) VALUES (?, ?, ?)",
                  [req.params.id, "edit_home", `แก้ไขบ้านเลขที่ ${Address}`]
                );
                res.json({ success: true });
                console.log("✅  Update home: id", req.params.id);
              }
            );
          }

          if (status_id) {
            updateHome(status_id);
          } else {
            // ถ้าไม่มี status นี้ ให้เพิ่มใหม่
            db.query(
              "INSERT INTO status (name) VALUES (?)",
              [status],
              (err4, result4) => {
                if (err4) return res.status(500).json({ error: "Database error" });
                updateHome(result4.insertId);
              }
            );
          }
        }
      );
    }
  );
});

app.delete("/api/homes/:id", (req, res) => {
  // ดึงที่อยู่บ้านก่อนลบ
  db.query("SELECT Address FROM home WHERE home_id=?", [req.params.id], (err, results) => {
    const address = results && results[0] ? results[0].Address : "";
    db.query(
      "DELETE FROM home WHERE home_id=?",
      [req.params.id],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        // เพิ่ม log
        db.query(
          "INSERT INTO guest_logs (home_id, action, detail) VALUES (?, ?, ?)",
          [req.params.id, "delete_home", `ลบบ้านเลขที่ ${address}`]
        );
        res.json({ success: true });
        console.log("✅  Delete Home: id", req.params.id);
      }
    );
  });
});

// POST /api/homes (รองรับไฟล์)
app.post("/api/homes", upload.single("image"), (req, res) => {
  const { home_type_id, Address, status } = req.body;
  const image = req.file ? req.file.filename : null;

  // ตรวจสอบหมายเลขบ้านซ้ำในประเภทบ้านเดียวกัน
  const checkQuery = "SELECT * FROM home WHERE Address = ? AND home_type_id = ?";
  db.query(checkQuery, [Address, home_type_id], (err, results) => {
    if (err) {
      console.error("Error checking duplicate address:", err);
      return res.status(500).json({ 
        success: false, 
        message: "เกิดข้อผิดพลาดในระบบ" 
      });
    }

    // ถ้าพบหมายเลขบ้านซ้ำในประเภทเดียวกัน
    if (results.length > 0) {
      const getTypeQuery = "SELECT name FROM home_types WHERE id = ?";
      db.query(getTypeQuery, [home_type_id], (err, typeResults) => {
        if (err) {
          return res.status(400).json({ 
            success: false, 
            message: `หมายเลขบ้าน ${Address} มีอยู่ในประเภทบ้านนี้แล้ว` 
          });
        }
        
        const typeName = typeResults.length > 0 ? typeResults[0].name : "ประเภทบ้านนี้";
        return res.status(400).json({ 
          success: false, 
          message: `หมายเลขบ้าน ${Address} มีอยู่ในประเภท "${typeName}" แล้ว` 
        });
      });
      return;
    }

    // ค้นหา/สร้าง status "ไม่มีผู้พักอาศัย"
    db.query("SELECT id FROM status WHERE name = 'ไม่มีผู้พักอาศัย'", (err, statusResults) => {
      let emptyStatusId;
      
      if (err || statusResults.length === 0) {
        // ถ้าไม่มี status "ไม่มีผู้พักอาศัย" ให้สร้างใหม่
        db.query("INSERT INTO status (name) VALUES ('ไม่มีผู้พักอาศัย')", (err, insertResult) => {
          if (err) {
            console.error("Error creating status:", err);
            return res.status(500).json({ 
              success: false, 
              message: "ไม่สามารถสร้างสถานะได้" 
            });
          }
          emptyStatusId = insertResult.insertId;
          insertHome(emptyStatusId);
        });
      } else {
        emptyStatusId = statusResults[0].id;
        insertHome(emptyStatusId);
      }

      function insertHome(statusId) {
        // บันทึกบ้านใหม่พร้อมสถานะ "ไม่มีผู้พักอาศัย"
        const insertQuery = "INSERT INTO home (home_type_id, Address, status_id, image) VALUES (?, ?, ?, ?)";
        db.query(insertQuery, [home_type_id, Address, statusId, image], (err, result) => {
          if (err) {
            console.error("Error inserting home:", err);
            return res.status(500).json({ 
              success: false, 
              message: "ไม่สามารถบันทึกข้อมูลได้" 
            });
          }
          
          // เพิ่ม log การเพิ่มบ้าน
          db.query(
            "INSERT INTO guest_logs (home_id, action, detail) VALUES (?, ?, ?)",
            [result.insertId, "add_home", `เพิ่มบ้านเลขที่ ${Address}`],
            (logErr) => {
              if (logErr) console.log("Warning: Failed to log home addition");
            }
          );
          
          res.json({ 
            success: true, 
            message: "บันทึกข้อมูลสำเร็จ",
            home_id: result.insertId 
          });
        });
      }
    });
  });
});

app.post("/api/guests", (req, res) => {
  const { home_id, rank_id, name, lname, dob, pos, income, phone, job_phone } = req.body;

  db.query(
    "SELECT COUNT(*) AS count FROM guest WHERE home_id = ?",
    [home_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results[0].count >= 4) {
        return res.status(400).json({ error: "บ้านนี้มีผู้พักอาศัยครบ 4 คนแล้ว" });
      }

      const sql = `
        INSERT INTO guest (home_id, rank_id, name, lname, dob, pos, income, phone, job_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [home_id, rank_id, name, lname, dob, pos, income, phone, job_phone],
        (err, result) => {
          if (err) {
            console.log("❌ Failed to insert guest:", err);
            return res.status(500).json({ error: "Database error" });
          }
          
          // ดึงข้อมูลเพื่อ audit log
          db.query(
            `SELECT guest.*, ranks.name as rank_name, home.Address, home_types.name as home_type_name
             FROM guest 
             LEFT JOIN ranks ON guest.rank_id = ranks.id
             LEFT JOIN home ON guest.home_id = home.home_id
             LEFT JOIN home_types ON home.home_type_id = home_types.id
             WHERE guest.id = ?`,
            [result.insertId],
            (err2, guestData) => {
              let detail = `เพิ่มผู้พักอาศัย ${name} ${lname}`;
              
              if (!err2 && guestData.length > 0) {
                const guest = guestData[0];
                detail = `เพิ่มผู้พักอาศัย ${guest.rank_name || ''} ${guest.name} ${guest.lname} เข้าพักบ้านเลขที่ ${guest.Address} (${guest.home_type_name})`;
              }
              
              // เพิ่ม audit log
              db.query(
                "INSERT INTO guest_logs (guest_id, home_id, action, detail) VALUES (?, ?, ?, ?)",
                [result.insertId, home_id, "add", detail],
                (logErr) => {
                  if (logErr) console.error("Error logging guest addition:", logErr);
                  else console.log("Guest addition audit log saved successfully");
                }
              );
            }
          );
          
          // อัปเดตสถานะบ้านเป็น "มีผู้พักอาศัย"
          db.query("SELECT id FROM status WHERE name = 'มีผู้พักอาศัย'", (err2, results2) => {
            if (!err2 && results2.length > 0) {
              const status_id = results2[0].id;
              db.query("UPDATE home SET status_id = ? WHERE home_id = ?", [status_id, home_id]);
            }
          });
          
          res.json({ success: true, id: result.insertId });
        }
      );
    }
  );
});

app.delete("/api/guests/:id", (req, res) => {
  const guestId = req.params.id;

  // ดึงข้อมูลก่อนลบ
  db.query(
    `SELECT guest.*, ranks.name as rank_name, home.Address, home_types.name as home_type_name
     FROM guest 
     LEFT JOIN ranks ON guest.rank_id = ranks.id
     LEFT JOIN home ON guest.home_id = home.home_id
     LEFT JOIN home_types ON home.home_type_id = home_types.id
     WHERE guest.id = ?`,
    [guestId], 
    (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ error: "Guest not found" });

      const guest = results[0];
      const home_id = guest.home_id;
      
      const detail = `ลบผู้พักอาศัย ${guest.rank_name || ''} ${guest.name} ${guest.lname} ออกจากบ้านเลขที่ ${guest.Address} (${guest.home_type_name})`;

      // เพิ่ม audit log ก่อนลบ
      db.query(
        "INSERT INTO guest_logs (guest_id, home_id, action, detail) VALUES (?, ?, ?, ?)",
        [guestId, home_id, "delete", detail],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Database error" });

          // ลบ guest
          db.query("DELETE FROM guest WHERE id = ?", [guestId], (err3) => {
            if (err3) return res.status(500).json({ error: "Database error" });

            // ตรวจสอบจำนวนผู้พักที่เหลือ
            db.query("SELECT COUNT(*) AS count FROM guest WHERE home_id = ?", [home_id], (err4, results2) => {
              if (err4) return res.status(500).json({ error: "Database error" });

              // ถ้าไม่มีผู้พักแล้ว ให้เปลี่ยนสถานะเป็น "ไม่มีผู้พักอาศัย"
              if (results2[0].count === 0) {
                db.query("SELECT id FROM status WHERE name = 'ไม่มีผู้พักอาศัย'", (err5, statusResults) => {
                  if (!err5 && statusResults.length > 0) {
                    db.query("UPDATE home SET status_id = ? WHERE home_id = ?", [statusResults[0].id, home_id], (err6) => {
                      if (err6) return res.status(500).json({ error: "Database error" });
                      res.json({ success: true, message: "ลบผู้พักอาศัยสำเร็จ" });
                    });
                  } else {
                    res.json({ success: true, message: "ลบผู้พักอาศัยสำเร็จ" });
                  }
                });
              } else {
                res.json({ success: true, message: "ลบผู้พักอาศัยสำเร็จ" });
              }
            });
          });
        }
      );
    }
  );
});
// ดึง guest ทั้งหมด
app.get("/api/guests", (req, res) => {
  db.query(
    `SELECT guest.*, ranks.name as rank, home_types.name as hType, home.Address 
     FROM guest 
     LEFT JOIN ranks ON guest.rank_id = ranks.id
     LEFT JOIN home ON guest.home_id = home.home_id
     LEFT JOIN home_types ON home.home_type_id = home_types.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// ดึง guest เฉพาะบ้านพัก (JOIN ranks และ home_types)
app.get("/api/guests/home/:home_id", (req, res) => {
  db.query(
    `SELECT guest.*, ranks.name as rank, home_types.name as hType, home.Address 
     FROM guest 
     LEFT JOIN ranks ON guest.rank_id = ranks.id
     LEFT JOIN home ON guest.home_id = home.home_id
     LEFT JOIN home_types ON home.home_type_id = home_types.id
     WHERE guest.home_id = ?`,
    [req.params.home_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// ปรับ API /api/guests/search ให้รองรับ type
app.get("/api/guests/search", (req, res) => {
  const { q, type } = req.query;
  let sql = `
    SELECT guest.*, ranks.name as rank, home_types.name as hType, home.Address 
    FROM guest 
    LEFT JOIN ranks ON guest.rank_id = ranks.id
    LEFT JOIN home ON guest.home_id = home.home_id
    LEFT JOIN home_types ON home.home_type_id = home_types.id
    WHERE 1
  `;
  const params = [];
  if (q) {
    sql += " AND (guest.name LIKE ? OR guest.lname LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (type) {
    sql += " AND home_types.name = ?";
    params.push(type);
  }
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ดึง guest รายคน
app.get("/api/guests/:id", (req, res) => {
  db.query(
    `SELECT id, rank_id, name, lname, dob, phone, job_phone FROM guest WHERE id = ?`,
    [req.params.id],
    (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(results[0]);
    }
  );
});

// แก้ไขข้อมูล guest
app.put("/api/guests/:id", (req, res) => {
  const { rank_id, name, lname, phone, job_phone } = req.body;
  
  // ดึงข้อมูลเดิมก่อนแก้ไข
  db.query(
    `SELECT guest.*, ranks.name as old_rank_name, home.Address 
     FROM guest 
     LEFT JOIN ranks ON guest.rank_id = ranks.id
     LEFT JOIN home ON guest.home_id = home.home_id
     WHERE guest.id = ?`,
    [req.params.id],
    (err, oldData) => {
      if (err || oldData.length === 0) {
        return res.status(404).json({ error: "Guest not found" });
      }
      
      const oldGuest = oldData[0];
      
      // อัพเดทข้อมูล
      db.query(
        "UPDATE guest SET rank_id=?, name=?, lname=?, phone=?, job_phone=? WHERE id=?",
        [rank_id, name, lname, phone, job_phone, req.params.id],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Database error" });
          
          // ดึงข้อมูลใหม่หลังแก้ไข
          db.query(
            `SELECT guest.*, ranks.name as new_rank_name, home.Address 
             FROM guest 
             LEFT JOIN ranks ON guest.rank_id = ranks.id
             LEFT JOIN home ON guest.home_id = home.home_id
             WHERE guest.id = ?`,
            [req.params.id],
            (err2, newData) => {
              if (err2 || newData.length === 0) {
                return res.json({ success: true });
              }
              
              const newGuest = newData[0];
              
              // สร้างรายละเอียดการเปลี่ยนแปลง
              let changes = [];
              
              if (oldGuest.old_rank_name !== newGuest.new_rank_name) {
                changes.push(`ยศ: ${oldGuest.old_rank_name} → ${newGuest.new_rank_name}`);
              }
              
              if (oldGuest.name !== newGuest.name) {
                changes.push(`ชื่อ: ${oldGuest.name} → ${newGuest.name}`);
              }
              
              if (oldGuest.lname !== newGuest.lname) {
                changes.push(`นามสกุล: ${oldGuest.lname} → ${newGuest.lname}`);
              }
              
              if (oldGuest.phone !== newGuest.phone) {
                changes.push(`เบอร์โทร: ${oldGuest.phone} → ${newGuest.phone}`);
              }
              
              if (oldGuest.job_phone !== newGuest.job_phone) {
                changes.push(`เบอร์งาน: ${oldGuest.job_phone} → ${newGuest.job_phone}`);
              }
              
              const detail = changes.length > 0 
                ? `แก้ไขข้อมูลผู้พักอาศัย ${newGuest.name} ${newGuest.lname} (บ้านเลขที่ ${newGuest.Address}): ${changes.join(', ')}`
                : `แก้ไขข้อมูลผู้พักอาศัย ${newGuest.name} ${newGuest.lname} (บ้านเลขที่ ${newGuest.Address}) (ไม่มีการเปลี่ยนแปลง)`;
              
              // บันทึก audit log
              db.query(
                "INSERT INTO guest_logs (guest_id, home_id, action, detail) VALUES (?, ?, ?, ?)",
                [req.params.id, newGuest.home_id, "edit", detail],
                (logErr) => {
                  if (logErr) {
                    console.error("Error logging guest edit:", logErr);
                  } else {
                    console.log("Guest edit audit log saved successfully");
                  }
                  
                  res.json({ 
                    success: true, 
                    changes: changes,
                    message: "แก้ไขข้อมูลผู้พักอาศัยสำเร็จ"
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

app.get("/api/hometypes", (req, res) => {
  db.query("SELECT name FROM home_types", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results.map(r => r.name));
  });
});

// API อัปโหลดไฟล์รูปบ้าน
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ filename: req.file.filename });
});

app.get("/api/home_types", (req, res) => {
  db.query("SELECT * FROM home_types", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.get("/api/ranks", (req, res) => {
  db.query("SELECT * FROM ranks", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ตรวจสอบว่ายศนี้พักบ้านประเภทนี้ได้หรือไม่
app.get("/api/eligibility", (req, res) => {
  const { home_type_id, rank_id } = req.query;
  db.query(
    "SELECT * FROM home_eligibility WHERE home_type_id = ? AND rank_id = ?",
    [home_type_id, rank_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ eligible: results.length > 0 });
    }
  );
});

app.get("/api/guest_logs", (req, res) => {
  db.query(
    `SELECT guest_logs.*, guest.name, guest.lname, ranks.name as rank_name, home.Address as home_name, home_types.name as home_type_name
     FROM guest_logs
     LEFT JOIN guest ON guest_logs.guest_id = guest.id
     LEFT JOIN ranks ON guest.rank_id = ranks.id
     LEFT JOIN home ON guest_logs.home_id = home.home_id
     LEFT JOIN home_types ON home.home_type_id = home_types.id
     ORDER BY guest_logs.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

app.delete("/api/guest_logs", (req, res) => {
  db.query("DELETE FROM guest_logs", err => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ success: true });
  });
});

app.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});