const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Create an HTTP server
const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);

  // Proxy the request to the target server
  proxy.web(req, res, { target: 'http://example.com' });
});

// Handle errors in the proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong. Please try again.');
});

// Listen on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server is listening on port ${PORT}`);
});
