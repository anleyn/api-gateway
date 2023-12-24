const path = require('path')

const fs = require('fs')
const yaml = require('js-yaml')

const conf = {
  read: (path) => {
    try {
      const config = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
      return yaml.load(config)
    } catch (err) {
      console.error(err)
      return 1
    }
  }
}

const ssl = {
  read: (mode) => {
    let pathSSL
    if (mode === 'test') {
      pathSSL = path.join(process.cwd(), '/static/ssl_test/')
    } else {
      pathSSL = path.join(process.cwd(), '/static/ssl_core/')
    }

    const options = {
      key: fs.readFileSync(`${pathSSL}key.pem`),
      cert: fs.readFileSync(`${pathSSL}cert.pem`),
      ca: [
        fs.readFileSync(`${pathSSL}intermediate.pem`),
        fs.readFileSync(`${pathSSL}root.pem`)
      ]
    }
    return options
  }
}

const temp = {
  readValue: function (filename, key) {
    try {
      const rawData = fs.readFileSync(filename, { encoding: 'utf8' })
      const jsonData = JSON.parse(rawData)
      const value = jsonData[key] ?? 1
      return value
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn(`JSON file not found, creating new file: ${filename}`)
        const initialValue = 1
        const jsonData = { [key]: initialValue }
        fs.writeFileSync(filename, JSON.stringify(jsonData))
        return initialValue
      }
      console.error(`Error while reading JSON file: ${err}`)
      return 1
    }
  },
  setValue: function (filename, key, value) {
    try {
      const rawData = fs.readFileSync(filename, { encoding: 'utf8' })
      const jsonData = JSON.parse(rawData)
      jsonData[key] = value
      fs.writeFileSync(filename, JSON.stringify(jsonData))

      return value
    } catch (err) {
      console.error(`Error while setting value in JSON file: ${err}`)
      return 1
    }
  },
  incrementValue: function (filename, key) {
    try {
      const rawData = fs.readFileSync(filename, { encoding: 'utf8' })
      const jsonData = JSON.parse(rawData)
      jsonData[key] = (jsonData[key] ?? 1) + 1
      fs.writeFileSync(filename, JSON.stringify(jsonData))
      return jsonData[key]
    } catch (err) {
      console.error(`Error while incrementing value in JSON file: ${err}`)
      return 1
    }
  }
}

const file = {
  /**
   * Читает файл и возвращает содержимое строки с указанным номером.
   *
   * @param {string} path - Путь к файлу, из которого нужно прочитать строку.
   * @param {number} lineNumber - Номер строки, которую нужно вернуть.
   * @returns {Promise<string>} Содержимое строки.
   */
  readLine: function (path, lineNumber) {
    return new Promise((resolve, reject) => {
      let lineCount = 0

      const stream = fs.createReadStream(path, { encoding: 'utf8' })
        .on('data', chunk => {
          let index = -1
          do {
            index = chunk.indexOf('\n', index + 1)
            if (index !== -1) {
              lineCount++
              if (lineCount === lineNumber) {
                const start = chunk.lastIndexOf('\n', index - 1) + 1
                const end = index
                resolve(chunk.slice(start, end).trim())
                stream.destroy()
              }
            }
          } while (index !== -1)
        })
        .on('end', () => {
          reject(new Error('Line number out of range'))
        })
        .on('error', error => {
          reject(error)
        })
    })
  }
}
module.exports = {
  conf,
  ssl,
  temp,
  file
}
