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

  // เพิ่มตารางใหม่สำหรับแถว
  db.query(`CREATE TABLE IF NOT EXISTS townhome_rows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    row_number INT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    max_capacity INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // เพิ่มข้อมูลแถวเริ่มต้น
  db.query(`INSERT IGNORE INTO townhome_rows (row_number, name) VALUES 
    (1, 'แถว 1'), (2, 'แถว 2'), (3, 'แถว 3'), (4, 'แถว 4'), (5, 'แถว 5'),
    (6, 'แถว 6'), (7, 'แถว 7'), (8, 'แถว 8'), (9, 'แถว 9'), (10, 'แถว 10')
  `);

  // เพิ่มคอลัมน์ row_id ในตาราง home
  db.query(`ALTER TABLE home ADD COLUMN IF NOT EXISTS row_id INT`);
  db.query(`ALTER TABLE home ADD FOREIGN KEY IF NOT EXISTS (row_id) REFERENCES townhome_rows(id)`);

  // ---------- ข้อมูลเริ่มต้น ----------
  db.query("INSERT IGNORE INTO home_types (name) VALUES ('บ้านพักแฝดพื้นที่1'), ('บ้านพักแฝดพื้นที่2'), ('บ้านพักเรือนแถว'),('แฟลตสัญญาบัตร'),('บ้านพักลูกจ้าง')", (err) => {
    if (err) console.log("Warning: Failed to insert default home_types");
    else console.log("✅ Default home_types created");
  });

  db.query("INSERT IGNORE INTO status (name) VALUES ('มีผู้พักอาศัย'), ('ไม่มีผู้พักอาศัย'), ('ปิดปรับปรุง')", (err) => {
    if (err) console.log("Warning: Failed to insert default status");
    else console.log("✅ Default status created");
  });

  // เพิ่มข้อมูลเริ่มต้นในตาราง ranks และ home_eligibility
  db.query(`INSERT IGNORE INTO ranks (name) VALUES 
    ('นาวาเอก'), ('นาวาโท'), ('นาวาตรี'), ('เรือเอก'), ('เรือโท'), ('เรือตรี'),
    ('พันเอก'), ('พันโท'), ('พันตรี'), ('ร้อยเอก'), ('ร้อยโท'), ('ร้อยตรี'),
    ('จ่าเอก'), ('จ่าโท'), ('จ่าตรี'), ('พลทหาร'), ('ลูกจ้าง'), ('ข้าราชการ')
  `);

  // ตรวจสอบว่ามีข้อมูลใน ranks แล้วหรือไม่
  db.query("SELECT COUNT(*) as count FROM ranks", (err, results) => {
    if (results && results[0].count === 0) {
      console.log("No ranks found, inserting default data...");
      db.query(`INSERT INTO ranks (name) VALUES 
        ('นาวาเอก'), ('นาวาโท'), ('นาวาตรี'), ('เรือเอก'), ('เรือโท'), ('เรือตรี'),
        ('จ่าเอก'), ('จ่าโท'), ('จ่าตรี')
      `, (err) => {
        if (err) console.log("Warning: Failed to insert default ranks");
        else console.log("✅ Default ranks created");
      });
    }
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
  const { home_type_id, Address, status, row_id } = req.body;
  const image = req.file ? req.file.filename : null;

  console.log("Received data:", { home_type_id, Address, status, row_id });

  // ตรวจสอบว่าเป็นบ้านพักเรือนแถวหรือไม่
  db.query("SELECT name FROM home_types WHERE id = ?", [home_type_id], (err, typeResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const isRowHouse = typeResults.length > 0 && typeResults[0].name === 'บ้านพักเรือนแถว';
    
    if (isRowHouse && !row_id) {
      return res.status(400).json({ message: "กรุณาเลือกแถวสำหรับบ้านพักเรือนแถว" });
    }

    // ตรวจสอบความซ้ำของหมายเลขบ้าน
    function checkDuplicateAndInsert() {
      if (isRowHouse) {
        // สำหรับบ้านพักเรือนแถว: ตรวจสอบซ้ำในแถวเดียวกัน
        const checkDuplicateSQL = `
          SELECT home_id FROM home 
          WHERE Address = ? AND row_id = ?
        `;
        
        db.query(checkDuplicateSQL, [Address, row_id], (err, duplicateResults) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }
          
          if (duplicateResults.length > 0) {
            return res.status(400).json({ 
              message: `หมายเลขบ้าน "${Address}" มีอยู่ในแถวนี้แล้ว กรุณาใช้หมายเลขอื่น` 
            });
          }
          
          // ตรวจสอบความจุของแถว
          checkCapacityAndInsert();
        });
      } else {
        // สำหรับบ้านประเภทอื่น: ตรวจสอบซ้ำทั่วไป
        const checkDuplicateSQL = `
          SELECT home_id FROM home 
          WHERE Address = ? AND home_type_id = ?
        `;
        
        db.query(checkDuplicateSQL, [Address, home_type_id], (err, duplicateResults) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }
          
          if (duplicateResults.length > 0) {
            return res.status(400).json({ 
              message: `หมายเลขบ้าน "${Address}" มีอยู่แล้ว กรุณาใช้หมายเลขอื่น` 
            });
          }
          
          // ไม่ต้องตรวจสอบความจุ สำหรับบ้านประเภทอื่น
          insertHome();
        });
      }
    }

    // ตรวจสอบความจุของแถว (เฉพาะบ้านพักเรือนแถว)
    function checkCapacityAndInsert() {
      const checkCapacitySQL = `
        SELECT 
          tr.max_capacity,
          COUNT(h.home_id) as current_count
        FROM townhome_rows tr
        LEFT JOIN home h ON tr.id = h.row_id
        WHERE tr.id = ?
        GROUP BY tr.id
      `;
      
      db.query(checkCapacitySQL, [row_id], (err, capacityResults) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        if (capacityResults.length > 0) {
          const { max_capacity, current_count } = capacityResults[0];
          if (current_count >= max_capacity) {
            return res.status(400).json({ 
              message: `แถวนี้เต็มแล้ว (${current_count}/${max_capacity})` 
            });
          }
        }
        
        insertHome();
      });
    }

    // เพิ่มบ้านลงฐานข้อมูล
    function insertHome() {
      const insertSQL = `
        INSERT INTO home (home_type_id, Address, status_id, image, row_id) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(insertSQL, [home_type_id, Address, status, image, row_id || null], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          // ตรวจสอบ MySQL duplicate entry error
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
              message: `หมายเลขบ้าน "${Address}" มีอยู่แล้ว กรุณาใช้หมายเลขอื่น` 
            });
          }
          return res.status(500).json({ error: "Database error" });
        }
        
        // ⭐ เพิ่มการบันทึก audit log หลังจากเพิ่มบ้านสำเร็จ
        const newHomeId = result.insertId;
        
        // ดึงข้อมูลประเภทบ้านและแถว (ถ้ามี) เพื่อใช้ใน log
        db.query(
          `SELECT ht.name as home_type_name, tr.name as row_name, tr.row_number
           FROM home_types ht
           LEFT JOIN townhome_rows tr ON tr.id = ?
           WHERE ht.id = ?`,
          [row_id || null, home_type_id],
          (detailErr, detailResults) => {
            let logDetail = "";
            
            if (detailResults && detailResults.length > 0) {
              const homeType = detailResults[0].home_type_name;
              const rowInfo = detailResults[0].row_name || 
                             (detailResults[0].row_number ? `แถว ${detailResults[0].row_number}` : '');
              
              if (homeType === 'บ้านพักเรือนแถว' && rowInfo) {
                logDetail = `เพิ่มบ้านเลขที่ ${Address} ประเภท ${homeType} ${rowInfo}`;
              } else {
                logDetail = `เพิ่มบ้านเลขที่ ${Address} ประเภท ${homeType}`;
              }
            } else {
              logDetail = `เพิ่มบ้านเลขที่ ${Address}`;
            }
            
            // บันทึก audit log
            const logSQL = `
              INSERT INTO guest_logs (guest_id, home_id, action, detail, created_at)
              VALUES (NULL, ?, 'add_home', ?, NOW())
            `;
            
            db.query(logSQL, [newHomeId, logDetail], (logErr) => {
              if (logErr) {
                console.error("Error logging home addition:", logErr);
              } else {
                console.log("Home addition audit log saved successfully");
              }
              
              // ส่งผลลัพธ์กลับ
              console.log("Home inserted successfully:", newHomeId);
              res.json({ 
                success: true, 
                message: "บันทึกข้อมูลสำเร็จ",
                home_id: newHomeId 
              });
            });
          }
        );
      });
    }

    // เริ่มตรวจสอบ
    checkDuplicateAndInsert();
  });
});

