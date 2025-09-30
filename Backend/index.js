require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// เพิ่ม JWT
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "your-secret-key";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiRoutes = require("./API/Api");
app.use("/api", apiRoutes);

// *** multer config ***
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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

// Database connection และการสร้างตาราง (เก็บเหมือนเดิม)
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

    // สร้างตาราง home_types
db.query(`
  CREATE TABLE IF NOT EXISTS home_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    max_capacity INT,
    subunit_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS home_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_type_id INT,
    unit_number INT,
    unit_name VARCHAR(255),
    subunit_id INT,  -- เพิ่มตรงนี้
    UNIQUE KEY unique_unit (home_type_id, unit_number),
    FOREIGN KEY (home_type_id) REFERENCES home_types(id)
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS subunit_home (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    subunit_type VARCHAR(50) NOT NULL
  )
`);

db.query(`ALTER TABLE home_types ADD COLUMN IF NOT EXISTS subunit_type VARCHAR(50)`, (err) => {
  if (err && !err.message.includes('Duplicate column')) {
    console.error("Error adding subunit_type column:", err);
  }
});

db.query(`
  INSERT IGNORE INTO home_types (name, description, subunit_type, max_capacity)
  VALUES
    ('บ้านพักแฝด', 'บ้านพักแฝด', 'พื้นที่', 2),
    ('บ้านพักเรือนแถว', 'บ้านพักเรือนแถว', 'แถว', 14),
    ('แฟลตสัญญาบัตร', 'แฟลตสัญญาบัตร', 'ชั้น', 4),
    ('บ้านพักลูกจ้าง', 'บ้านพักลูกจ้าง', 'อาคาร', 2)
`, (err) => {
  if (err) console.log("Warning: Failed to insert default home_types with subunit_type");
  else console.log("✅ Default home_types with subunit_type created");
});

db.query(`
  INSERT IGNORE INTO subunit_home (name, subunit_type)
  VALUES
    ('พื้นที่', 'พื้นที่'),
    ('แถว', 'แถว'),
    ('ชั้น', 'ชั้น'),
    ('อาคาร', 'อาคาร')
`);


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
    subunit_id INT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_type_id) REFERENCES home_types(id),
    FOREIGN KEY (status_id) REFERENCES status(id),
    FOREIGN KEY (subunit_id) REFERENCES subunit_home(id)
  )`);

  db.query(`ALTER TABLE home ADD COLUMN IF NOT EXISTS home_unit_id INT NULL`, (err) => {
  if (err && !err.message.includes('Duplicate column')) {
    console.error("Error adding home_unit_id column:", err);
  } else {
    console.log("✅ home_unit_id column ready");
  }
});

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
  // ---------- ข้อมูลเริ่มต้น ----------
  db.query("INSERT IGNORE INTO home_types (name) VALUES ('บ้านพักแฝด'), ('บ้านพักเรือนแถว'),('แฟลตสัญญาบัตร'),('บ้านพักลูกจ้าง')", (err) => {
    if (err) console.log("Warning: Failed to insert default home_types");
    else console.log("✅ Default home_types created");
  });

  db.query("INSERT IGNORE INTO status (name) VALUES ('มีผู้พักอาศัย'), ('ไม่มีผู้พักอาศัย'), ('ปิดปรับปรุง')", (err) => {
    if (err) console.log("Warning: Failed to insert default status");
    else console.log("✅ Default status created");
  });

  // เพิ่มข้อมูลเริ่มต้นในตาราง ranks และ home_eligibility
  db.query(`INSERT IGNORE INTO ranks (name) VALUES 
    ('นาวาเอก'), ('นาวาโท'), ('นาวาตรี'), ('เรือเอก'), ('เรือโท'), ('เรือตรี'),('พันจ่าเอก'), ('พันจ่าโท'), ('พันจ่าตรี'),
    ('จ่าเอก'), ('จ่าโท'), ('จ่าตรี'),('นาย'),('นาง'),('นางสาว')
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

  db.query(`ALTER TABLE home_types ADD COLUMN IF NOT EXISTS description TEXT`, (err) => {
    if (err && !err.message.includes('Duplicate column')) {
      console.error("Error adding description column:", err);
    }
  });


  // เพิ่มหลังบรรทัด 130 (หลังสร้างตาราง guest)
  db.query(`ALTER TABLE guest ADD COLUMN IF NOT EXISTS is_right_holder BOOLEAN DEFAULT FALSE`, (err) => {
    if (err && !err.message.includes('Duplicate column')) {
      console.error("Error adding is_right_holder column:", err);
    } else {
      console.log("✅ is_right_holder column ready");
    }
  });

  // เพิ่มหลังบรรทัดที่สร้างตาราง guest
  db.query(`ALTER TABLE guest MODIFY COLUMN rank_id INT NULL`, (err) => {
    if (err && !err.message.includes('rank_id')) {
      console.error("Error making rank_id nullable:", err);
    } else {
      console.log("✅ rank_id column is now nullable");
    }
  });

  // เพิ่มคอลัมน์สำหรับเก็บคำนำหน้าทั่วไป
  db.query(`ALTER TABLE guest ADD COLUMN IF NOT EXISTS title VARCHAR(20)`, (err) => {
    if (err && !err.message.includes('Duplicate column')) {
      console.error("Error adding title column:", err);  
    } else {
      console.log("✅ title column ready");
    }
  });

  // เพิ่มข้อมูลเริ่มต้นใน roles
  db.query("INSERT IGNORE INTO roles (id, name) VALUES (1, 'admin'), (2, 'user')", (err) => {
    if (err) console.log("Warning: Failed to insert default roles");
    else console.log("✅ Default roles created");
  });

  // สร้างผู้ใช้ admin เริ่มต้น
  db.query("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, results) => {
    if (!err && results[0].count === 0) {
      const adminPassword = bcrypt.hashSync("admin123", 10);
      db.query(
        "INSERT INTO users (username, password, role_id) VALUES ('admin', ?, 1)",
        [adminPassword],
        (insertErr) => {
          if (insertErr) {
            console.error("Error creating admin user:", insertErr);
          } else {
            console.log("✅ Admin user created (username: admin, password: admin123)");
          }
        }
      );
    }
  });


  // สร้างตาราง home_types ก่อน
