const express = require("express");
const mysql = require("mysql");

const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "",
  database: "abc",
});

// API ดึงข้อมูลยศทั้งหมด
router.get("/ranks", (req, res) => {
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

// API ดึงยศที่อนุญาตสำหรับประเภทบ้านเฉพาะ
router.get("/home-types/:homeTypeId/allowed-ranks", (req, res) => {
  const { homeTypeId } = req.params;
  
  const sql = `
    SELECT he.*, r.name as rank_name
    FROM home_eligibility he
    LEFT JOIN ranks r ON he.rank_id = r.id
    WHERE he.home_type_id = ?
    ORDER BY r.name
  `;
  
  db.query(sql, [homeTypeId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// API อัปเดตยศที่อนุญาตสำหรับประเภทบ้าน
router.put("/home-types/:homeTypeId/allowed-ranks", (req, res) => {
  const { homeTypeId } = req.params;
  const { allowedRanks } = req.body;
  
  console.log("Updating allowed ranks for home type:", homeTypeId, "Ranks:", allowedRanks);
  
  // เริ่ม transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Transaction error" });
    }
    
    // ลบยศเดิมทั้งหมดสำหรับประเภทบ้านนี้
    db.query("DELETE FROM home_eligibility WHERE home_type_id = ?", [homeTypeId], (deleteErr) => {
      if (deleteErr) {
        return db.rollback(() => {
          console.error("Delete error:", deleteErr);
          res.status(500).json({ error: "Delete error" });
        });
      }
      
      // ถ้าไม่มียศที่เลือก ให้ commit เลย
      if (!allowedRanks || allowedRanks.length === 0) {
        return db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => {
              console.error("Commit error:", commitErr);
              res.status(500).json({ error: "Commit error" });
            });
          }
          res.json({ success: true, message: "อัปเดตยศที่อนุญาตสำเร็จ" });
        });
      }
      
      // เพิ่มยศใหม่
      const values = allowedRanks.map(rankId => [homeTypeId, rankId]);
      const insertSql = "INSERT INTO home_eligibility (home_type_id, rank_id) VALUES ?";
      
      db.query(insertSql, [values], (insertErr) => {
        if (insertErr) {
          return db.rollback(() => {
            console.error("Insert error:", insertErr);
            res.status(500).json({ error: "Insert error" });
          });
        }
        
        // ดึงชื่อประเภทบ้านสำหรับ log
        db.query("SELECT name FROM home_types WHERE id = ?", [homeTypeId], (homeTypeErr, homeTypeResults) => {
          const homeTypeName = homeTypeResults.length > 0 ? homeTypeResults[0].name : homeTypeId;
          const logDetail = `อัปเดตยศที่อนุญาตสำหรับประเภทบ้าน ${homeTypeName} (${allowedRanks.length} ยศ)`;
          
          // บันทึก audit log
          db.query(
            "INSERT INTO guest_logs (guest_id, home_id, action, detail, created_at) VALUES (NULL, NULL, 'update_home_type_ranks', ?, NOW())",
            [logDetail],
            (logErr) => {
              if (logErr) {
                console.error("Log error:", logErr);
              }
              
              db.commit((commitErr) => {
                if (commitErr) {
                  return db.rollback(() => {
                    console.error("Commit error:", commitErr);
                    res.status(500).json({ error: "Commit error" });
                  });
                }
                
                res.json({ 
                  success: true, 
                  message: "อัปเดตยศที่อนุญาตสำเร็จ",
                  updatedRanks: allowedRanks.length 
                });
                console.log("✅ Updated allowed ranks for home type:", homeTypeId);
              });
            }
          );
        });
      });
    });
  });
});

// API เพิ่มยศใหม่
router.post("/ranks", (req, res) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "กรุณากรอกชื่อยศ" });
  }
  
  // ตรวจสอบความซ้ำ
  db.query("SELECT id FROM ranks WHERE name = ?", [name.trim()], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: "ยศนี้มีอยู่แล้ว" });
    }
    
    // เพิ่มยศใหม่
    db.query("INSERT INTO ranks (name) VALUES (?)", [name.trim()], (insertErr, result) => {
      if (insertErr) {
        console.error("Database error:", insertErr);
        return res.status(500).json({ error: "Database error" });
      }
      
      // บันทึก audit log
      const logDetail = `เพิ่มยศใหม่: ${name.trim()}`;
      db.query(
        "INSERT INTO guest_logs (guest_id, home_id, action, detail, created_at) VALUES (NULL, NULL, 'add_rank', ?, NOW())",
        [logDetail],
        (logErr) => {
          if (logErr) {
            console.error("Error logging rank addition:", logErr);
          }
        }
      );
      
      res.json({ 
        success: true, 
        message: "เพิ่มยศสำเร็จ",
        id: result.insertId,
        name: name.trim()
      });
      console.log("✅ Rank added:", name.trim());
    });
  });
});

// API ลบยศ
router.delete("/ranks/:id", (req, res) => {
  const { id } = req.params;
  
  // ตรวจสอบว่ามีการใช้งานยศนี้หรือไม่
  db.query("SELECT COUNT(*) as count FROM guest WHERE rank_id = ?", [id], (err, guestResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const guestCount = guestResults[0].count;
    
    // ตรวจสอบในตาราง home_eligibility
    db.query("SELECT COUNT(*) as count FROM home_eligibility WHERE rank_id = ?", [id], (eligibilityErr, eligibilityResults) => {
      if (eligibilityErr) {
        console.error("Database error:", eligibilityErr);
        return res.status(500).json({ error: "Database error" });
      }
      
      const eligibilityCount = eligibilityResults[0].count;
      
      if (guestCount > 0 || eligibilityCount > 0) {
        return res.status(400).json({ 
          message: `ไม่สามารถลบได้ เนื่องจากยศนี้ถูกใช้งานอยู่ (ผู้พัก: ${guestCount}, กฎบ้าน: ${eligibilityCount})` 
        });
      }
      
      // ดึงชื่อยศก่อนลบ
      db.query("SELECT name FROM ranks WHERE id = ?", [id], (nameErr, nameResults) => {
        const rankName = nameResults.length > 0 ? nameResults[0].name : "ไม่ทราบชื่อ";
        
        // ลบยศ
        db.query("DELETE FROM ranks WHERE id = ?", [id], (deleteErr, result) => {
          if (deleteErr) {
            console.error("Database error:", deleteErr);
            return res.status(500).json({ error: "Database error" });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "ไม่พบยศ" });
          }
          
          // บันทึก audit log
          const logDetail = `ลบยศ: ${rankName}`;
          db.query(
            "INSERT INTO guest_logs (guest_id, home_id, action, detail, created_at) VALUES (NULL, NULL, 'delete_rank', ?, NOW())",
            [logDetail],
            (logErr) => {
              if (logErr) {
                console.error("Error logging rank deletion:", logErr);
              }
            }
          );
          
          res.json({ 
            success: true, 
            message: "ลบยศสำเร็จ" 
          });
          console.log("✅ Rank deleted:", rankName);
        });
      });
    });
  });
});

// API ตรวจสอบว่ายศสามารถเข้าพักประเภทบ้านได้หรือไม่
router.get("/eligibility", (req, res) => {
  const { home_type_id, rank_id } = req.query;
  
  const sql = "SELECT * FROM home_eligibility WHERE home_type_id = ? AND rank_id = ?";
  
  db.query(sql, [home_type_id, rank_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    res.json({ eligible: results.length > 0 });
  });
});

module.exports = router;