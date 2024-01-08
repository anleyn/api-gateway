// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')
const express = require('express')
const Bottleneck = require('bottleneck')
const { v4: uuidv4 } = require('uuid')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')
const PATH_CONTROLLER = path.join(process.cwd(), '/controllers')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const ROUTER_NAME = 'GSRouters'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const uuid = uuidv4
const logger = libLogger.init(ROUTER_NAME, DEBUG_LEVEL, DEBUG)
const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 6000 / 12 })

// === КОНТРОЛЛЕРЫ ===
const fillGSController = require(`${PATH_CONTROLLER}/external/gsheets/fillGSController.js`)
const fillGSControllerPath = CONFIG.controllers.fillGSController.path

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
  router.use(async (req, res, next) => {
    await limiter.schedule(() => next())
  })

  /**
   * Роутер для создания записи в таблице - GET запрос.
   * Возвращает 200 ОК или ошибку.
   * @param {Object} req - Объект запроса.
   * @param {Object} res - Объект ответа.
   * @param {string} requestId - Идентификатор запроса.
   * @returns {Object} Ответ HTTP.
   */
  router.get(fillGSControllerPath, (req, res) => {
    const requestId = uuid()
    logger.info(`[ID запроса: ${requestId}] Получен GET запрос на ${req.path}. Данные запроса: ${JSON.stringify(req.query)}`)
    fillGSController.handle(req, res, requestId)
  })

  /**
   * Роутер для создания записи в таблице - POST запрос.
   * Возвращает 200 ОК или ошибку.
   * @param {Object} req - Объект запроса.
   * @param {Object} res - Объект ответа.
   * @param {string} requestId - Идентификатор запроса.
   * @returns {Object} Ответ HTTP.
   */
  router.post(fillGSControllerPath, (req, res) => {
    const requestId = uuid()
    logger.info(`[ID запроса: ${requestId}] Получен POST запрос на ${req.path}. Данные запроса: ${JSON.stringify(req.body)}`)
    fillGSController.handle(req, res, requestId)
  })
}

module.exports = router