db.query(`
  CREATE TABLE IF NOT EXISTS home_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    max_capacity INT,
    subunit_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// สร้างตาราง home_units ก่อน
db.query(`
  CREATE TABLE IF NOT EXISTS home_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_type_id INT,
    unit_number INT,
    unit_name VARCHAR(255),
    subunit_id INT,  -- เพิ่มตรงนี้
    UNIQUE KEY unique_unit (home_type_id, unit_number),
    FOREIGN KEY (home_type_id) REFERENCES home_types(id)
  )
`);

// ...สร้างตารางอื่นๆ...

// >>>> ย้ายโค้ดนี้มาไว้หลังจากสร้างตารางทั้งหมด <<<<
db.query("SELECT * FROM home_types", (err, types) => {
  if (err) return console.error("Error fetching home_types:", err);
  types.forEach(type => {
    if (!type.max_capacity) return;
    db.query(
      "SELECT COUNT(*) AS count FROM home_units WHERE home_type_id = ?",
      [type.id],
      (countErr, countResults) => {
        if (countErr) return;
        const currentCount = countResults[0].count;
        if (currentCount < type.max_capacity) {
          let unitInserts = [];
          for (let i = currentCount + 1; i <= type.max_capacity; i++) {
            unitInserts.push([type.id, i, `${type.subunit_type} ${i}`]);
          }
          if (unitInserts.length > 0) {
            db.query(
              "INSERT INTO home_units (home_type_id, unit_number, unit_name) VALUES ?",
              [unitInserts],
              (unitErr) => {
                if (unitErr) {
                  console.error("Error creating home_units for", type.name, unitErr);
                } else {
                  console.log(`✅ Added ${unitInserts.length} home_units for ${type.name}`);
                }
              }
            );
          }
        }
      }
    );
  });
});



  // เพิ่มคอลัมน์ image_url ในตาราง guest (หลังบรรทัด ~180)
  db.query(`ALTER TABLE guest ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)`, (err) => {
    if (err && !err.message.includes('Duplicate column')) {
      console.error("Error adding image_url column:", err);
    } else {
      console.log("✅ image_url column ready");
    }
  });

  db.query(`CREATE TABLE IF NOT EXISTS guest_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rank_id INT,
    title VARCHAR(50),
    name VARCHAR(255),
    lname VARCHAR(255),
    phone VARCHAR(20),
    total_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});


// สร้างตาราง home_types2

db.query(`
  CREATE TABLE IF NOT EXISTS subunit_home (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    subunit_type VARCHAR(50) NOT NULL   -- ชื่อที่ใช้แสดงผล เช่น พื้นที่, อาคาร
  )
`);




// Register (แก้ไขให้รับข้อมูล profile)
app.post("/api/register", (req, res) => {
  const { username, password, firstName, lastName, gender } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  db.query(
    "INSERT INTO users (username, password, role_id) VALUES (?, ?, 2)", // role_id = 2 สำหรับ user ทั่วไป
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

// Login - แก้ไขให้ใช้งานได้
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  console.log("Login attempt:", username);
  
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      console.log("User not found:", username);
      return res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    
    const user = results[0];
    console.log("User found:", user.username, "Role:", user.role_id);
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", passwordMatch);
    
    if (!passwordMatch) {
      console.log("Password mismatch for user:", username);
      return res.status(401).json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      SECRET,
      { expiresIn: "24h" }
    );
    
    console.log("Login successful for:", username);
    
    res.json({
      success: true,
      token,
      role_id: user.role_id,
      username: user.username,
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
  db.query("SELECT * FROM home_types ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
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
    SELECT h.*, ht.name as hType, s.name as status, hu.unit_name
    FROM home h
    LEFT JOIN home_types ht ON h.home_type_id = ht.id
    LEFT JOIN status s ON h.status_id = s.id
    LEFT JOIN home_units hu ON h.subunit_id = hu.id
    WHERE h.home_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Home not found" });
    res.json(results[0]);
  });
});

// API สำหรับอัพเดทบ้าน
app.put("/api/homes/:id", upload.single('image'), (req, res) => {
  const { Address, home_type_id, status_id } = req.body;
  const image = req.file ? req.file.filename : null;

  let sql = "UPDATE home SET Address = ?, home_type_id = ?, status_id = ?";
  let params = [Address, home_type_id, status_id];

  if (image) {
    sql += ", image = ?";
    params.push(image);
  }

  sql += " WHERE home_id = ?";
  params.push(req.params.id);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Home not found" });
    res.json({ success: true });
  });
});

// เก็บแค่ตัวนี้ - ลบตัวที่ซ้ำออก
app.post("/api/homes", upload.single("image"), (req, res) => {
  const { home_type_id, Address, status_id, home_unit_id } = req.body;
  const image = req.file ? req.file.filename : null;

  // ดึง subunit_id จาก home_units
  db.query(
    "SELECT subunit_id FROM home_units WHERE id = ?",
    [home_unit_id],
    (err, unitResults) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (unitResults.length === 0) {
        return res.status(400).json({ message: "ไม่พบ home_unit ที่เลือก" });
      }
      const subunit_id = unitResults[0].subunit_id;

      // ตรวจสอบบ้านซ้ำในพื้นที่เดียวกัน
      db.query(
        "SELECT home_id FROM home WHERE Address = ? AND home_type_id = ? AND subunit_id = ?",
        [Address, home_type_id, subunit_id],
        (err, duplicateResults) => {
          if (err) return res.status(500).json({ error: "Database error" });
          if (duplicateResults.length > 0) {
            return res.status(400).json({ message: `หมายเลขบ้าน "${Address}" มีอยู่แล้วในพื้นที่นี้ กรุณาใช้หมายเลขอื่น` });
          }
          db.query(
            "INSERT INTO home (home_type_id, Address, status_id, image, subunit_id, home_unit_id) VALUES (?, ?, ?, ?, ?, ?)",
            [home_type_id, Address, status_id, image, subunit_id || null, home_unit_id || null],
            (err2, result) => {
              if (err2) return res.status(500).json({ error: "Database error" });
              res.json({ success: true, home_id: result.insertId });
            }
          );
        }
      );
    }
  );
});