// API ดึงข้อมูลแถว - แก้ไขให้ใช้ข้อมูลสำรองถ้าไม่มีข้อมูล
app.get("/api/townhome-rows", (req, res) => {
  const sql = `
    SELECT 
      tr.*,
      COUNT(h.home_id) as home_count
    FROM townhome_rows tr
    LEFT JOIN home h ON tr.id = h.row_id 
    WHERE tr.is_active = TRUE
    GROUP BY tr.id
    ORDER BY tr.row_number
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      // ส่งข้อมูลสำรองถ้า error
      const fallbackRows = [];
      for (let i = 1; i <= 10; i++) {
        fallbackRows.push({
          id: i,
          row_number: i,
          name: `แถว ${i}`,
          max_capacity: 10,
          home_count: 0
        });
      }
      return res.json(fallbackRows);
    }
    
    res.json(results);
  });
});

// API ดึงบ้านตามแถว
app.get("/api/homes/row/:row_id", (req, res) => {
  const sql = `
    SELECT 
      h.*,
      ht.name as hType,
      s.name as status,
      tr.name as row_name,
      tr.row_number,
      COUNT(g.id) as guest_count
    FROM home h
    LEFT JOIN home_types ht ON h.home_type_id = ht.id
    LEFT JOIN status s ON h.status_id = s.id
    LEFT JOIN townhome_rows tr ON h.row_id = tr.id
    LEFT JOIN guest g ON h.home_id = g.home_id
    WHERE h.row_id = ?
    GROUP BY h.home_id
    ORDER BY h.Address
  `;
  
  db.query(sql, [req.params.row_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
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

// แก้ไข API สำหรับดึง guest logs
app.get("/api/guest_logs", (req, res) => {
  const query = `
    SELECT 
      gl.*,
      COALESCE(gl.rank_name, r.name) as rank_name,
      COALESCE(gl.name, g.name) as name,
      COALESCE(gl.lname, g.lname) as lname,
      COALESCE(gl.home_address, h.Address) as home_address,
      COALESCE(gl.home_type_name, ht.name) as home_type_name,
      tr.name as row_name,
      tr.row_number
    FROM guest_logs gl
    LEFT JOIN guest g ON gl.guest_id = g.id
    LEFT JOIN ranks r ON g.rank_id = r.id
    LEFT JOIN home h ON gl.home_id = h.home_id
    LEFT JOIN home_types ht ON h.home_type_id = ht.id
    LEFT JOIN townhome_rows tr ON h.row_id = tr.id  -- เพิ่มบรรทัดนี้
    ORDER BY gl.created_at DESC
    LIMIT 50
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching guest logs:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
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

// เพิ่ม API สำหรับดูคนใกล้เกษียณ
app.get("/api/retirement", (req, res) => {
  const sql = `
    SELECT 
      guest.*,
      ranks.name as rank_name,
      home.Address,
      home_types.name as home_type_name,
      DATEDIFF(DATE_ADD(dob, INTERVAL 60 YEAR), CURDATE()) as days_to_retirement,
      DATE_ADD(dob, INTERVAL 60 YEAR) as retirement_date,
      TIMESTAMPDIFF(YEAR, dob, CURDATE()) as current_age
    FROM guest 
    LEFT JOIN ranks ON guest.rank_id = ranks.id
    LEFT JOIN home ON guest.home_id = home.home_id
    LEFT JOIN home_types ON home.home_type_id = home_types.id
    WHERE guest.dob IS NOT NULL
    AND DATEDIFF(DATE_ADD(dob, INTERVAL 60 YEAR), CURDATE()) BETWEEN 0 AND 60
    ORDER BY days_to_retirement ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// เพิ่ม API สำหรับเพิ่มผู้พักอาศัย
app.post("/api/guests", (req, res) => {
  const { home_id, rank_id, name, lname, dob, pos, income, phone, job_phone } = req.body;
  
  console.log("Adding guest:", req.body); // debug
  
  // ตรวจสอบว่ามีบ้านหรือไม่
  db.query("SELECT Address FROM home WHERE home_id = ?", [home_id], (err, homeResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (homeResults.length === 0) {
      return res.status(404).json({ message: "ไม่พบบ้านที่ระบุ" });
    }
    
    const homeAddress = homeResults[0].Address;
    
    // เพิ่มผู้พักอาศัย
    const sql = `
      INSERT INTO guest (home_id, rank_id, name, lname, dob, pos, income, phone, job_phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [home_id, rank_id || null, name, lname, dob || null, pos, income || 0, phone, job_phone], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error: " + err.message });
      }
      
      // อัปเดตสถานะบ้านเป็น "มีผู้พักอาศัย" (status_id = 1)
      db.query("UPDATE home SET status_id = 1 WHERE home_id = ?", [home_id], (updateErr) => {
        if (updateErr) {
          console.error("Error updating home status:", updateErr);
        }
        
        // บันทึก log
        const logDetail = `เพิ่มผู้พักอาศัย: ${name} ${lname} เข้าพักบ้านเลขที่ ${homeAddress}`;
        db.query(
          "INSERT INTO guest_logs (guest_id, home_id, action, detail) VALUES (?, ?, ?, ?)",
          [result.insertId, home_id, "add", logDetail],
          (logErr) => {
            if (logErr) {
              console.error("Error logging guest addition:", logErr);
            }
            
            res.json({ 
              success: true, 
              message: "เพิ่มผู้พักอาศัยสำเร็จ",
              guest_id: result.insertId 
            });
          }
        );
      });
    });
  });
});

