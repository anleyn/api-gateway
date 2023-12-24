const fs = require('fs')
const path = require('path')

/**
 * Модуль для работы с SSL-сертификатами.
 */
const ssl = {
  /**
   * Читает и возвращает SSL-сертификаты для заданного режима.
   *
   * @param {string} mode - Режим работы сервера ('test' или 'core').
   * @returns {Object} Объект с ключами SSL-сертификатов.
   */
  read: (mode) => {
    const pathSSL = mode === 'test'
      ? path.join(process.cwd(), '/static/system/ssl/test/')
      : path.join(process.cwd(), '/static/system/ssl/core/')

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

module.exports = ssl
