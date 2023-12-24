// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')
const PATH_DB_CLASSES = path.join(process.cwd(), '/db/classes')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const SERVICE_NAME = 'regTildaService'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(SERVICE_NAME, DEBUG_LEVEL, DEBUG)

// === МОДЕЛИ И СЕРВИСЫ ===
const RegTildaClass = require(`${PATH_DB_CLASSES}/regTildaClass.js`)

/**
 * Обрабатывает данные о регистрации и создает запись в базе данных.
 *
 * @param {string} requestId - Идентификатор запроса для логирования.
 * @param {Object} regData - Данные о регистрации.
 */
module.exports.processReg = async (requestId, regHeaders, regData) => {
  logger.debug(`Начало функции processReg. requestId: ${requestId}, Тип requestId: ${typeof requestId}`)
  logger.debug(`Переданные данные о регистрации: ${JSON.stringify(regData)}, Тип regData: ${typeof regData}`)

  try {
    logger.debug(`[ID запроса: ${requestId}] Обработка данных о регистрации начата.`)
    const startTime = Date.now()
    const reg = await RegTildaClass.insert(regData, regHeaders, requestId)
    const endTime = Date.now()
    logger.debug(`[ID запроса: ${requestId}] Регистрация успешно обработана. ID регистрации: ${reg.id}, Тип reg: ${typeof reg}, Время обработки: ${endTime - startTime}ms`)
    return reg
  } catch (error) {
    const errorTime = Date.now()
    logger.error(`[ID запроса: ${requestId}] Ошибка при создании записи о регистрации: ${error.message}, Время возникновения ошибки: ${errorTime}`)
    logger.error(`Детали ошибки: ${error.stack}`)
    throw error
  }
}
