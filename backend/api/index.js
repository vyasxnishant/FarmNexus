import app from '../dist/index.js'

export default function handler(req, res) {
  // If Vercel rewrote the URL to /api or /api/index.js, restore the original incoming path
  const targetUrl = req.headers['x-matched-path'] || req.originalUrl || req.url
  if (targetUrl && (req.url === '/api' || req.url === '/api/' || req.url === '/api/index.js' || req.url === '/api/index')) {
    req.url = targetUrl
  }
  return app(req, res)
}
