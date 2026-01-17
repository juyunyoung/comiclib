import initSqlJs from 'sql.js';

let db = null;
let SQL = null;

export const initDB = async () => {
  if (db) return db;

  try {
    // Locate the wasm file. usually it needs to be in public folder or imported.
    // simpler approach for quick start: use CDN or expect it in node_modules/sql.js/dist/
    // A robust way in Vite is to import the wasm URL.

    // For now, we rely on the default behavior or CDN if local fails, but let's try standard init.
    // If this fails due to wasm location, we might need to copy wasm to public.

    SQL = await initSqlJs({
      // locateFile: file => `https://sql.js.org/dist/${file}` // CDN fallback if needed
      locateFile: file => `/assets/${file}`
    });

    // Check if we have saved data in localStorage to simulate persistence?
    // For now, new DB every time as per "Save to Memory" plan, 
    // unless we implement export/import logic.

    db = new SQL.Database();

    // Create Table
    db.run(`
      CREATE TABLE IF NOT EXISTS comics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        review TEXT,
        rating INTEGER,
        coverImage TEXT,
        createdAt TEXT
      );
    `);

    console.log("SQLite DB Initialized");
    return db;
  } catch (err) {
    console.error("Failed to initialize SQLite:", err);
    throw err;
  }
};

export const insertComic = async (data) => {
  if (!db) await initDB();

  try {
    const { title, author, review, rating, coverImage } = data;
    const createdAt = new Date().toISOString();

    // Prepare statement to avoid SQL injection (though client side is less critical for injection, good practice)
    const stmt = db.prepare("INSERT INTO comics (title, author, review, rating, coverImage, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run([title, author, review, rating, coverImage, createdAt]);
    stmt.free();

    console.log("Data saved to SQLite successfully");

    // Verify
    const res = db.exec("SELECT * FROM comics");
    console.log("Current SQLite Data:", res[0]?.values);

    return true;
  } catch (err) {
    console.error("SQLite Insert Error:", err);
    return false;
  }
};

export const getComics = async () => {
  if (!db) await initDB();
  const res = db.exec("SELECT * FROM comics");
  if (res.length > 0) {
    // Map columns to objects
    const columns = res[0].columns;
    const values = res[0].values;
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }
  return [];
};
