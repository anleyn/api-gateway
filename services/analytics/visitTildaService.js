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
const SERVICE_NAME = 'visitTildaService'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(SERVICE_NAME, DEBUG_LEVEL, DEBUG)

// === МОДЕЛИ И СЕРВИСЫ ===
const VisitTildaClass = require(`${PATH_DB_CLASSES}/visitTildaClass.js`)

/**
 * Обрабатывает данные о посещении и создает запись в базе данных.
 *
 * @param {string} requestId - Идентификатор запроса для логирования.
 * @param {Object} visitData - Данные о посещении.
 */
module.exports.processVisit = async (requestId, visitData) => {
  logger.debug(`Начало функции processVisit. requestId: ${requestId}, Тип requestId: ${typeof requestId}`)
  logger.debug(`Переданные данные о посещении: ${JSON.stringify(visitData)}, Тип visitData: ${typeof visitData}`)

  try {
    logger.debug(`[ID запроса: ${requestId}] Обработка данных о посещении начата.`)
    const startTime = Date.now()
    const visit = await VisitTildaClass.insert(visitData, requestId)
    const endTime = Date.now()
    logger.debug(`[ID запроса: ${requestId}] Посещение успешно обработано. ID посещения: ${visit.id}, Тип visit: ${typeof visit}, Время обработки: ${endTime - startTime}ms`)
    return visit
  } catch (error) {
    const errorTime = Date.now()
    logger.error(`[ID запроса: ${requestId}] Ошибка при создании записи о посещении: ${error.message}, Время возникновения ошибки: ${errorTime}`)
    logger.error(`Детали ошибки: ${error.stack}`)
    throw error
  }
}
