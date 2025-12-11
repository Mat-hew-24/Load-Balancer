const http = require('http')
const roundRobin = require('./roundRobinAlgorithm')
const serverConfig = require('./config.json').servers

const servers = serverConfig.map((server) => ({
  ...server,
}))

const server = http.createServer((req, res) => {
  roundRobin(req, res, servers)
})

server.listen(8080, () => {
  console.log('Load Balancer is running on port 8080')
})
