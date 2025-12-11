import httpProxy from 'http-proxy'
const proxy = httpProxy.createProxyServer({})
let idx = 0

const roundRobinAlgorithm = (req, res, servers) => {
  const healthyServers = servers.filter((s) => s.healthy)

  if (healthyServers.length === 0) {
    res.writeHead(503)
    return res.end('No healthy servers available')
  }

  const server = healthyServers[idx % healthyServers.length]
  idx++

  proxy.web(
    req,
    res,
    { target: `http://${server.host}:${server.port}` },
    (err) => {
      server.healthy = false
      res.writeHead(502)
      res.end(`Server ${server.port} is unhealthy`)
    }
  )
}

export default roundRobinAlgorithm
