// @TODO Add Doc

const observeDomArea = document.querySelector('.content__bannerZone')

/**
 * Returns Promise
 */
const loadClientInfoFromFileOnce = (function() {
  let isDone = false

  return () => {
    console.log('isDone', isDone)
    if (isDone) return Promise.reject(isDone)

    const uri = `${protocol}://${hostname}${portStr}/file-store/client-info.json`
    return fetch(uri)
      .then(response => {
        isDone = true
        console.log('fetching...')
        if(response.ok) return response.text()
        throw new Error('Network response was not ok.')
      })
      .catch(err => {
        throw `Load banner error: ${err}`
      })
  }
})()

const delay = ms => new Promise((resolve, reject) => {
  setTimeout(resolve, ms)
})


const observer = new MutationObserver(mutations => {

  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      const banner = [].slice.call(observeDomArea.children)
        .filter(node => node.tagName === 'A' && node.className === 'content__bannerZoneA')
        .pop()
      if (banner) {
        console.log(banner)

        // This delay is required in order to server to refresh client statistics.
        delay(500).then(loadClientInfoFromFileOnce)
          .then(text => {
              const html = `<div class="content__clientInfoCaption">Last five client prints:</div>` +
                `<pre class="content__clientInfoPre">${text}</pre>`

              let div = document.createElement('div')
              div.className = 'content__clientInfo'
              div.innerHTML = html
              const replace = document.querySelector('.content__clientInfo_target')
              replace.replaceWith(div)
            },
            err => {
              // err === true means Done is true.
              if (err === true) return // Do Nothing.
              throw err
            }
        )
      }
    }

  })

})

const config = { attributes: false, childList: true, characterData: false }

observer.observe(observeDomArea, config)

// observer.disconnect()