import http from 'http'
import roundRobinAlgorithm from './roundRobinAlgorithm.js'
import { createRequire } from 'module'
import { spawn } from 'child_process'
import { AUTO_SCALING_CONFIG } from './config.js'

const require = createRequire(import.meta.url)
const serverConfig = require('./config.json')

// Debug logger - toggle via AUTO_SCALING_CONFIG.DEBUG_LOGGING
const log = (...args) =>
  AUTO_SCALING_CONFIG.DEBUG_LOGGING && console.log(...args)

/* -------------------- SERVER REGISTRY -------------------- */ //STATE OF EACH SERVER IS TRACKED
const servers = serverConfig.servers.map((server) => ({
  ...server,
  healthy: true,
}))

const serverProcesses = new Map()
const cooldownServers = new Set() // COOLDOWN AND RESTARTING OF SERVERS...
/* -------------------- STATS -------------------- */
const serverStats = {}
servers.forEach((server) => {
  serverStats[server.port] = 0
})
/* -------------------- PROCESS CONTROL -------------------- */

const startServer = (port) => {
  if (serverProcesses.has(port)) return

  log(`Starting server on port ${port}`)

  const child = spawn('node', ['app/scripts/singleserver.js', port], {
    stdio: 'inherit',
  })

  serverProcesses.set(port, child)

  const server = servers.find((s) => s.port === port)
  if (server) server.healthy = true

  child.on('exit', (code, signal) => {
    log(`Server ${port} exited (code=${code}, signal=${signal})`)
    serverProcesses.delete(port)
  })
}

const killServer = (port) => {
  if (cooldownServers.has(port)) return // Already cooling down

  const proc = serverProcesses.get(port)
  if (!proc) {
    log(`Server ${port} already stopped`)
    return
  }

  log(
    `Killing server ${port} due to high load (≥${AUTO_SCALING_CONFIG.REQUEST_THRESHOLD} req/s)`
  )

  cooldownServers.add(port) // start cooldown
  proc.kill('SIGTERM')
  serverProcesses.delete(port)

  const server = servers.find((s) => s.port === port)
  if (server) server.healthy = false

  setTimeout(() => {
    log(
      `Restarting server ${port} after ${
        AUTO_SCALING_CONFIG.RESTART_DELAY / 1000
      }s cooldown`
    )
    startServer(port)
    cooldownServers.delete(port) // cooldown finished
  }, AUTO_SCALING_CONFIG.RESTART_DELAY)
}

/* -------------------- INITIAL START -------------------- */

servers.forEach(({ port }) => startServer(port))

/* -------------------- AUTO-SCALING -------------------- */

setInterval(() => {
  log('Request stats (last 1s):', serverStats)

  Object.entries(serverStats).forEach(([port, count]) => {
    if (count >= AUTO_SCALING_CONFIG.REQUEST_THRESHOLD) {
      killServer(Number(port))
    }
  })

  servers.forEach((server) => {
    serverStats[server.port] = 0
  })
}, AUTO_SCALING_CONFIG.STATS_INTERVAL)

/* -------------------- HEALTH CHECK -------------------- */
const checkHealth = () => {
  servers.forEach((server) => {
    const options = {
      host: server.host,
      port: server.port,
      timeout: 1000,
      path: '/',
    }

    const req = http.get(options, (res) => {
      server.healthy = res.statusCode === 200
    })

    req.on('error', () => {
      server.healthy = false
    })

    req.end()
  })
}
setInterval(checkHealth, AUTO_SCALING_CONFIG.HEALTH_CHECK_INTERVAL)
/* -------------------- LOAD BALANCER -------------------- */
const balancer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        serverStats,
        healthyServers: servers.filter((s) => s.healthy).map((s) => s.port),
        requestThreshold: AUTO_SCALING_CONFIG.REQUEST_THRESHOLD,
      })
    )
    return
  }

  roundRobinAlgorithm(req, res, servers, serverStats)
})

balancer.listen(8080, '0.0.0.0', () => {
  log('Load Balancer is running on port 8080')
})

export { serverStats }
