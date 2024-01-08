const path = require('path')
const os = require('os')
const express = require('express')
const https = require('https')
const cluster = require('cluster')

// === ОПРЕДЕЛЕНИЕ ПУТЕЙ ===
const PATH_LIB = path.join(process.cwd(), 'lib')
const PATH_CONFIG = path.join(process.cwd(), 'config')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)
const dateToString = require(`${PATH_LIB}/utils/dateToString.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const SERVER_NAME = 'server'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const MODE = CONFIG.application.mode
const PORT = CONFIG.application.port
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ЛОГГЕРА ===
const logger = libLogger.init(SERVER_NAME, DEBUG_LEVEL, DEBUG)

// === ПОЛУЧЕНИЕ КОЛИЧЕСТВА ЛОГИЧЕСКИХ ПРОЦЕССОРОВ ===
const numCPUs = os.cpus().length

// === ИНИЦИАЛИЗАЦИЯ EXPRESS ===
const app = express()

// Инициализация модулей
const CORSHandler = require(`${PATH_LIB}/init/CORSHandler.js`)
app.use(CORSHandler.allowCORS)
logger.info(`[${dateToString.now()}] CORSHandler успешно загружен и настроен.`)

const SSLInitializer = require(`${PATH_LIB}/init/SSLInitializer.js`)
const options = SSLInitializer.read(MODE)
logger.info(`[${dateToString.now()}] SSL-сертификаты успешно прочитаны для режима '${MODE}'.`)

const AppInitializer = require(`${PATH_LIB}/init/AppInitializer.js`)
AppInitializer.init(app).then(() => {
  logger.info(`[${dateToString.now()}] Модули приложения успешно инициализированы и роуты настроены.`)
}).catch(err => {
  logger.error(`[${dateToString.now()}] Ошибка при инициализации модулей приложения: ${err.message}`)
})

// === ОПРЕДЕЛЕНИЕ МАРШРУТОВ ===
app.get('/', (req, res) => {
  res.send('API is available')
})

/**
 * Запускает сервер.
 */
function startServer () {
  if (MODE === 'test') {
    // Запуск сервера в тестовом режиме без кластеризации
    logger.info(`[${dateToString.now()}] Запуск сервера в тестовом режиме на порту ${PORT}.`)
    const server = https.createServer(options, app)
    server.listen(PORT, () => {
      logger.info(`[${dateToString.now()}] Тестовый сервер запущен и слушает порт ${PORT}.`)
    })
    server.on('error', (error) => {
      logger.error(`[${dateToString.now()}] Ошибка при запуске тестового сервера: ${error.message}`)
    })
  } else {
    // Запуск сервера с использованием кластеризации
    if (cluster.isPrimary) {
      logger.info(`[${dateToString.now()}] Запуск сервера начался - Master ${process.pid} запускается.`)

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
      }

      cluster.on('online', worker => {
        logger.info(`[${dateToString.now()}] Worker ${worker.process.pid} запущен и находится в режиме онлайн.`)
      })

      process.on('SIGINT', handleSigint)
    } else {
      const server = https.createServer(options, app)
      server.listen(PORT, () => {
        logger.info(`[${dateToString.now()}] Worker ${process.pid} успешно запущен и слушает порт ${PORT}.`)
        process.send({ ready: true, worker: cluster.worker.id })
      })

      server.on('error', (error) => {
        logger.error(`[${dateToString.now()}] Ошибка при запуске сервера: ${error.message}`)
      })
    }
  }
}

/**
 * Обрабатывает сигнал SIGINT для корректного завершения работы сервера.
 */
function handleSigint () {
  logger.info(`[${dateToString.now()}] Master ${process.pid} получил сигнал SIGINT.`)
  logger.info(`[${dateToString.now()}] Начинается остановка кластеризированного сервиса...`)

  cluster.disconnect(() => {
    logger.info(`[${dateToString.now()}] Сервис успешно остановлен.`)
    process.exit(0)
  })

  setTimeout(() => {
    logger.error(`[${dateToString.now()}] Не удалось корректно остановить сервис. Кластер все еще работает на порту ${PORT}. Производится принудительное завершение.`)
    process.exit(1)
  }, 10000)
}

startServer()
