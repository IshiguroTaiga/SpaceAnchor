const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Prevent Windows file locking issues in Docker, write to /tmp on Vercel, otherwise write to current directory
const dbDir = process.env.VERCEL 
  ? '/tmp' 
  : (process.env.NODE_ENV === 'docker' ? '/data' : __dirname);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.sqlite');
const db = new Database(dbPath);

// Async PG-style query helper
const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const cleanText = text.trim();
      const isSelect = cleanText.toUpperCase().startsWith('SELECT') || cleanText.toUpperCase().startsWith('WITH');
      if (isSelect) {
        const stmt = db.prepare(text);
        const rows = stmt.all(...params);
        resolve({ rows });
      } else {
        const stmt = db.prepare(text);
        const info = stmt.run(...params);
        resolve({ rows: [], lastID: info.lastInsertRowid, changes: info.changes });
      }
    } catch (err) {
      reject(err);
    }
  });
};

const initDb = () => {
  const sqlFile = process.env.VERCEL 
    ? path.join(process.cwd(), 'backend/init.sql') 
    : path.resolve(__dirname, 'init.sql');
  
  if (fs.existsSync(sqlFile)) {
    const sql = fs.readFileSync(sqlFile, 'utf8');
    db.exec(sql);
    console.log('✅ SQLite Database Initialized via better-sqlite3 (SpaceAnchor)');
  } else {
    console.error(`❌ init.sql schema file not found at: ${sqlFile}`);
  }
};

initDb();

module.exports = {
  query,
  pool: db
};
