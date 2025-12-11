import http from 'http'
import roundRobinAlgorithm from './roundRobinAlgorithm.js'
import { createRequire } from 'module'
import { exec } from 'child_process' // can be used to run bash
const require = createRequire(import.meta.url)
const serverConfig = require('./config.json')

const servers = serverConfig.servers.map((server) => ({
  ...server,
  healthy: true,
}))

// Stats tracking for auto-scaling
let serverStats = {}
servers.forEach((server) => {
  serverStats[server.port] = 0
})

const killServer = (port) => {
  console.log(` Killing server ${port} due to high load (≥2 requests/sec)`)
  exec(`pkill -f "singleserver.js ${port}"`, (error) => {
    if (error) {
      console.error(`Error killing server ${port}:`, error.message)
    } else {
      console.log(`Server ${port} killed successfully`)
      const server = servers.find((s) => s.port === port)
      if (server) server.healthy = false

      setTimeout(() => {
        console.log(`Restarting server ${port} after 15s cooldown`)
        exec(`node singleserver.js ${port} &`, (error) => {
          if (error) {
            console.error(`Error restarting server ${port}:`, error.message)
          } else {
            console.log(`Server ${port} restarted successfully`)
          }
        })
      }, 15000)
    }
  })
}

// Clear stats every second and check for overloaded servers
setInterval(() => {
  console.log(' Request stats (last 1s):', serverStats)

  // Check for overloaded servers
  Object.entries(serverStats).forEach(([port, count]) => {
    if (count >= 2) {
      killServer(parseInt(port))
    }
  })

  // Reset stats
  servers.forEach((server) => {
    serverStats[server.port] = 0
  })
}, 1000)

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
  // Add CORS headers for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  roundRobinAlgorithm(req, res, servers, serverStats)
})

balancer.listen(8080, () => {
  console.log('Load Balancer is running on port 8080')
})
