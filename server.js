const express = require('express');
const mysql = require('mysql');
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kampus",
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database");
});

// Get all mahasiswa
app.get("/api/mahasiswa", (req, res) => {
    const sql = "SELECT * FROM mahasiswa";
    
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Add new mahasiswa
app.post("/api/mahasiswa", async (req, res) => {
    try {
        const latestNIM = await getLatestNIM();
        const newNIM = latestNIM === 0 ? 1 : latestNIM + 1;

        const { nama } = req.body;

        const sql = "INSERT INTO mahasiswa (nim, nama) VALUES (?, ?)";

        db.query(sql, [newNIM, nama], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Mahasiswa added", id: result.insertId });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update mahasiswa
app.put("/api/mahasiswa/:nim", (req, res) => {
    const { nim } = req.params;
    const { nama } = req.body;
    const sql = "UPDATE mahasiswa SET nama = ? WHERE nim = ?";
    
    db.query(sql, [nama, nim], (err, result) => {
      if (err) throw err;
      res.json({ message: "Mahasiswa updated" });
    });
  });
  
// Delete mahasiswa
app.delete("/api/mahasiswa/:nim", (req, res) => {
    const { nim } = req.params;
    const sql = "DELETE FROM mahasiswa WHERE nim = ?";
    
    db.query(sql, [nim], (err, result) => {
      if (err) throw err;
      res.json({ message: "Mahasiswa deleted" });
    });
});

function getLatestNIM() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT nim FROM mahasiswa ORDER BY nim DESC LIMIT 1";
        
        db.query(sql, (err, result) => {
            if (err){
                reject(err);
            }else{
                resolve(result[0]?.nim || 0);
            }
        });
    });
}
  
app.listen(8000, () => {
    console.log("Server is running on port 8000");
});