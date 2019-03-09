/**
 * Ensures the persistence of the last five client requests in a file by the queue model.
 * Rejects other write requests while recording.
 */

const FILE_STORE_PATH = './public/file-store/client-info.json'
const fs = require('fs')
const util = require('util')

/**
 * Returns Promise
 */
const saveIfNotBusy = clientInfoObj => {
  let isBusy

  return () => {
    if (isBusy) return Promise.reject('File storage is busy!')

    isBusy = true
    return read()
      .then(arr => {
          let newArr = [...arr]
          // Truncate if five or more.
          if (newArr.length >= 5) newArr.length = 4
          newArr.unshift(clientInfoObj)
          return newArr
        },
        err => {throw `File store write error when reading: ${err}`}
      )

      .then(toWriteArr => {
        return util.promisify(fs.writeFile)(FILE_STORE_PATH, JSON.stringify(toWriteArr, null, 4))
          .then(() => {
            isBusy = false
            return 'ok'
          })
      })

      .catch(err => {
        isBusy = false
        throw err
      })
  }
}

/**
 * Returns Promise
 */
const save = clientInfoObj => {
  return saveIfNotBusy(clientInfoObj)()
}

/**
 * Returns Promise
 */
const read = () => {
  const readFile = util.promisify(fs.readFile)
  return readFile(FILE_STORE_PATH, 'utf8')
    .then(
      JSON.parse,
      err => {
        // Check for ENOENT and return empty array if so.
        if (err.code === 'ENOENT') return []
        throw err
      }
    )
    .then(arr => {
      if (!Array.isArray(arr)) throw 'Data is not array when read file.'
      return arr
    })
    .catch(err => {
      throw `Failed read file-store with error: ${err}`
    })
}

exports.save = save