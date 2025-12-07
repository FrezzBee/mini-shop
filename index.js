const http = require("http");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Підключення до бази
const db = new Database("shop.db");

// Створення таблиці та додавання тестових даних, якщо таблиця порожня
db.prepare(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )
`).run();

const rowCount = db.prepare("SELECT COUNT(*) AS count FROM items").get().count;
if (rowCount === 0) {
  db.prepare(`
    INSERT INTO items (name, price) VALUES
    ('T-shirt', 199.99),
    ('Mug', 79.50),
    ('Notebook', 59.00)
  `).run();
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/items" && req.method === "GET") {
    const items = db.prepare("SELECT * FROM items").all();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(items));
  } else if (req.url === "/" && req.method === "GET") {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Server error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
