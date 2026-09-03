import app from '../backend/dist/index.js'

export default function handler(req, res) {
  const targetUrl = req.headers['x-matched-path'] || req.originalUrl || req.url
  if (targetUrl && (req.url === '/api' || req.url === '/api/' || req.url === '/api/index.js' || req.url === '/api/index')) {
    req.url = targetUrl
  }
  return app(req, res)
}
