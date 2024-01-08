// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')
const PATH_SERVICES = path.join(process.cwd(), '/services')
const PATH_GC_CLASSES = path.join(process.cwd(), '/services/external/getcourse/classes')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)
const libSec = require(`${PATH_LIB}/libSec.js`)
const { validateString } = require(`${PATH_LIB}/utils/validateStrings.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const CONTROLLER_NAME = 'orderGCController'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(CONTROLLER_NAME, DEBUG_LEVEL, DEBUG)

// === МОДЕЛИ И СЕРВИСЫ ===
const GCDeal = require(`${PATH_GC_CLASSES}/GCDeal.js`)
const GCDealTest = require(`${PATH_GC_CLASSES}/GCDealTest.js`)
const GCDealNeso = require(`${PATH_GC_CLASSES}/GCDealNeso.js`)
const GCDealTrandford = require(`${PATH_GC_CLASSES}/GCDealTrandford.js`)
const orderGCService = require(`${PATH_SERVICES}/external/getcourse/orderGCService.js`)

// Логгирование начальной конфигурации и подключений
logger.debug(`Пути: LIB = ${PATH_LIB}, CONFIG = ${PATH_CONFIG}, SERVICES = ${PATH_SERVICES}`)
logger.debug('Библиотеки и модули подключены')
logger.debug(`Конфигурация: CONTROLLER_NAME = ${CONTROLLER_NAME}, DEBUG = ${DEBUG}, DEBUG_LEVEL = ${DEBUG_LEVEL}`)
logger.debug(`Сервис orderGCService подключен из ${PATH_SERVICES}/external/getcourse/orderGCService.js`)

/**
 * Создает объект заказа в зависимости от модели.
 *
 * @param {Object} objData - Данные для создания заказа.
 * @param {string} strModel - Модель заказа.
 * @returns {Object} - Созданный объект заказа.
 */
function createOrderObj (objData, strModel) {
  switch (strModel) {
    case 'test':
      return new GCDealTest(objData)
    case 'neso':
      return new GCDealNeso(objData)
    case 'trandford':
      return new GCDealTrandford(objData)
    default:
      return new GCDeal(objData)
  }
}

/**
 * Функция для фильтрации объекта:
 * Удаляет ключей с пустыми значениями.
 * Рекурсивно обходит все вложенные объекты.
 *
 * @param {Object} obj - Объект фильтрации.
 * @returns {Object} - Отфильтрованный объект без ключей с undefined, null или пустой строкой.
 */
function filterObject (obj) {
  Object.keys(obj).forEach(key => {
    (obj[key] && typeof obj[key] === 'object')
      ? filterObject(obj[key])
      : (obj[key] === undefined || obj[key] === null || obj[key] === '') && delete obj[key]
  })
  return obj
};

/**
 * Функция для извлечения ключа из запроса в зависимости от его типа.
 * @param {Object} objReq - Объект запроса.
 * @returns {string} Ключ из заголовков или параметров запроса.
 */
function extractKey (objReq) {
  return objReq.method === 'GET' ? objReq.params.key : objReq.headers.key
}

/**
 * Функция для извлечения клиента из запроса в зависимости от его типа.
 * @param {Object} objReq - Объект запроса.
 * @returns {string} Клиент из заголовков или параметров запроса.
 */
function extractClient (objReq) {
  return objReq.method === 'GET' ? objReq.params.client : objReq.headers.client
}

/**
 * Функция для извлечения и валидации данных из запроса.
 * @param {Object} objReq - Объект запроса.
 * @returns {Object} Объект, содержащий данные из запроса.
 */
function extractData (objReq) {
  const objData = objReq.method === 'GET' ? objReq.params : objReq.body
  objData.email && (objData.email = validateString('email', objData.email))
  objData.phone && (objData.phone = validateString('phone', objData.phone))
  return objData
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
    logger.info(`[ID запроса: ${strRequestId}] Контроллер активирован, обрабатываемые данные: ${JSON.stringify(request.body)}`)

    const strKey = extractKey(request)
    libSec.checkKey(CONTROLLER_NAME, strKey)
    logger.debug(`[ID запроса: ${strRequestId}] Ключ авторизации '${strKey}' проверен`)

    logger.debug(`[ID запроса: ${strRequestId}] Начало обработки тела запроса`)
    logger.debug(`[ID запроса: ${strRequestId}] Извлекаем данные о получателе`)
    const strClient = extractClient(request)
    logger.debug(`[ID запроса: ${strRequestId}] Получатель: ${strClient}`)
    logger.debug(`[ID запроса: ${strRequestId}] Извлекаем заголовки запроса`)
    const objIncomingOrderHeaders = request.headers
    logger.debug(`[ID запроса: ${strRequestId}] Заголовки запроса: ${JSON.stringify(objIncomingOrderHeaders)}`)
    logger.debug(`[ID запроса: ${strRequestId}] Извлекаем данные заказа`)
    const objIncomingOrderData = extractData(request)
    logger.debug(`[ID запроса: ${strRequestId}] Данные заказа: ${JSON.stringify(objIncomingOrderData)}`)
    logger.debug(`[ID запроса: ${strRequestId}] Формируем объект заказа`)
    const objOrderData = createOrderObj(objIncomingOrderData, strClient)
    logger.info(`[ID запроса: ${strRequestId}] Объект сформирован`)
    logger.debug(`[ID запроса: ${strRequestId}] Очищаем объект заказа от пустых строк`)
    const objFilteredOrderData = filterObject(objOrderData)
    logger.debug(`[ID запроса: ${strRequestId}] Очистка завершена, объект: ${JSON.stringify(objFilteredOrderData)}`)

    logger.info(`[ID запроса: ${strRequestId}] Обращаемся к сервису для отправки объекта заказа в GC`)
    const result = await orderGCService.handle(strRequestId, strClient, objFilteredOrderData)
    logger.info(`[ID запроса: ${strRequestId}] Ответ от GC: ${JSON.stringify(result)}`)

    logger.debug(`[ID запроса: ${strRequestId}] Запрос обработан, возвращаем ответ. Продолжительность: ${Date.now() - startTime}ms`)
    response.status(200).send(JSON.stringify(result))
  } catch (error) {
    logger.error(`[ID запроса: ${strRequestId}] Ошибка: ${error.message}, Продолжительность: ${Date.now() - startTime}ms`)
    response.status(error.isTransient ? 503 : 500).send('Internal server error')
  }
}
