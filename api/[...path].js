export default async function handler(req, res) {
  try {
    const incomingUrl = req.url || '';
    // Remove leading '/api/'
    const path = incomingUrl.replace(/^\/api\/?/, '');
    const target = `https://wiangwecare.com/api/${path}`;

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
      res.statusCode = 204;
      return res.end();
    }

    const forwardedHeaders = { ...req.headers };
    delete forwardedHeaders.host;
    delete forwardedHeaders.connection;

    const fetchOptions = {
      method: req.method,
      headers: forwardedHeaders,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      redirect: 'manual',
    };

    const r = await fetch(target, fetchOptions);
    res.statusCode = r.status;

    const ct = r.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    const sc = r.headers.get('set-cookie');
    if (sc) res.setHeader('Set-Cookie', sc);
    const cc = r.headers.get('cache-control');
    if (cc) res.setHeader('Cache-Control', cc);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await r.arrayBuffer();
    return res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy error:', err);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Bad gateway', details: String(err) }));
  }
}
