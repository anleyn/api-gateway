// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')
const PATH_SERVICES = path.join(process.cwd(), '/services')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)
const libSec = require(`${PATH_LIB}/libSec.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const CONTROLLER_NAME = 'testVivaOauthController'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(CONTROLLER_NAME, DEBUG_LEVEL, DEBUG)

// === СЕРВИСЫ ===
const visitTildaService = require(`${PATH_SERVICES}/tests/testVivaOauthService.js`)

// Логгирование начальной конфигурации и подключений
logger.debug(`Пути: LIB = ${PATH_LIB}, CONFIG = ${PATH_CONFIG}, SERVICES = ${PATH_SERVICES}`)
logger.debug('Библиотеки и модули подключены')
logger.debug(`Конфигурация: CONTROLLER_NAME = ${CONTROLLER_NAME}, DEBUG = ${DEBUG}, DEBUG_LEVEL = ${DEBUG_LEVEL}`)
logger.debug(`Сервис testVivaOauthService подключен из ${PATH_SERVICES}/tests/testVivaOauthService.js`)

/**
 * Основная функция контроллера.
 * @param {express.Request} request - Объект запроса.
 * @param {express.Response} response - Объект ответа.
 * @param {string} requestId - Уникальный идентификатор запроса.
 * @returns {Promise<number|string>} Статус ответа или результат выполнения.
 */
module.exports.handleVisit = async (request, response, requestId) => {
  const startTime = Date.now()
  logger.debug(`[ID запроса: ${requestId}] Начало обработки запроса`)

  if (!CONFIG.controllers[CONTROLLER_NAME].enabled) {
    logger.warn(`[ID запроса: ${requestId}] Контроллер '${CONTROLLER_NAME}' временно недоступен`)
    response.status(503).send('Temporarily unavailable')
    return
  }

  try {
    logger.debug(`[ID запроса: ${requestId}] Контроллер активирован, обрабатываемые данные: ${JSON.stringify(request.body)}`)
    const key = request.headers.key
    libSec.checkKey(CONTROLLER_NAME, key)
    logger.debug(`[ID запроса: ${requestId}] Ключ авторизации '${key}' проверен`)

    const visitData = request.body
    const result = await visitTildaService.processVisit(requestId, visitData)
    logger.debug(`[ID запроса: ${requestId}] Запрос обработан, отправляем ответ`)
    response.status(200).send({ orderCode: result })
  } catch (error) {
    logger.error(`[ID запроса: ${requestId}] Ошибка: ${error.message}, Продолжительность: ${Date.now() - startTime}ms`)
    response.status(error.isTransient ? 503 : 500).send('Internal server error')
  }
}