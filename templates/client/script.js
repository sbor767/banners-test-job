;(function() {

  // const
  const refDomen = document.domain
  console.log('refDomen=', refDomen)
  const location = document.location.href
  console.log('location=', location)
  const referrer = document.referrer
  console.log('referrer=', referrer)

  const date = new Date()
  const timezoneStr = date.toString().match(/\((.*)\)/).pop()
  console.log('timezoneStr=', timezoneStr)
  const timezoneOffset = date.getTimezoneOffset()
  console.log('timezoneOffset=', timezoneOffset)

  const plugins = () => {
    const plugins = navigator.plugins
    let pluginsStr = ''
    for (let i = 0; i < plugins.length; i++) {
      pluginsStr += pluginsStr ? ',' + plugins[i].name : plugins[i].name
    }
    return pluginsStr
  }
  console.log('plugins=', plugins())

  const hasCookie = !!document.cookie
  console.log('hasCookie=', hasCookie)

  // It is also possible to get a lot of what is higher in the code using the following:


  /**
   * Returns Promise
   */
  const fingerprintHashDo = () => {
    /**
     * WebGl hash
     * API from https://github.com/Valve/fingerprintjs2
     * What is - https://browserleaks.com/webgl#what-is-webgl-fingerprinting
     * Also possible approach and code see on https://codepen.io/jon/pen/LLPKbz
     */
    const options = {
      excludes: {
        userAgent: true,
        webdriver: true,
        language: true,
        colorDepth: true,
        deviceMemory: true,
        pixelRatio: true,
        hardwareConcurrency: true,
        screenResolution: true,
        availableScreenResolution: true,
        timezoneOffset: true,
        timezone: true,
        sessionStorage: true,
        localStorage: true,
        indexedDb: true,
        openDatabase: true,
        cpuClass: true,
        platform: true,
        doNotTrack: true,
        plugins: true,
        canvas: true,
        adBlock: true,
        hasLiedLanguages: true,
        hasLiedResolution: true,
        hasLiedBrowser: true,
        touchSupport: true,
        fonts: true,
        audio: true,
        enumerateDevices: true,

        addBehavior: true,
        hasLiedOs: true,
        fontsFlash: true,

        webglVendorAndRenderer: true
      }
    }
    return Fingerprint2.getPromise(options)
      .then(components => { // an array of components: {key: ..., value: ...}
        console.log('Fingerprint2.getPromise--result=', components)
        return Fingerprint2.x64hash128(components.join(''), 31)
      })
      .then(hash => {
        console.log('Fingerprint2.getPromise--x64hash128=', hash)
        return hash
      })
  }

  /**
   * Returns Promise
   */
  const loadFingerprint2Cdn = () => {
    const cdn = 'https://cdnjs.cloudflare.com/ajax/libs/fingerprintjs2/2.0.6/fingerprint2.js'
    return fetch(cdn)
      .then(response => {
        if(response.ok) {
          return response.text()
        }
        throw new Error('Network cdn response was not ok.')
      })
      .then(text => {
        const script = document.createElement('script')
        script.innerHTML = text.trim()
        document.head.appendChild(script)
        return 1
      })
      .catch(err => {
        console.log('CDN load Error:', err)
        return err
      })
  }

  /**
   * Returns Promise
   */
  const loadBannerInfo = () => {
    const uri = `${protocol}://${hostname}${portStr}/banner-info`
    return fetch(uri)
      .then(response => {
        if(response.ok) {
          return response.json()
        }
        throw new Error('Network response was not ok.')
      })
      .then(json => {
        // as object {randomClickId, banner}
        return json
      })
      .catch(err => {
        console.error('Load banner error:', err)
        return err
      })
  }

  const composeUrlQueryWithData = (randomClickId, webglHash) => {
    const referrerStr = !!referrer ? `&referrer=${encodeURIComponent(referrer)}` : ''
    return `?` +
      `click_id=${randomClickId}` +
      `&location=${encodeURIComponent(location)}` +
       `${referrerStr}` +
      `&timezone=${encodeURIComponent(timezoneStr)}` +
      `&tz_offset=${timezoneOffset}` +
      `&plugins=${encodeURIComponent(plugins())}` +
      `&cookies=${hasCookie}` +
      `&webgl_hash=${webglHash}`
  }

  /**
   * Main func
   */
  const doBanner = () => {
    Promise.all([loadFingerprint2Cdn(), loadBannerInfo()])
      .then(async values => {
        const hash = await fingerprintHashDo()
        console.log('Hash=', hash)
        console.log('values=', values, values[1])

        const bannerInfo = values[1]
        const { randomClickId, banner } = bannerInfo
        const queryStr = composeUrlQueryWithData(randomClickId, hash)
        console.log('queryStr=', queryStr)

        const html =
          `<a href="${banner.href}" target="_blank">` +
            `<img ` +
              `src="${protocol}://${hostname}${portStr}/banners/${banner.fileName}${queryStr}" ` +
              `alt="${banner.title}" ` +
              `width="${banner.width}" ` +
              `height="${banner.height}" ` +
            `/>` +
          `</a>`

        let div = document.createElement('div')
        div.innerHTML = html.trim()
        const a = div.firstChild
        const replace = document.querySelector('.some-banner-script')
        replace.replaceWith(a)
      })
  }


  // Using 'requestIdleCallback' API if possible.
  if ('requestIdleCallback' in window) {
    console.log('requestIdleCallback is ON!')
    requestIdleCallback(doBanner);
  }
  else {
    console.log('requestIdleCallback is OFF!')
    setTimeout(doBanner, 1)
  }

})()