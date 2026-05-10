const http = require("http");
const fs = require("fs");
const path = require("path");
const { generateDevis } = require("./lib/gemini");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8787);
const MAX_BODY = 8 * 1024 * 1024;

loadEnv(path.join(ROOT, ".env"));

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY) {
        reject(new Error("Image ou requête trop volumineuse."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON invalide."));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  const buildDir = path.join(ROOT, "build");
  const requestPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const filePath = requestPath === "/" ? path.join(buildDir, "index.html") : path.join(buildDir, requestPath);
  const safePath = path.normalize(filePath);
  if (!safePath.startsWith(buildDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  const target = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(buildDir, "index.html");
  if (!fs.existsSync(target)) {
    res.writeHead(404);
    res.end("Build introuvable. Lancez npm run build.");
    return;
  }
  fs.createReadStream(target).pipe(res);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/generate-devis") {
    try {
      const payload = await readJson(req);
      const devis = await generateDevis(payload);
      sendJson(res, 200, devis);
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Erreur génération devis." });
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`API DevisBTP Gemini: http://localhost:${PORT}`);
});
