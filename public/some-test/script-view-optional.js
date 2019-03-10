// @TODO Add Doc

const content = document.querySelector('.content')

/**
 * Returns Promise
 */
const loadClientInfoFromFileOnce = (function() {
  let isDone = false

  return () => {
    if (isDone) return Promise.reject(isDone)

    const uri = `${protocol}://${hostname}${portStr}/file-store/client-info.json`
    return fetch(uri)
      .then(response => {
        console.log('isDone', isDone)
        isDone = true
        if(response.ok) return response.text()
        throw new Error('Network response was not ok.')
      })
      .catch(err => {
        throw `Load banner error: ${err}`
      })
  }
})()


const observer = new MutationObserver(mutations => {

  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      const banner = [].slice.call(content.children)
        .filter(node => node.tagName === 'A' && node.className === 'banner')
        .pop()
      if (banner) {
        console.log(banner)

        loadClientInfoFromFileOnce()
          .then(text => {
              const html = `<pre class="content__clientInfo">${text}</pre>`

              let div = document.createElement('div')
              div.innerHTML = html
              const info = div.firstChild
              const replace = document.querySelector('.content__clientInfo_target')
              replace.replaceWith(info)
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

observer.observe(content, config)

// observer.disconnect()