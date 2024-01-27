const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // Log the incoming request
  console.log('Request received:', req.method, req.url);

  // Extract the last part of the path from the request URL
  const targetServer = req.url.split('/').pop();

  // Proxy the request to the target server
  proxy.web(req, res, { target: targetServer });
});

// Handle errors in the proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong. Please try again.');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server is listening on port ${PORT}`);
});
