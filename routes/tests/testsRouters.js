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
const ROUTER_NAME = 'testsRouters'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const uuid = uuidv4
const logger = libLogger.init(ROUTER_NAME, DEBUG_LEVEL, DEBUG)

// === КОНТРОЛЛЕРЫ ===
const testVivaOauthController = require(`${PATH_CONTROLLER}/tests/testVivaOauthController.js`)
const testVivaOauthControllerPath = CONFIG.controllers.testVivaOauthController.path

// === ОСНОВНАЯ ФУНКЦИЯ РОУТЕРА ===
const router = express.Router()

router.use(express.json())

if (!CONFIG.routes[ROUTER_NAME].enabled) {
  router.use((req, res) => {
    const requestId = uuid()
    logger.warn(`[ID запроса: ${requestId}] Роутер '${ROUTER_NAME}' временно недоступен.`)
    res.status(503).send('Temporarily unavailable')
  })
} else {
  router.post(testVivaOauthControllerPath, (req, res) => {
    const requestId = uuid()
    logger.debug(`[ID запроса: ${requestId}] Получен запрос на ${req.path}. Данные запроса: ${JSON.stringify(req.body)}`)
    testVivaOauthController.handleVisit(req, res, requestId)
  })

  logger.info(`[ID запроса: ${uuid()}] Роутер '${ROUTER_NAME}' активирован.`)
}

module.exports = router
