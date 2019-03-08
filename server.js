require('dotenv').config()
const protocol = process.env.PROTOCOL || 'http'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT
const portStr = port ? ':' + port : ''

const http = require('http')
const url = require('url');
const staticServer = require('node-static')

// Gets random integer within 0..65535
const getRandomInt = () =>  Math.floor(Math.random() * 2 ** 16)

const fileServer = new staticServer.Server('./public')

const server = http.createServer((req, res) => {

  req.addListener('end', () => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    fileServer.serve(req, res, async (err, result) => {
      const urlParsed = url.parse(req.url, true)

      const errorEnd = (code, logMessage) => {
        console.error(logMessage)
        // Respond to the client
        res.writeHead(code, err.headers)
        res.end()
      }

      if (err) {
        /**
         * Treat non file requests
         */

        /**
         * path = '/banner-info'
         */
        if (urlParsed.pathname === '/banner-info') {

          try {
            const randomClickId = getRandomInt()
            const banner = await require('./api/banners').getRandom()
            res.end(JSON.stringify({randomClickId, banner}))
            return

          } catch (e) {
            errorEnd(400, e.message)
            return
          }

        }

        // 404 page
        errorEnd(404, "Error serving " + req.url + " - " + err.status + '==' + err.message)
      } else {

        // File is found but we can do something/

        /**
         * Get client info when banner just showed.
         */
        // console.log('urlParsed', urlParsed)
        // For paths begins from /banners/ and contains query param 'click_id'
        // which means - we give back banner img and getting client info.
        const q = urlParsed.query
        if (urlParsed.pathname.toLowerCase().indexOf('/banners/') === 0 && !!q.click_id) {
          console.log('IMG=======', urlParsed.href)
          const obj = {
            clickId: +q.click_id || 0,
            location: decodeURIComponent(q.location) || '',
            referrer: decodeURIComponent(q.referrer) || '',
            timezone: decodeURIComponent(q.timezone) || '',
            tzOffset: +q.tz_offset || 0,
            plugins: decodeURIComponent(q.plugins) || '',
            cookies: Boolean(q.cookies) || false,
            webGlHash: q.webgl_hash || ''
          }
          const fileApi = require('./api/file-store/five-last')

          // @TODO delete 'node-static' and do own treatment static <img> files to more fine control
          // when give away it or not (after fulfillment statistics save).
          fileApi.save(obj)
            .then(res => console.log('Saved with code=', res))
            .catch(err => {
              console.error(`Not saved with err==${err}`)
              // throw `Not saved with err=${err}`
            })
        }

      }
    })
  }).resume()
})


/**
 * Run server
 */
server.listen(port, hostname, () => {

  // @TODO Move next to webpack, but for now we do this by pure node.
  // Prepare build-up client script.js by adding fingerprint library, environment variables and basic script.js
  // from template folder.
  const fs = require('fs')
  const fingerprintLibrary = fs.createReadStream(__dirname + '/templates/libraries/fingerprint2.js', { encoding: 'utf8', highWaterMark: 64 * 1024 })
  const sourceScript = fs.createReadStream(__dirname + '/templates/client/script.js', { encoding: 'utf8', highWaterMark: 16 * 1024 })
  const writable = fs.createWriteStream(__dirname + '/public/client/script.js')

  fingerprintLibrary.pipe(writable, { end: false })

  // Creating readable stream from string (https://stackoverflow.com/a/22085851)
  const Readable = require('stream').Readable
  const s = new Readable()
  s._read = () => {} // redundant? see update below
  // Insert for code separation.
  s.push('\n\n')
  // Insert current .env vars.
  const envConstants =
    `const protocol = '${protocol}'\n` +
    `const hostname = '${hostname}'\n` +
    `const portStr = '${portStr}';/**/\n\n`
  s.push(envConstants)
  // Insert to denote the end of stream.
  s.push(null)

  // Writing two readable streams into the same writable stream.
  // See https://stackoverflow.com/a/28033554.
  fingerprintLibrary.on('end', () => {
    s.pipe(writable, { end: false })
  })

  s.on('end', () => {
    sourceScript.pipe(writable)
  })

  console.log(`Server running at http://${hostname}${portStr}/`)
})