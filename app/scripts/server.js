import http from 'http'
import roundRobinAlgorithm from './roundRobinAlgorithm.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const serverConfig = require('./config.json')

const servers = serverConfig.servers.map((server) => ({
  ...server,
  healthy: true,
}))

const checkHealth = () => {
  servers.forEach((server) => {
    const options = {
      host: server.host,
      port: server.port,
      timeout: 1000,
      path: '/',
    }

    const req = http.get(options, (res) => {
      const alive = res.statusCode === 200
      server.healthy = alive
    })

    req.on('error', () => {
      server.healthy = false
    })

    req.end()
  })
}

setInterval(checkHealth, 2000)

const balancer = http.createServer((req, res) => {
  roundRobinAlgorithm(req, res, servers)
})

balancer.listen(8080, () => {
  console.log('Load Balancer is running on port 8080')
})
