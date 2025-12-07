// server.js
const http = require('http');
const fs = require('fs');
const url = require('url');
const Database = require('better-sqlite3');

// Відкриваємо БД (файл shop.db повинен бути в тій же папці)
const db = new Database('./shop.db', { fileMustExist: true });

// Порт сервера
const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS + заголовок типу
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Для JSON-відповідей встановлюємо content-type нижче

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /items - повернути список товарів
  if (pathname === '/items' && req.method === 'GET') {
    try {
      const stmt = db.prepare('SELECT id, name, price FROM items');
      const items = stmt.all();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(items));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'DB error' }));
    }
    return;
  }

  // Статична віддача index.html для зручності (якщо хочеш відкривати клієнт з http://localhost:3000)
  if (pathname === '/' && req.method === 'GET') {
    fs.readFile('./index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // Нема маршруту
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
