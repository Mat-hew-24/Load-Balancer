const http = require('http')

const DEBUG_LOGGING = false // Toggle to true to enable logs
const log = (...args) => DEBUG_LOGGING && console.log(...args)

const port = process.argv[2] || 5001 // pass port as argument
const host = 'localhost'

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.end(`Server response from PORT ${port}`)
})

server.listen(port, host, () => {
  log(`Server started at http://${host}:${port} (PID: ${process.pid})`)
})
