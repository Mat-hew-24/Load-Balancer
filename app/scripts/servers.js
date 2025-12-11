const http = require('http')
const serverConfig = require('./config.json').servers

const createServer = (host, port) => {
  const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.end(`Server response from PORT ${port}`)
  })

  server.listen(port, host, () => {
    console.log(`server started at http://${host}:${port}`)
  })
}

serverConfig.forEach((x) => createServer(x.host, x.port))
