// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')
const { Mutex } = require('async-mutex')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)

const mutex = new Mutex()
let fillGSAppIndex = 0

/**
 * Получает следующий идентификатор приложения.
 * @returns {Promise<string>} Идентификатор приложения.
 */
async function getAppId () {
  const release = await mutex.acquire()
  try {
    const apps = CONFIG.controllers?.fillGSController?.apps
    if (!apps || !apps.length) {
      throw new Error('Массив APPID пуст')
    }

    const appId = apps[fillGSAppIndex]
    fillGSAppIndex = (fillGSAppIndex + 1) % apps.length
    return appId
  } finally {
    release()
  }
}

module.exports = getAppId