// ดึง guest ทั้งหมด (JOIN ranks) - แก้ไขให้รองรับ filter ผู้ถือสิทธิ
app.get("/api/guests", (req, res) => {
  const { right_holders_only } = req.query;
  
  let sql = `
    SELECT guest.*, 
           COALESCE(ranks.name, guest.title) as rank, 
           home_types.name as hType, 
           home.Address 
    FROM guest 
    LEFT JOIN ranks ON guest.rank_id = ranks.id
    LEFT JOIN home ON guest.home_id = home.home_id
    LEFT JOIN home_types ON home.home_type_id = home_types.id
  `;
  
  // เพิ่มเงื่อนไขถ้าต้องการเฉพาะผู้ถือสิทธิ
  if (right_holders_only === 'true') {
    sql += " WHERE guest.is_right_holder = TRUE";
  }
  
  sql += " ORDER BY guest.is_right_holder DESC, guest.id ASC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ปรับ API /api/guests/search ให้รองรับ type และ right_holders_only
app.get("/api/guests/search", (req, res) => {
  const { q, type, right_holders_only } = req.query;
  
  let sql = `
    SELECT guest.*, 
           COALESCE(ranks.name, guest.title) as rank, 
           home_types.name as hType, 
           home.Address 
    FROM guest 
    LEFT JOIN ranks ON guest.rank_id = ranks.id
    LEFT JOIN home ON guest.home_id = home.home_id
    LEFT JOIN home_types ON home.home_type_id = home_types.id
    WHERE 1 = 1
  `;
  
  const params = [];
  
  // เพิ่มเงื่อนไขค้นหาชื่อ
  if (q && q.trim() !== '') {
    sql += " AND (guest.name LIKE ? OR guest.lname LIKE ?)";
    params.push(`%${q.trim()}%`, `%${q.trim()}%`);
  }
  
  // เพิ่มเงื่อนไขประเภทบ้าน
  if (type && type.trim() !== '') {
    sql += " AND home_types.name = ?";
    params.push(type.trim());
  }
  
  // เพิ่มเงื่อนไขผู้ถือสิทธิ์
  if (right_holders_only === 'true') {
    sql += " AND guest.is_right_holder = TRUE";
  }
  
  sql += " ORDER BY guest.is_right_holder DESC, guest.id ASC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Home management APIs
app.get("/api/homes", (req, res) => {
  const { unit } = req.query;
  let sql = `
    SELECT 
      home.*, 
      home_types.name as hType, 
      home_types.subunit_type,
      status.name as status,
      home_units.unit_name as unit_name,
      home.home_unit_id,
      (
        SELECT COUNT(*) FROM guest WHERE guest.home_id = home.home_id
      ) AS guest_count
    FROM home
    LEFT JOIN home_types ON home.home_type_id = home_types.id
    LEFT JOIN status ON home.status_id = status.id
    LEFT JOIN home_units ON home.home_unit_id = home_units.id
  `;
  let params = [];
  if (unit) {
    sql += " WHERE home.home_unit_id = ?";
    params.push(unit);
  }
  sql += " ORDER BY home.home_id ASC";
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
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
  const homeId = req.params.id;
  // เช็คว่ามีผู้พักอาศัยอยู่หรือไม่
  db.query("SELECT * FROM guest WHERE home_id = ?", [homeId], (err, guests) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (guests.length > 0) {
      return res.status(400).json({ message: "ไม่สามารถลบได้: มีผู้พักอาศัยอยู่ในบ้านนี้" });
    }
    // ถ้าไม่มีผู้พักอาศัย ให้ลบบ้าน
    db.query("DELETE FROM home WHERE home_id = ?", [homeId], (err2, result) => {
      if (err2) return res.status(500).json({ error: "Database error" });
      res.json({ success: true });
    });
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

// แก้ไขข้อมูล guest
app.put("/api/guests/:id", (req, res) => {
  const { rank_id, name, lname, phone, job_phone, dob } = req.body; // เพิ่ม dob
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
      // อัพเดทข้อมูล (เพิ่ม dob)
      db.query(
        "UPDATE guest SET rank_id=?, name=?, lname=?, phone=?, job_phone=?, dob=? WHERE id=?",
        [rank_id, name, lname, phone, job_phone, dob, req.params.id],
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
  db.query("SELECT name FROM home_types ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results.map(r => r.name));
  });
});

// API อัปโหลดไฟล์รูปบ้าน
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    console.log("📤 Upload request received");
    console.log("File:", req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: "ไม่พบไฟล์รูปภาพ" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    console.log("✅ Image saved:", imageUrl);
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename,
      message: "อัปโหลดรูปภาพสำเร็จ" 
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" });
  }
});

app.get("/api/home_types", (req, res) => {
  const sql = `
    SELECT 
      ht.id,
      ht.name,
      ht.description,
      ht.subunit_type,
      ht.max_capacity,
      (SELECT sh.name FROM subunit_home sh WHERE sh.subunit_type = ht.subunit_type LIMIT 1) AS subunit_name
    FROM home_types ht
    ORDER BY ht.id ASC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error in /api/home_types:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/api/ranks", (req, res) => {
  // เรียงตาม ID จากมากไปน้อย
  const sql = "SELECT * FROM ranks ORDER BY id ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
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
  // เพิ่มคอลัมน์ที่จำเป็นในตาราง guest_logs ก่อน
  const alterQueries = [
    "ALTER TABLE guest_logs ADD COLUMN IF NOT EXISTS rank_name VARCHAR(50)",
    "ALTER TABLE guest_logs ADD COLUMN IF NOT EXISTS name VARCHAR(255)", 
    "ALTER TABLE guest_logs ADD COLUMN IF NOT EXISTS lname VARCHAR(255)",
    "ALTER TABLE guest_logs ADD COLUMN IF NOT EXISTS home_address VARCHAR(255)",
    "ALTER TABLE guest_logs ADD COLUMN IF NOT EXISTS home_type_name VARCHAR(255)"
  ];

  // รันคำสั่ง ALTER TABLE ทั้งหมด
  let completedAlters = 0;
  alterQueries.forEach((alterQuery, index) => {
    db.query(alterQuery, (alterErr) => {
      if (alterErr && !alterErr.message.includes('Duplicate column')) {
        console.log(`Warning: ${alterErr.message}`);
      }
      
      completedAlters++;
      if (completedAlters === alterQueries.length) {
        // หลังจาก ALTER เสร็จแล้ว ค่อย SELECT ข้อมูล
        fetchGuestLogs();
      }
    });
  });

  function fetchGuestLogs() {
    // ใช้ query ที่ง่ายขึ้น และปลอดภัยกว่า
    const query = `
      SELECT 
        gl.*,
        COALESCE(gl.rank_name, r.name, 'ไม่ระบุ') as rank_name,
        COALESCE(gl.name, g.name, 'ไม่ระบุ') as name,
        COALESCE(gl.lname, g.lname, 'ไม่ระบุ') as lname,
        COALESCE(gl.home_address, h.Address, 'ไม่ระบุ') as home_address,
        COALESCE(gl.home_type_name, ht.name, 'ไม่ระบุ') as home_type_name,
        COALESCE(tr.name, CONCAT('แถว ', tr.row_number), '') as row_name,
        COALESCE(tr.row_number, 0) as row_number
      FROM guest_logs gl
      LEFT JOIN guest g ON gl.guest_id = g.id
      LEFT JOIN ranks r ON g.rank_id = r.id  
      LEFT JOIN home h ON gl.home_id = h.home_id
      LEFT JOIN home_types ht ON h.home_type_id = ht.id
      LEFT JOIN townhome_rows tr ON h.row_id = tr.id
      ORDER BY gl.created_at DESC
      LIMIT 100
    `;
    
    console.log("🔍 Executing guest logs query...");
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("❌ Error fetching guest logs:", err);
        
        // ถ้า error ให้ลองดึงข้อมูลแบบง่ายๆ
        const simpleQuery = "SELECT * FROM guest_logs ORDER BY created_at DESC LIMIT 100";
        
        db.query(simpleQuery, (simpleErr, simpleResults) => {
          if (simpleErr) {
            console.error("❌ Simple query also failed:", simpleErr);
            return res.status(500).json({ 
              error: "Database error", 
              details: simpleErr.message 
            });
          }
          
          console.log("✅ Simple query successful, returning basic data");
          
          // เติมข้อมูลเริ่มต้น
          const processedResults = simpleResults.map(log => ({
            ...log,
            rank_name: log.rank_name || 'ไม่ระบุ',
            name: log.name || 'ไม่ระบุ',
            lname: log.lname || 'ไม่ระบุ',
            home_address: log.home_address || 'ไม่ระบุ',
            home_type_name: log.home_type_name || 'ไม่ระบุ',
            row_name: '',
            row_number: 0
          }));
          
          res.json(processedResults);
        });
        return;
      }
      
      console.log(`✅ Fetched ${results.length} guest logs successfully`);
      res.json(results);
    });
  }
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

// เพิ่ม API สำหรับดูคนใกล้เกษียณ - แก้ไข
app.get("/api/retirement", (req, res) => {
  const sql = `
    SELECT 
      guest.*,
      COALESCE(ranks.name, guest.title, 'ไม่ระบุยศ') as rank_name,
      COALESCE(home.Address, 'ไม่ระบุที่อยู่') as Address,
      COALESCE(home_types.name, 'ไม่ระบุประเภท') as home_type_name,
      townhome_rows.name as row_name,
      townhome_rows.row_number,
      twin_areas.name as twin_area_name,
      guest.dob
    FROM guest 
    LEFT JOIN ranks ON guest.rank_id = ranks.id
    LEFT JOIN home ON guest.home_id = home.home_id
    LEFT JOIN home_types ON home.home_type_id = home_types.id
    LEFT JOIN townhome_rows ON home.row_id = townhome_rows.id
    LEFT JOIN twin_areas ON home.twin_area_id = twin_areas.id
    WHERE guest.dob IS NOT NULL
    ORDER BY guest.dob ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });

    // คำนวณ retirement_date เป็น 30 กันยายน
    const processed = results.map(person => {
      const dob = new Date(person.dob);
      let retirementYear = dob.getFullYear() + 60;
      const birthMonth = dob.getMonth() + 1;
      const birthDay = dob.getDate();
      if (birthMonth > 9 || (birthMonth === 9 && birthDay > 30)) {
        retirementYear += 1;
      }
      const retirementDate = new Date(`${retirementYear}-09-30`);
      // คำนวณวันเหลือ
      const today = new Date();
      const daysToRetirement = Math.ceil((retirementDate - today) / (1000 * 60 * 60 * 24));
      // คำนวณอายุ
      const currentAge = today.getFullYear() - dob.getFullYear() - 
        (today.getMonth() + 1 < birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay) ? 1 : 0);
      return {
        ...person,
        retirement_date: retirementDate.toISOString().split('T')[0],
        days_to_retirement: daysToRetirement,
        current_age: currentAge
      };
    });
    res.json(processed);
  });
});