// API ลบผู้พักอาศัย
app.delete("/api/guests/:id", (req, res) => {
  const guestId = req.params.id;
  
  // ดึงข้อมูลผู้พักก่อนลบ
  db.query(
    `SELECT guest.*, home.Address, home.home_id
     FROM guest 
     LEFT JOIN home ON guest.home_id = home.home_id
     WHERE guest.id = ?`,
    [guestId],
    (err, guestResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      if (guestResults.length === 0) {
        return res.status(404).json({ message: "ไม่พบผู้พักอาศัย" });
      }
      
      const guest = guestResults[0];
      const homeId = guest.home_id;
      
      // ลบผู้พักอาศัย
      db.query("DELETE FROM guest WHERE id = ?", [guestId], (deleteErr) => {
        if (deleteErr) {
          console.error("Database error:", deleteErr);
          return res.status(500).json({ error: "Database error" });
        }
        
        // ตรวจสอบว่ายังมีผู้พักอาศัยในบ้านหลังหรือไม่
        db.query("SELECT COUNT(*) as count FROM guest WHERE home_id = ?", [homeId], (countErr, countResults) => {
          if (countErr) {
            console.error("Error counting guests:", countErr);
          } else {
            const guestCount = countResults[0].count;
            
            // ถ้าไม่มีผู้พักแล้ว ให้เปลี่ยนสถานะเป็น "ไม่มีผู้พักอาศัย" (status_id = 2)
            if (guestCount === 0) {
              db.query("UPDATE home SET status_id = 2 WHERE home_id = ?", [homeId], (updateErr) => {
                if (updateErr) {
                  console.error("Error updating home status:", updateErr);
                }
              });
            }
          }
          
          // บันทึก log
          const logDetail = `ลบผู้พักอาศัย: ${guest.name} ${guest.lname} จากบ้านเลขที่ ${guest.Address}`;
          db.query(
            "INSERT INTO guest_logs (guest_id, home_id, action, detail) VALUES (?, ?, ?, ?)",
            [guestId, homeId, "delete", logDetail],
            (logErr) => {
              if (logErr) {
                console.error("Error logging guest deletion:", logErr);
              }
              
              res.json({ 
                success: true, 
                message: "ลบผู้พักอาศัยสำเร็จ" 
              });
            }
          );
        });
      });
    }
  );
});