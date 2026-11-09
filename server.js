import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectInLatest, emergencyReply } from './src/safety.js';
import { askAI } from './src/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  process.loadEnvFile(path.join(__dirname, '.env')); // optional .env next to server.js
} catch {
  /* no .env file */
}
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;
const LANGS = ['en', 'pcm', 'yo', 'ha'];
const MAX_MESSAGES = 20;
const MAX_CHARS = 1000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

// very small in-memory rate limit: 20 requests / minute / IP
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8'); // don't split Yoruba/Hausa characters across chunks
    req.on('data', (c) => {
      data += c;
      if (data.length > 50_000) {
        reject(new Error('too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export function validate(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) return null;
  const messages = body.messages.slice(-MAX_MESSAGES).map((m) => ({
    role: m && m.role === 'assistant' ? 'assistant' : 'user',
    content: String((m && m.content) || '').slice(0, MAX_CHARS),
  }));
  if (messages[messages.length - 1].role !== 'user' || !messages[messages.length - 1].content.trim()) return null;
  // the API requires the first message to be from the user
  while (messages.length && messages[0].role !== 'user') messages.shift();
  const lang = LANGS.includes(body.lang) ? body.lang : 'en';
  return { messages, lang };
}

async function handleTriage(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  if (rateLimited(ip)) return json(res, 429, { error: 'Too many requests. Please wait a minute.' });

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: 'Invalid request.' });
  }
  const input = validate(body);
  if (!input) return json(res, 400, { error: 'Invalid request.' });

  // 1. Deterministic safety layer. Never skipped, never overridden by the AI.
  const flags = detectInLatest(input.messages);
  if (flags.length) return json(res, 200, emergencyReply(flags, input.lang));

  // 2. AI guidance
  if (!API_KEY) {
    return json(res, 200, {
      level: 'see_clinic',
      source: 'no-api-key',
      reply:
        'The AI service is not configured on this server (no API key). Safety checks still work. If you are worried about your symptoms, please see a nurse or doctor.',
    });
  }
  try {
    const out = await askAI({ messages: input.messages, lang: input.lang, apiKey: API_KEY, model: MODEL });
    return json(res, 200, { ...out, source: 'ai' });
  } catch (err) {
    console.error(err.message);
    return json(res, 502, {
      level: 'see_clinic',
      source: 'error',
      reply: 'Sorry, I could not answer just now. If you are worried, please see a nurse or doctor.',
    });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
}

export const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/triage') return void handleTriage(req, res);
  if (req.method === 'GET') return void serveStatic(req, res);
  res.writeHead(405).end('Method not allowed');
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Triage assistant running at http://localhost:${PORT}`);
    console.log(API_KEY ? `AI model: ${MODEL}` : 'No GEMINI_API_KEY set: safety rules only.');
  });
}