// เพิ่ม API สำหรับเพิ่มผู้พักอาศัย
app.post("/api/guests", (req, res) => {
  const { home_id, rank_id, name, lname, dob, pos, income, phone, job_phone, is_right_holder, image_url } = req.body;
  
  console.log("Adding guest:", req.body);
  
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
    
    // ตรวจสอบผู้ถือสิทธิ (ถ้าเป็นผู้ถือสิทธิ)
    if (is_right_holder) {
      db.query("SELECT COUNT(*) as count FROM guest WHERE home_id = ? AND is_right_holder = TRUE", [home_id], (countErr, countResults) => {
        if (countErr) {
          console.error("Database error:", countErr);
          return res.status(500).json({ error: "Database error" });
        }
        
        if (countResults[0].count > 0) {
          return res.status(400).json({ error: "บ้านนี้มีผู้ถือสิทธิแล้ว ไม่สามารถเพิ่มผู้ถือสิทธิใหม่ได้" });
        }
        
        insertGuest();
      });
    } else {
      insertGuest();
    }
    
    function insertGuest() {
      // แยกการจัดการ rank_id และ title
      let finalRankId = null;
      let title = null;
      
      // ถ้าเป็นตัวเลข = ยศทหาร (ผู้ถือสิทธิ)
      if (!isNaN(rank_id) && rank_id !== "" && rank_id !== null) {
        finalRankId = rank_id;
      } 
      // ถ้าเป็น string = คำนำหน้าทั่วไป (สมาชิกครอบครัว)
      else if (rank_id && typeof rank_id === 'string') {
        const titleMap = {
          'mr': 'นาย',
          'mrs': 'นาง', 
          'miss': 'นางสาว',
          'master': 'เด็กชาย',
          'child': 'เด็กหญิง'
        };
        title = titleMap[rank_id] || rank_id;
      }
      
      const sql = `
        INSERT INTO guest (home_id, rank_id, title, name, lname, dob, pos, income, phone, job_phone, is_right_holder, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.query(sql, [
        home_id, 
        finalRankId, 
        title,
        name, 
        lname, 
        dob || null, 
        pos, 
        income || 0, 
        phone, 
        job_phone, 
        is_right_holder || false,
        image_url || null  // เพิ่มบรรทัดนี้
      ], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        // อัปเดตสถานะบ้านเป็น "มีผู้พักอาศัย" (status_id = 1)
        db.query("UPDATE home SET status_id = 1 WHERE home_id = ?", [home_id], (updateErr) => {
          if (updateErr) {
            console.error("Error updating home status:", updateErr);
          }
          
          // บันทึก log
          const statusText = is_right_holder ? "ผู้ถือสิทธิ" : "สมาชิกครอบครัว";
          const displayRank = title || "ยศทหาร";
          const logDetail = `เพิ่มผู้พักอาศัย: ${displayRank} ${name} ${lname} (${statusText}) เข้าพักบ้านเลขที่ ${homeAddress}`;
          
          db.query(
            "INSERT INTO guest_logs (guest_id, home_id, action, detail, created_at) VALUES (?, ?, ?, ?, NOW())",
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
    }
  });
});

// API ลบผู้พักอาศัย
app.delete("/api/guests/:id", (req, res) => {
  const guestId = req.params.id;
  
  console.log("🗑️ Attempting to delete guest ID:", guestId);
  
  if (!guestId || isNaN(guestId)) {
    console.error("❌ Invalid guest ID:", guestId);
    return res.status(400).json({ message: "ID ของผู้พักอาศัยไม่ถูกต้อง" });
  }
  
  // 🔄 เริ่ม Transaction เพื่อลบข้อมูลที่เกี่ยวข้องทั้งหมด
  db.beginTransaction((transErr) => {
    if (transErr) {
      console.error("❌ Transaction error:", transErr);
      return res.status(500).json({ 
        error: "เกิดข้อผิดพลาดในการเริ่ม transaction",
        details: transErr.message 
      });
    }
    
    // ขั้นตอนที่ 1: ดึงข้อมูลผู้พักก่อนลบ
    const getGuestSql = `
      SELECT guest.*, 
             COALESCE(ranks.name, guest.title) as rank_display,
             home.Address, 
             home.home_id,
             home_types.name as home_type
      FROM guest 
      LEFT JOIN ranks ON guest.rank_id = ranks.id
      LEFT JOIN home ON guest.home_id = home.home_id
      LEFT JOIN home_types ON home.home_type_id = home_types.id
      WHERE guest.id = ?
    `;
    
    db.query(getGuestSql, [guestId], (err, guestResults) => {
      if (err) {
        console.error("❌ Database error fetching guest:", err);
        return db.rollback(() => {
          res.status(500).json({ 
            error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้พักอาศัย",
            details: err.message 
          });
        });
      }
      
      if (guestResults.length === 0) {
        console.log("⚠️ Guest not found:", guestId);
        return db.rollback(() => {
          res.status(404).json({ message: "ไม่พบผู้พักอาศัย" });
        });
      }
      
      const guest = guestResults[0];
      const homeId = guest.home_id;
      
      console.log("👤 Found guest:", guest.name, guest.lname, "in home:", guest.Address);
      
      // ขั้นตอนที่ 2: ลบข้อมูลจาก guest_logs ที่เกี่ยวข้องก่อน (ถ้ามี)
      const deleteLogsSql = "DELETE FROM guest_logs WHERE guest_id = ?";
      
      db.query(deleteLogsSql, [guestId], (logDeleteErr, logDeleteResult) => {
        if (logDeleteErr) {
          console.error("❌ Error deleting guest logs:", logDeleteErr);
          return db.rollback(() => {
            res.status(500).json({ 
              error: "เกิดข้อผิดพลาดในการลบ log ของผู้พักอาศัย",
              details: logDeleteErr.message 
            });
          });
        }
        
        console.log("✅ Deleted guest logs:", logDeleteResult.affectedRows, "rows");
        
        // ขั้นตอนที่ 3: ลบผู้พักอาศัย
        const deleteGuestSql = "DELETE FROM guest WHERE id = ?";
        
        db.query(deleteGuestSql, [guestId], (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.error("❌ Database error deleting guest:", deleteErr);
            return db.rollback(() => {
              res.status(500).json({ 
                error: "เกิดข้อผิดพลาดในการลบผู้พักอาศัย",
                details: deleteErr.message 
              });
            });
          }
          
          if (deleteResult.affectedRows === 0) {
            console.log("⚠️ No rows affected - guest might not exist:", guestId);
            return db.rollback(() => {
              res.status(404).json({ message: "ไม่พบผู้พักอาศัยที่ต้องการลบ" });
            });
          }
          
          console.log("✅ Guest deleted successfully:", deleteResult.affectedRows, "row(s) affected");
          
          // ขั้นตอนที่ 4: เพิ่ม log การลบ (log ใหม่)
          const logDetail = `ลบผู้พักอาศัย: ${guest.rank_display || ''} ${guest.name} ${guest.lname} จากบ้านเลขที่ ${guest.Address} (${guest.home_type || ''})`;
          
          const insertNewLogSql = `
            INSERT INTO guest_logs (
              guest_id, 
              home_id, 
              action, 
              detail,
              rank_name,
              name,
              lname,
              home_address,
              home_type_name,
              created_at
            ) VALUES (NULL, ?, 'delete', ?, ?, ?, ?, ?, ?, NOW())
          `;
          
          db.query(insertNewLogSql, [
            homeId,
            logDetail,
            guest.rank_display || null,
            guest.name,
            guest.lname,
            guest.Address,
            guest.home_type
          ], (newLogErr) => {
            if (newLogErr) {
              console.error("⚠️ Error creating new log (continuing anyway):", newLogErr);
            } else {
              console.log("✅ New deletion log created successfully");
            }
            
            // ขั้นตอนที่ 5: ตรวจสอบจำนวนผู้พักที่เหลือในบ้าน
            if (homeId) {
              db.query("SELECT COUNT(*) as count FROM guest WHERE home_id = ?", [homeId], (countErr, countResults) => {
                if (countErr) {
                  console.error("⚠️ Error counting remaining guests (continuing anyway):", countErr);
                } else {
                  const guestCount = countResults[0].count;
                  console.log(`📊 Remaining guests in home ${homeId}:`, guestCount);
                  
                  // ถ้าไม่มีผู้พักแล้ว ให้เปลี่ยนสถานะเป็น "ไม่มีผู้พักอาศัย" (status_id = 2)
                  if (guestCount === 0) {
                    db.query("UPDATE home SET status_id = 2 WHERE home_id = ?", [homeId], (updateErr) => {
                      if (updateErr) {
                        console.error("⚠️ Error updating home status (continuing anyway):", updateErr);
                      } else {
                        console.log("✅ Home status updated to 'vacant'");
                      }
                      
                      // ขั้นตอนสุดท้าย: Commit transaction
                      db.commit((commitErr) => {
                        if (commitErr) {
                          console.error("❌ Commit error:", commitErr);
                          return db.rollback(() => {
                            res.status(500).json({ 
                              error: "เกิดข้อผิดพลาดในการ commit transaction",
                              details: commitErr.message 
                            });
                          });
                        }
                        
                        console.log("✅ Transaction committed successfully");
                        
                        // ส่งผลลัพธ์สำเร็จ
                        res.json({ 
                          success: true, 
                          message: "ลบผู้พักอาศัยสำเร็จ",
                          deletedGuest: {
                            id: guestId,
                            name: guest.name,
                            lname: guest.lname
                          },
                          logsDeleted: logDeleteResult.affectedRows
                        });
                      });
                    });
                  } else {
                    // ขั้นตอนสุดท้าย: Commit transaction (กรณียังมีผู้พักอยู่)
                    db.commit((commitErr) => {
                      if (commitErr) {
                        console.error("❌ Commit error:", commitErr);
                        return db.rollback(() => {
                          res.status(500).json({ 
                            error: "เกิดข้อผิดพลาดในการ commit transaction",
                            details: commitErr.message 
                          });
                        });
                      }
                      
                      console.log("✅ Transaction committed successfully");
                      
                      // ส่งผลลัพธ์สำเร็จ
                      res.json({ 
                        success: true, 
                        message: "ลบผู้พักอาศัยสำเร็จ",
                        deletedGuest: {
                          id: guestId,
                          name: guest.name,
                          lname: guest.lname
                        },
                        logsDeleted: logDeleteResult.affectedRows
                      });
                    });
                  }
                }
              });
            } else {
              // ขั้นตอนสุดท้าย: Commit transaction (กรณีไม่มี homeId)
              db.commit((commitErr) => {
                if (commitErr) {
                  console.error("❌ Commit error:", commitErr);
                  return db.rollback(() => {
                    res.status(500).json({ 
                      error: "เกิดข้อผิดพลาดในการ commit transaction",
                      details: commitErr.message 
                    });
                  });
                }
                
                console.log("✅ Transaction committed successfully");
                
                // ส่งผลลัพธ์สำเร็จ
                res.json({ 
                  success: true, 
                  message: "ลบผู้พักอาศัยสำเร็จ",
                  deletedGuest: {
                    id: guestId,
                    name: guest.name,
                    lname: guest.lname
                  },
                  logsDeleted: logDeleteResult.affectedRows
                });
              });
            }
          });
        });
      });
    });
  });
});

// เพิ่ม API สำหรับประเภทบ้าน
app.post("/api/home_types", (req, res) => {
  const { name, description, subunit_type, max_capacity } = req.body;
  db.query(
    "INSERT INTO home_types (name, description, subunit_type, max_capacity) VALUES (?, ?, ?, ?)",
    [name, description, subunit_type, max_capacity],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // หลังจากเพิ่ม home_type แล้ว สร้าง home_unit ตาม max_capacity
      const home_type_id = result.insertId;
      const capacity = parseInt(max_capacity, 10);
      if (capacity && capacity > 0) {
        let units = [];
        for (let i = 1; i <= capacity; i++) {
          units.push([home_type_id, i, `${subunit_type} ${i}`]);
        }
        db.query(
          "INSERT INTO home_units (home_type_id, unit_number, unit_name) VALUES ?",
          [units],
          (unitErr) => {
            if (unitErr) {
              console.error("Error creating home_units for home_type", name, unitErr);
              // ยังตอบ success ได้ แต่แจ้งเตือน
            }
            res.json({ success: true, id: home_type_id });
          }
        );
      } else {
        res.json({ success: true, id: home_type_id });
      }
    }
  );
});



app.delete("/api/home_types/:id", (req, res) => {
  const { id } = req.params;

  // ดึงข้อมูลประเภทบ้าน
  db.query("SELECT name, subunit_type FROM home_types WHERE id = ?", [id], (typeErr, typeResults) => {
    if (typeErr) return res.status(500).json({ error: "Database error" });
    if (typeResults.length === 0) return res.status(404).json({ error: "ไม่พบประเภทบ้าน" });

    // ลบบ้านที่ใช้ประเภทนี้ก่อน
    db.query("DELETE FROM home WHERE home_type_id = ?", [id], (delHomeErr) => {
      if (delHomeErr) return res.status(500).json({ error: "Database error" });

      // ลบ home_units ที่เกี่ยวข้องกับประเภทบ้านนี้
      db.query("DELETE FROM home_units WHERE home_type_id = ?", [id], (delUnitErr) => {
        if (delUnitErr) return res.status(500).json({ error: "Database error" });

        // ลบประเภทบ้าน
        db.query("DELETE FROM home_types WHERE id = ?", [id], (deleteErr, result) => {
          if (deleteErr) return res.status(500).json({ error: "Database error" });
          if (result.affectedRows === 0) return res.status(404).json({ error: "ไม่พบประเภทบ้าน" });
          res.json({ success: true, message: "ลบประเภทบ้านและ home_units ที่เกี่ยวข้องสำเร็จ" });
        });
      });
    });
  });
});

// เพิ่ม API endpoint สำหรับอัปโหลดรูปภาพ
app.post("/api/upload", upload.single('image'), (req, res) => {
  try {
    console.log("📤 Upload request received");
    console.log("File:", req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: "ไม่พบไฟล์รูปภาพ" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    console.log("✅ Image saved:", imageUrl);
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename,
      message: "อัปโหลดรูปภาพสำเร็จ" 
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" });
  }
});

// API สำหรับดึงยศที่สามารถเข้าพได้ตามประเภทบ้าน
app.get("/api/eligible-ranks/:home_id", (req, res) => {
  const { home_id } = req.params;
  
  const sql = `
    SELECT DISTINCT r.id, r.name
    FROM ranks r
    INNER JOIN home_eligibility he ON r.id = he.rank_id
    INNER JOIN home_types ht ON he.home_type_id = ht.id
    INNER JOIN home h ON ht.id = h.home_type_id
    WHERE h.home_id = ?
    ORDER BY r.id ASC
   `;
  
  db.query(sql, [home_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    console.log(`✅ Eligible ranks for home ${home_id}:`, results.length);
    
    // ถ้าไม่มีข้อมูลใน home_eligibility ให้ส่งยศทั้งหมด (fallback)
    if (results.length === 0) {
      console.log("⚠️ No eligibility rules found, returning all ranks");
      db.query("SELECT * FROM ranks ORDER BY id ASC", (err2, allRanks) => {
        if (err2) {
          console.error("Database error:", err2);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(allRanks);
      });
    } else {
      res.json(results);
    }
  });
});

// เพิ่ม guest ใหม่ - แก้ไขให้ตรวจสอบและแปลงปี
app.post("/api/guests", (req, res) => {
  const { 
    home_id, 
    name, 
    lname, 
    rank_id, 
    title,  // ✅ เพิ่มบรรทัดนี้
    phone, 
    id_card, 
    is_right_holder,
    dob,
    pos,
    income,
    job_phone,
    image_url
  } = req.body;

  console.log("📝 Received guest data:", { 
    name, lname, rank_id, title, dob, is_right_holder 
  });

  // ✅ ตรวจสอบและแปลงปี ถ้าจำเป็น
  let convertedDob = null;
  if (dob) {
    const dobDate = new Date(dob);
    const year = dobDate.getFullYear();
    
    console.log(`📅 Processing DOB: ${dob}, Year: ${year}`);
    
    // ถ้าปีมากกว่า 2100 ถือว่าเป็น พ.ศ. ให้แปลงเป็น ค.ศ.
    if (year > 2100) {
      const christianYear = year - 543;
      dobDate.setFullYear(christianYear);
      convertedDob = dobDate.toISOString().split('T')[0];
      console.log(`🔄 Converting Buddhist year ${year} to Christian year ${christianYear}: ${convertedDob}`);
    } else {
      convertedDob = dob;
      console.log(`✅ Date is already in Christian era: ${convertedDob}`);
    }
  } else {
    console.log("⚠️ No DOB provided");
  }

  // ✅ จัดการ rank_id และ title
  let finalRankId = null;
  let finalTitle = null;

  if (is_right_holder) {
    // ผู้ถือสิทธิ - ใช้ rank_id
    finalRankId = rank_id && !isNaN(rank_id) ? rank_id : null;
  } else {
    // สมาชิกครอบครัว - ใช้ title
    finalTitle = title || null;
  }

  console.log("💾 Final data to save:", {
    home_id, name, lname, 
    finalRankId, finalTitle, 
    convertedDob, is_right_holder
  });

  const sql = `INSERT INTO guest (
    home_id, name, lname, rank_id, title, phone, id_card, is_right_holder, dob, pos, income, job_phone, image_url
 
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    home_id, 
    name, 
    lname, 
    finalRankId,  // อาจเป็น null สำหรับสมาชิกครอบครัว
    finalTitle,   // อาจเป็น null สำหรับผู้ถือสิทธิ
    phone, 
    id_card, 
    is_right_holder || 0,
    convertedDob, // DOB ที่แปลงแล้ว
    pos,
    income,
    job_phone,
    image_url
  ];

  console.log("🚀 Executing SQL with values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error adding guest:", err);
      return res.status(500).json({ error: "Failed to add guest" });
    }

    console.log("✅ Guest added successfully with ID:", result.insertId);
    res.json({ 
      success: true, 
      id: result.insertId,
      message: "เพิ่มผู้พักสำเร็จ"
    });
  });
});

