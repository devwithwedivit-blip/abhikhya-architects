const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 3001;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json'
};

const COMPRESSIBLE = new Set([
  'text/html; charset=utf-8',
  'application/javascript; charset=utf-8',
  'text/css; charset=utf-8',
  'application/json; charset=utf-8',
  'image/svg+xml',
  'application/manifest+json',
  'font/woff',
  'font/otf',
  'font/ttf'
]);

// In-memory cache for compressed static assets
const compressedCache = new Map();

function resolveFilePath(reqUrl) {
  let reqPath = decodeURI(reqUrl.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    return path.join(PUBLIC_DIR, 'index.html');
  }

  let directPath = path.join(PUBLIC_DIR, reqPath);
  if (fs.existsSync(directPath)) {
    if (fs.statSync(directPath).isFile()) {
      return directPath;
    }
    const indexInDir = path.join(directPath, 'index.html');
    if (fs.existsSync(indexInDir) && fs.statSync(indexInDir).isFile()) {
      return indexInDir;
    }
  }

  // Try appending .html (clean URLs e.g. /contact -> /contact.html, /projects/foo -> /projects/foo.html)
  if (fs.existsSync(directPath + '.html') && fs.statSync(directPath + '.html').isFile()) {
    return directPath + '.html';
  }

  // Alias /offices -> /contact.html
  if (reqPath === '/offices' || reqPath === '/offices/') {
    const contactFile = path.join(PUBLIC_DIR, 'contact.html');
    if (fs.existsSync(contactFile)) return contactFile;
  }

  // If inside /projects/:slug and exact html file not found, try fallback to projects/index.html or index.html
  if (reqPath.startsWith('/projects/')) {
    const projIndex = path.join(PUBLIC_DIR, 'projects.html');
    if (fs.existsSync(projIndex)) return projIndex;
  }

  return directPath;
}

const server = http.createServer((req, res) => {
  const filePath = resolveFilePath(req.url);

  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client-side routes
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexPath) && !path.extname(req.url.split('?')[0])) {
        fs.readFile(indexPath, (rErr, indexData) => {
          if (!rErr) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(indexData);
            return;
          }
          res.statusCode = 404;
          res.end('Not Found');
        });
        return;
      }

      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const etag = `"${stats.mtime.getTime().toString(16)}-${stats.size.toString(16)}"`;

    // Development / Localhost Caching: no-cache to guarantee instant visual updates
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.setHeader('Content-Type', contentType);
    res.setHeader('ETag', etag);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 304 check
    if (req.headers['if-none-match'] === etag) {
      res.statusCode = 304;
      res.end();
      return;
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const canCompress = COMPRESSIBLE.has(contentType);

    if (canCompress) {
      let encoding = null;
      if (acceptEncoding.includes('br')) {
        encoding = 'br';
      } else if (acceptEncoding.includes('gzip')) {
        encoding = 'gzip';
      }

      if (encoding) {
        const cacheKey = `${filePath}:${encoding}:${stats.mtimeMs}`;
        if (compressedCache.has(cacheKey)) {
          const cached = compressedCache.get(cacheKey);
          res.setHeader('Content-Encoding', encoding);
          res.setHeader('Content-Length', cached.length);
          res.end(cached);
          return;
        }

        // Read and compress
        fs.readFile(filePath, (readErr, rawData) => {
          if (readErr) {
            res.statusCode = 500;
            res.end('Error reading file');
            return;
          }

          const compressor = encoding === 'br' 
            ? zlib.brotliCompress 
            : zlib.gzip;

          compressor(rawData, (compErr, compressed) => {
            if (compErr) {
              res.setHeader('Content-Length', rawData.length);
              res.end(rawData);
              return;
            }

            // Cache compressed buffer
            compressedCache.set(cacheKey, compressed);
            res.setHeader('Content-Encoding', encoding);
            res.setHeader('Content-Length', compressed.length);
            res.end(compressed);
          });
        });
        return;
      }
    }

    // Uncompressed fallback
    res.setHeader('Content-Length', stats.size);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

const start = () => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`High-Performance HTTP server running at http://localhost:${PORT}/ and http://127.0.0.1:${PORT}/`);
  });
};

server.on('error', (err) => {
  console.error('Server error:', err);
});

start();
