/**
 * YOJNA AI — Automation Server
 *
 * Listens on http://localhost:3001
 * The React app calls this to trigger browser automation.
 *
 * Run: node scripts/automate-server.cjs
 *  (keep it running alongside `npm run dev`)
 */

const http  = require('http');
const path  = require('path');
const { spawn } = require('child_process');

const PORT = 3001;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const server = http.createServer((req, res) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Health check — React app pings this first
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, CORS_HEADERS);
    res.end(JSON.stringify({ status: 'ok', version: '1.0' }));
    return;
  }

  // Trigger PM Kisan auto-fill
  if (req.method === 'POST' && req.url === '/apply/pm-kisan') {
    const script = path.join(__dirname, 'apply-pm-kisan.cjs');
    console.log(`\n[${new Date().toLocaleTimeString()}] 🚀 Launching PM Kisan automation...`);

    const child = spawn(process.execPath, [script], {
      stdio: 'inherit',
      detached: true,
      windowsHide: false,
    });

    child.on('error', err => {
      console.error('Failed to start script:', err.message);
    });

    child.unref(); // Don't wait for it

    res.writeHead(200, CORS_HEADERS);
    res.end(JSON.stringify({ status: 'started', message: 'Browser opening...' }));
    return;
  }

  res.writeHead(404, CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║       YOJNA AI — Automation Server v1.0           ║');
  console.log(`║       Listening on http://localhost:${PORT}           ║`);
  console.log('╠═══════════════════════════════════════════════════╣');
  console.log('║  POST /apply/pm-kisan  →  Launch PM Kisan auto-fill ║');
  console.log('║  GET  /health          →  Health check              ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  console.log('Keep this running alongside `npm run dev`.\n');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} already in use. Kill the other process first.\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
