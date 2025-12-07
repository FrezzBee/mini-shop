const http = require("http");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Підключення до бази
const db = new Database("shop.db");

// Створення таблиці, якщо її немає
db.prepare(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )
`).run();

// Додаємо тестові дані, якщо таблиця порожня
const rowCount = db.prepare("SELECT COUNT(*) AS count FROM items").get().count;
if (rowCount === 0) {
  db.prepare(`
    INSERT INTO items (name, price) VALUES
    ('T-shirt', 199.99),
    ('Mug', 79.50),
    ('Notebook', 59.00)
  `).run();
}

// Сервер
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS-запит для CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Отримати всі товари
  if (req.url === "/items" && req.method === "GET") {
    const items = db.prepare("SELECT * FROM items").all();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(items));
    return;
  }

  // Створити товар
  if (req.url === "/items" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const { name, price } = JSON.parse(body);
        if (!name || !price) throw new Error("Missing fields");
        const info = db.prepare("INSERT INTO items (name, price) VALUES (?, ?)").run(name, price);
        const item = db.prepare("SELECT * FROM items WHERE id = ?").get(info.lastInsertRowid);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(item));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "ValidationError", message: err.message }));
      }
    });
    return;
  }

  // Отримати товар за id
  if (req.url.match(/^\/items\/\d+$/) && req.method === "GET") {
    const id = parseInt(req.url.split("/")[2]);
    const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
    if (!item) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "NotFound" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(item));
    return;
  }

  // Оновити товар за id
  if (req.url.match(/^\/items\/\d+$/) && req.method === "PUT") {
    const id = parseInt(req.url.split("/")[2]);
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const { name, price } = JSON.parse(body);
        const info = db.prepare("UPDATE items SET name = ?, price = ? WHERE id = ?").run(name, price, id);
        if (info.changes === 0) throw new Error("Not found");
        const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(item));
      } catch (err) {
        res.writeHead(err.message === "Not found" ? 404 : 400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Видалити товар за id
  if (req.url.match(/^\/items\/\d+$/) && req.method === "DELETE") {
    const id = parseInt(req.url.split("/")[2]);
    const info = db.prepare("DELETE FROM items WHERE id = ?").run(id);
    if (info.changes === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "NotFound" }));
      return;
    }
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Віддавати index.html
  if (req.url === "/" && req.method === "GET") {
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
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

// Порт
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
