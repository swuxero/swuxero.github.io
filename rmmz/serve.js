const http = require('http');
const fs   = require('fs');
const path = require('path');
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ogg':  'audio/ogg',
  '.css':  'text/css',
  '.otf':  'font/otf',
  '.woff': 'font/woff',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let fp = (url === '/' || url.endsWith('/'))
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, url);

  const ext = path.extname(fp).toLowerCase();
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('게임 서버 실행 중!');
  console.log('Chrome/Edge에서 아래 주소 열기:');
  console.log('  http://localhost:' + PORT);
  console.log('종료하려면 Ctrl+C');
});