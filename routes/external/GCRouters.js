// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')
const express = require('express')
const { v4: uuidv4 } = require('uuid')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')
const PATH_CONTROLLER = path.join(process.cwd(), '/controllers')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const ROUTER_NAME = 'GCRouters'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const uuid = uuidv4
const logger = libLogger.init(ROUTER_NAME, DEBUG_LEVEL, DEBUG)

// === КОНТРОЛЛЕРЫ ===
const orderGCController = require(`${PATH_CONTROLLER}/external/getcourse/orderGCController.js`)
const orderGCControllerPath = CONFIG.controllers.orderGCController.path

// === ОСНОВНАЯ ФУНКЦИЯ РОУТЕРА ===
const router = express.Router()

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

if (!CONFIG.routes[ROUTER_NAME].enabled) {
  router.use((req, res) => {
    const requestId = uuid()
    logger.warn(`[ID запроса: ${requestId}] Роутер '${ROUTER_NAME}' временно недоступен.`)
    res.status(503).send('Temporarily unavailable')
  })
} else {
  /**
   * FIXME: Исправить и проверить логику для GET-запросов.
   *
   * Роутер для создания заказа в GC - GET запрос.
   * Возвращает ссылку на заказ или ошибку.
   * @param {Object} req - Объект запроса.
   * @param {Object} res - Объект ответа.
   * @param {string} requestId - Идентификатор запроса.
   * @returns {Object} Ответ HTTP.
   */
  router.get('/test', (req, res) => {
    const requestId = uuid()
    logger.debug(`[ID запроса: ${requestId}] Получен GET запрос на ${req.path}. Данные запроса: ${JSON.stringify(req.query)}`)
    orderGCController.handle(req, res, requestId)
  })

  /**
   * Роутер для создания заказа в GC - POST запрос.
   * Возвращает ссылку на заказ или ошибку.
   * @param {Object} req - Объект запроса.
   * @param {Object} res - Объект ответа.
   * @param {string} requestId - Идентификатор запроса.
   * @returns {Object} Ответ HTTP.
   */
  router.post(orderGCControllerPath, (req, res) => {
    const requestId = uuid()
    logger.debug(`[ID запроса: ${requestId}] Получен POST запрос на ${req.path}. Данные запроса: ${JSON.stringify(req.body)}`)
    orderGCController.handle(req, res, requestId)
  })

  const routerActivationRequestId = uuid()
  logger.info(`[ID запроса: ${routerActivationRequestId}] Роутер '${ROUTER_NAME}' активирован.`)
}

module.exports = router
