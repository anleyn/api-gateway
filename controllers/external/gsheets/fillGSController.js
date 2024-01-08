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
const CONTROLLER_NAME = 'fillGSController'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(CONTROLLER_NAME, DEBUG_LEVEL, DEBUG)

// === МОДЕЛИ И СЕРВИСЫ ===
const fillTableService = require(`${PATH_SERVICES}/external/gsheets/fillTableGSService.js`)

// Логгирование начальной конфигурации и подключений
logger.debug(`Пути: LIB = ${PATH_LIB}, CONFIG = ${PATH_CONFIG}, SERVICES = ${PATH_SERVICES}`)
logger.debug('Библиотеки и модули подключены')
logger.debug(`Конфигурация: CONTROLLER_NAME = ${CONTROLLER_NAME}, DEBUG = ${DEBUG}, DEBUG_LEVEL = ${DEBUG_LEVEL}`)
logger.debug(`Сервис fillTableService подключен из ${PATH_SERVICES}/external/gsheets/fillTableGSService.js`)

/**
 * Функция для извлечения ключа из запроса в зависимости от его типа.
 * @param {Object} objReq - Объект запроса.
 * @returns {string} Ключ из заголовков или параметров запроса.
 */
function extractKey (objReq) {
  return objReq.method === 'GET' ? objReq.query.key : objReq.headers.key
}

/**
 * Функция для извлечения id таблицы из запроса в зависимости от его типа.
 * @param {Object} objReq - Объект запроса.
 * @returns {string} ID таблицы из заголовков или параметров запроса.
 */
function extractGId (objReq) {
  return objReq.method === 'GET' ? objReq.query.gid : objReq.headers.gid
}

/**
 * Функция для извлечения имени листа таблицы из запроса в зависимости от его типа.
 * @param {Object} objReq - Объект запроса.
 * @returns {string} Имя листа из заголовков или параметров запроса.
 */
function extractGList (objReq) {
  return objReq.method === 'GET' ? objReq.query.glist : objReq.headers.glist
}

/**
 * Функция для извлечения и валидации данных из запроса.
 * @param {Object} objReq - Объект запроса.
 * @returns {Object} Объект, содержащий данные из запроса.
 */
function extractData (objReq) {
  const sourceObject = objReq.method === 'GET' ? objReq.query : objReq.body
  const cellKeys = Object.keys(sourceObject)
    .filter(key => /^cell\d+$/.test(key))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10)
      const numB = parseInt(b.match(/\d+/)[0], 10)
      return numA - numB
    })

  const result = {}
  cellKeys.forEach(key => {
    result[key] = sourceObject[key]
  })
  return result
}

/**
 * Функция для сдвига ключей объекта с добавлением текущей даты и времени в начало.
 * @param {Object} obj - Исходный объект с ключами cellX, где X - число.
 * @returns {Object} Новый объект с изменёнными значениями ключей.
 */
function createOutgoingData (objIncomingData) {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const formattedTime = currentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const newObject = {
    cell1: formattedDate,
    cell2: formattedTime
  }

  // Сдвиг всех остальных ключей на две позиции
  Object.keys(objIncomingData).forEach((key, index) => {
    newObject[`cell${index + 3}`] = objIncomingData[key]
  })

  return newObject
}

/**
 * Основная функция контроллера.
 * @param {express.Request} request - Объект запроса.
 * @param {express.Response} response - Объект ответа.
 * @param {string} strRequestId - Уникальный идентификатор запроса.
 * @returns {Promise<number|string>} Статус ответа или результат выполнения.
 */
module.exports.handle = async (request, response, strRequestId) => {
  const startTime = Date.now()

  logger.debug(`[ID запроса: ${strRequestId}] Начало обработки запроса`)

  if (!CONFIG.controllers[CONTROLLER_NAME].enabled) {
    logger.warn(`[ID запроса: ${strRequestId}] Контроллер '${CONTROLLER_NAME}' временно недоступен`)
    response.status(503).send('Temporarily unavailable')
    return
  }

  try {
    logger.debug(`[ID запроса: ${strRequestId}] Контроллер активирован, обрабатываемые данные: ${JSON.stringify(request.body)}`)

    const strKey = extractKey(request)
    libSec.checkKey(CONTROLLER_NAME, strKey)
    logger.debug(`[ID запроса: ${strRequestId}] Ключ авторизации '${strKey}' проверен`)

    logger.debug(`[ID запроса: ${strRequestId}] Начало обработки тела запроса`)
    logger.debug(`[ID запроса: ${strRequestId}] Извлекаем данные о таблице-получателе`)
    const strGId = extractGId(request)
    logger.debug(`[ID запроса: ${strRequestId}] ID таблицы: ${strGId}`)
    logger.debug(`[ID запроса: ${strRequestId}] Извлекаем данные о листе-получателе`)
    const strGList = extractGList(request)
    logger.debug(`[ID запроса: ${strRequestId}] Имя листа: ${strGList}`)
    logger.debug(`[ID запроса: ${strRequestId}] Извлекаем заголовки запроса`)
    const objIncomingHeaders = request.headers
    logger.debug(`[ID запроса: ${strRequestId}] Заголовки запроса: ${JSON.stringify(objIncomingHeaders)}`)
    logger.debug(`[ID запроса: ${strRequestId}] Извлекаем данные для заполнения таблицы`)
    const objIncomingData = extractData(request)
    logger.debug(`[ID запроса: ${strRequestId}] Данные: ${JSON.stringify(objIncomingData)}`)

    logger.debug(`[ID запроса: ${strRequestId}] Формируем объект для заполнения таблицы`)
    const objOutgoingData = createOutgoingData(objIncomingData)
    logger.debug(`[ID запроса: ${strRequestId}] Объект для заполнения таблицы: ${JSON.stringify(objOutgoingData)}`)

    logger.debug(`[ID запроса: ${strRequestId}] Обращаемся к сервису для отправки объекта в таблицу`)
    const result = await fillTableService.handle(strRequestId, strGId, strGList, objOutgoingData)
    logger.debug(`[ID запроса: ${strRequestId}] Результат заполнения: ${JSON.stringify(result)}`)

    logger.debug(`[ID запроса: ${strRequestId}] Запрос обработан, возвращаем ответ. Продолжительность: ${Date.now() - startTime}ms`)
    response.status(200).send(JSON.stringify(result))
  } catch (error) {
    logger.error(`[ID запроса: ${strRequestId}] Ошибка: ${error.message}, Продолжительность: ${Date.now() - startTime}ms`)
    response.status(error.isTransient ? 503 : 500).send('Internal server error')
  }
}