// เพิ่มด้านล่าง API /api/guests
app.get("/api/guests/:id", (req, res) => {
  const guestId = req.params.id;
  db.query(
    `SELECT guest.*, ranks.name as rank, home_types.name as hType, home.Address 
     FROM guest 
     LEFT JOIN ranks ON guest.rank_id = ranks.id
     LEFT JOIN home ON guest.home_id = home.home_id
     LEFT JOIN home_types ON home.home_type_id = home_types.id
     WHERE guest.id = ?`,
    [guestId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(404).json({ error: "Guest not found" });
      res.json(results[0]);
    }
  );
});

// เพิ่ม endpoint สำหรับรับคะแนนและข้อมูลส่วนตัว
app.post("/api/score", (req, res) => {
  const { rank_id, title, name, lname, phone, total_score } = req.body;

  db.query(
    "INSERT INTO guest_scores (rank_id, title, name, lname, phone, total_score) VALUES (?, ?, ?, ?, ?, ?)",
    [rank_id, title, name, lname, phone, total_score],
   
    (err, result) => {
      if (err) {
        console.error(err); // ดู error ใน console
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

app.get("/api/viewscore", (req, res) => {
  db.query("SELECT * FROM guest_scores ORDER BY total_score DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// แทนที่โค้ดเดิมของ app.post("/api/homes/bulk", ...)
app.post("/api/homes/bulk", upload.single("image"), (req, res) => {
  const { home_type_id, status_id, home_unit_id } = req.body;
  const image = req.file ? req.file.filename : null;

  let addresses = [];
  try {
    addresses = JSON.parse(req.body.addresses);
  } catch {
    return res.status(400).json({ message: "ข้อมูลเลขบ้านไม่ถูกต้อง" });
  }
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return res.status(400).json({ message: "กรุณาระบุเลขบ้านที่ต้องการเพิ่ม" });
  }

  // ดึง subunit_id จาก home_units
  db.query(
    "SELECT subunit_id FROM home_units WHERE id = ?",
    [home_unit_id],
    (err, unitResults) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (unitResults.length === 0) {
        return res.status(400).json({ message: "ไม่พบ home_unit ที่เลือก" });
      }
      const subunit_id = unitResults[0].subunit_id;

      let successCount = 0;
      let errors = [];
      let promises = addresses.map(address => {
        return new Promise((resolve) => {
          db.query(
            "SELECT home_id FROM home WHERE Address = ? AND home_type_id = ? AND subunit_id = ?",
            [address, home_type_id, subunit_id],
            (err, results) => {
              if (err) return resolve();
              if (results.length > 0) {
                errors.push(address);
                return resolve();
              }
              db.query(
                "INSERT INTO home (home_type_id, Address, status_id, image, subunit_id, home_unit_id) VALUES (?, ?, ?, ?, ?, ?)",
                [home_type_id, address, status_id, image, subunit_id || null, home_unit_id || null],
                (err2) => {
                  if (!err2) successCount++;
                  else errors.push(address);
                  resolve();
                }
              );
            }
          );
        });
      });

      Promise.all(promises).then(() => {
        res.json({
          success: true,
          added: successCount,
          failed: errors
        });
      });
    }
  );
});

app.get("/api/home-types-full", (req, res) => {
  db.query("SELECT * FROM home_types ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.get("/api/subunits/:type", (req, res) => {
  db.query(
    "SELECT * FROM subunit_home WHERE subunit_type = ? ORDER BY id ASC",
    [req.params.type],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

app.post("/api/subunit_home", (req, res) => {
  const { name, subunit_type } = req.body;

  if (!name || !subunit_type) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  db.query("SELECT id FROM subunit_home WHERE name = ? AND subunit_type = ?", [name.trim(), subunit_type], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) {
      return res.status(400).json({ message: "subunit นี้มีอยู่แล้ว" });
    }

    db.query(
      "INSERT INTO subunit_home (name, subunit_type) VALUES (?, ?)",
      [name.trim(), subunit_type],
      (insertErr, result) => {
        if (insertErr) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, id: result.insertId });
      }
    );
  });
});

app.put("/api/subunit_home/:id", (req, res) => {
  const { max_capacity } = req.body;
  db.query(
    "UPDATE subunit_home SET max_capacity = ? WHERE id = ?",
    [max_capacity, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ success: true });
    }
  );
});

app.get("/api/home_units/:home_type_id", (req, res) => {
  const homeTypeId = req.params.home_type_id;
  db.query(
    "SELECT * FROM home_units WHERE home_type_id = ? ORDER BY unit_number ASC",
    [homeTypeId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});


app.get("/api/home_unit/:unit_id", (req, res) => {
  const unitId = req.params.unit_id;
  db.query(
    "SELECT unit_name FROM home_units WHERE id = ?",
    [unitId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(404).json({ error: "ไม่พบพื้นที่นี้" });
      res.json({ unit_name: results[0].unit_name });
    }
  );
});

app.get("/api/subunit_home", (req, res) => {
  db.query("SELECT * FROM subunit_home ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});
