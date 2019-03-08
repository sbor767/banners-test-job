const FILE_STORE_PATH = './public/file-store/client-info.json'
const fs = require('fs')
const util = require('util')

const saveIfNotBusy = clientInfoObj => {
  let isBusy

  return () => {
    console.log(`===============isBusy====${isBusy}==============`)
    if (isBusy) return Promise.reject('File store is busy!')

    isBusy = true
    return read()
      .then(arr => {
        let newArr = [...arr]
        // Truncate if five or more.
        if (newArr.length >= 5) newArr.length = 4
        newArr.unshift(clientInfoObj)
        return newArr
      })

      .then(toWriteArr => {
        const writeFile = util.promisify(fs.writeFile)
        writeFile(FILE_STORE_PATH, JSON.stringify(toWriteArr, null, 4))
          .then(code => {
            isBusy = false
            return code
          })
          .catch(err => {
            isBusy = false
            throw err
          })

      })

      .catch(err => {throw `File store write error when reading: ${err}`})
  }
}

const save = clientInfoObj => {
  return saveIfNotBusy(clientInfoObj)()
}

const read = () => {
  const readFile = util.promisify(fs.readFile)
  return readFile(FILE_STORE_PATH, 'utf8')
    .then(data => {
      let arr
      try {
        arr = JSON.parse(data)
      } catch (e) {
        throw `Json parse error when read file: ${e}`
      }
      if (!Array.isArray(arr)) throw 'Data is not array when read file.'
      return arr
    })
    .catch(err => {
      // Check for ENOENT and return empty array if so.
      if (err.code === 'ENOENT') return []

      throw `Failed read file-store with error: ${err}`
    })
}

exports.save = save
exports.read5last = read