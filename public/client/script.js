// @TODO Move next to server implode.
const protocol = 'http'
const hostname = 'localhost'
const port = 8091
const portStr = port ? ':' + port : ''

;(function() {

  const uri = `${protocol}://${hostname}${portStr}/get?id=97`

  fetch(uri)

    .then(response => {

      if(response.ok) {
        return response.text()
      }
      throw new Error('Network response was not ok.')
    })

    .then(text => {

      var div = document.createElement('div')
      div.innerHTML = text.trim()

      var a = div.firstChild
      var replace = document.querySelector('.methads-script')
      replace.replaceWith(a)
    })

    .catch(err => console.log('My Error:', err))

})()