const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')
const PATH_KEYRING = path.join(process.cwd(), '/config/keyring.yml')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const CONTROLLER_NAME = 'libSec'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(CONTROLLER_NAME, DEBUG_LEVEL, DEBUG)

/**
 * Проверяет, содержится ли заданное значение в массиве ключей для указанного пути.
 *
 * @param {string} route - Путь, для которого необходимо проверить ключи.
 * @param {*} value - Значение для проверки.
 * @throws {Error} Если ключ не найден или возникла ошибка при чтении файла.
 */
const checkKey = (route, value) => {
  const stringValue = String(value).trim()

  logger.debug(`Начало проверки ключа для маршрута: ${route}, Тип маршрута: ${typeof route}`)
  logger.debug(`Проверяемый ключ: ${stringValue}, Тип ключа: ${typeof stringValue}`)

  if (stringValue === 'undefined' || stringValue === '') {
    logger.error(`Ошибка: Пустой или неопределенный ключ для маршрута: ${route}`)
    throw new Error('Invalid key: Key is undefined or empty')
  }

  let keyMap
  try {
    logger.debug('Чтение файла keyring...')
    const keyringContent = fs.readFileSync(PATH_KEYRING, 'utf8')
    keyMap = yaml.load(keyringContent)
    logger.debug(`Файл keyring успешно прочитан. Тип данных keyMap: ${typeof keyMap}, Содержимое: ${JSON.stringify(keyMap)}`)
  } catch (err) {
    logger.error(`Ошибка при чтении файла keyring: ${err.message}, Тип ошибки: ${typeof err}`)
    throw new Error(`Read keyring error: ${err.message}`)
  }

  // Проверка клиентских ключей
  const clientKeys = keyMap.clients
  logger.debug(`Клиентские ключи: ${JSON.stringify(clientKeys)}`)
  if (clientKeys && Object.values(clientKeys).includes(stringValue)) {
    logger.debug(`Доступ разрешен для клиента: ${route}`)
    return
  }

  // Проверка ключей контроллеров
  const controllerKeys = keyMap.controllers
  logger.debug(`Ключи контроллеров: ${JSON.stringify(controllerKeys)}`)
  if (controllerKeys && String(controllerKeys[route]).trim() === stringValue) {
    logger.debug(`Доступ разрешен для контроллера: ${route}`)
    return
  }

  logger.warn(`Доступ запрещен: Неверный токен аутентификации для маршрута: ${route}`)
  throw new Error('Access denied: Invalid auth token')
}

module.exports = { checkKey }
