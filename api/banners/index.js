const banners = {
  35: {
    id: 35,
    title: 'Something in somewhere',
    href: 'https://yandex.ru/search/?lr=2&text=Something%20in%20somewhere',
    fileName: '35-300x250.jpg',
    width: 300,
    height: 250
  },
  56: {
    id: 56,
    title: 'Latin alphabet on Rambler',
    href: 'https://nova.rambler.ru/search?query=Latin%20alphabet',
    fileName: '56-banner-916673-160x50.png',
    width: 160,
    height: 50
  },
  82: {
    id: 82,
    title: 'Hourglass on Google',
    href: 'https://www.google.com/search?q=Hourglass',
    fileName: '82-hourglass-2910951_320x133.jpg',
    width: 320,
    height: 133
  },
  97: {
    id: 97,
    title: 'Balloon on Google',
    href: 'https://www.google.com/search?q=Balloon',
    fileName: '97-nature-2531761_500x180.jpg',
    width: 500,
    height: 180
  },
}

const get = id => {
  if (!banners[id]) return Promise.reject(`No banner exist with id=${id}`)
  return Promise.resolve(banners[id])
}

const getRandom = () => {
  const keys = Object.keys(banners)
  // https://stackoverflow.com/a/5915122
  const randomId = keys[Math.floor(Math.random()*keys.length)]
  return get(randomId)
}

exports.get = get
exports.getRandom = getRandom