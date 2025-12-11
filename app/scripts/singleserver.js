const http = require('http')

const port = process.argv[2] || 5001 // pass port as argument
const host = 'localhost'

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.end(`Server response from PORT ${port}`)
})

server.listen(port, host, () => {
  console.log(`Server started at http://${host}:${port} (PID: ${process.pid})`)
})
