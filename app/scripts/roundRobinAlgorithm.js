import httpProxy from 'http-proxy'
const proxy = httpProxy.createProxyServer({})
let start = 0
const roundRobinAlgorithm = (req, res, servers) => {
  const x = servers[start]
  start = (start + 1) % servers.length
  proxy.web(req, res, { targer: `http://${x.host}:${x.port}` })
}

export default roundRobinAlgorithm
