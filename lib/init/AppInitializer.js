const path = require('path')
const fs = require('fs').promises

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const SERVER_NAME = 'server'
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ЛОГГЕРА ===
const logger = libLogger.init(SERVER_NAME, DEBUG_LEVEL, DEBUG)

/**
 * Объект AppInitializer отвечает за инициализацию приложения.
 */
const AppInitializer = {
  /**
   * Инициализирует роуты приложения на основе конфигурации.
   *
   * @param {Object} app - Экземпляр приложения Express.
   */
  init: async (app) => {
    logger.info('Инициализация роутов приложения...')
    logger.debug('Начало инициализации роутов.')

    for (const routeName of Object.keys(CONFIG.routes)) {
      const routeConfig = CONFIG.routes[routeName]

      if (routeConfig.enabled !== true) {
        logger.warn(`Роутер ${routeName} отключен в конфигурации.`)
        continue
      }

      logger.debug(`Обработка роутера: ${routeName}`)

      // Формирование пути к роутеру
      const routePath = routeConfig.path
        ? path.join(process.cwd(), routeConfig.path, `${routeName}.js`)
        : path.join(process.cwd(), '/routes', `${routeName}.js`)

      logger.debug(`Сформирован путь для подключения роутера ${routeName}: ${routePath}`)

      // Подключение роутера
      try {
        await fs.access(routePath)
        logger.debug(`Файл роутера ${routeName} доступен для чтения.`)

        const routeModule = require(routePath)
        app.use(routeModule)

        logger.info(`Роутер ${routeName} успешно подключен.`)
      } catch (error) {
        logger.error(`Ошибка при загрузке роутера ${routeName}: ${error.message}. Путь: ${routeConfig.path || '/routes'}, Метод: ${routeConfig.method || 'GET'}`)
        logger.debug(`Стек ошибки: ${error.stack}`)
      }
    }

    logger.debug('Инициализация роутеров завершена.')
  }
}

module.exports = AppInitializer
