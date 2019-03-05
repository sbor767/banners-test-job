require('dotenv').config()
const protocol = process.env.PROTOCOL || 'http'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT
const portStr = port ? ':' + port : ''

const http = require('http')
const url = require('url');
const staticServer = require('node-static')


const fileServer = new staticServer.Server('./public')

const server = http.createServer((req, res) => {
  req.addListener('end', () => {

    res.setHeader('Access-Control-Allow-Origin', '*')

    fileServer.serve(req, res, async (err, result) => {

      const errorEnd = (code, logMessage) => {
        console.error(logMessage)
        // Respond to the client
        res.writeHead(code, err.headers)
        res.end()
      }
      const urlParsed = url.parse(req.url, true)

      if (err) {

        // Treat non file requests

        /* /get path */
        if (urlParsed.pathname === '/get') {
          const id = !!urlParsed.query.id ? +urlParsed.query.id : undefined
          if (!id) {
            errorEnd(400, 'No banner id granted.')
            return
          }

          try {
            const banner = await require('./api/banners').get(id)
            const html = `<a href="${banner.href}" target="_blank"><img src="${protocol}://${hostname}${portStr}/banners/${banner.fileName}" alt="${banner.title}" width="${banner.width}" height="${banner.height}" /></a>`
            res.end(html)
            return

          } catch (e) {
            errorEnd(400, e.message)
            return
          }

        }

        // 404 page
        errorEnd(404, "Error serving " + req.url + " - " + err.status + '==' + err.message)
      }
    })
  }).resume()
})


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}${portStr}/`)
})