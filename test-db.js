
const db = require('./config/db.js');

async function testConnection() {
  try {
    const [rows] = await db.query("SELECT * FROM restaurants WHERE name LIKE '%Pasta%'");
    console.log(rows);
  } catch (err) {
    console.error(" DB Connection Failed:", err.message);
   }
}

testConnection();
