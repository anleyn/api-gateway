const path = require('path')
const Sequelize = require('sequelize')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_MODELS = path.join(process.cwd(), '/db/models')
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')
const PATH_DB_CONFIG = path.join(process.cwd(), '/db/config')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libLogger = require(`${PATH_LIB}/libLogger.js`)
const libConfig = require(`${PATH_LIB}/libConfig.js`)

// === КОНФИГУРАЦИЯ ===
const CLASS_NAME = 'visitTildaService'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ПОДКЛЮЧЕНИЕ К ФАЙЛУ КОНФИГУРАЦИИ БАЗЫ ДАННЫХ ===
const dbConfig = require(`${PATH_DB_CONFIG}/khtapi.conf`)

// Создание экземпляра Sequelize
const sequelize = new Sequelize(dbConfig)

// === ПОДКЛЮЧЕНИЕ МОДЕЛИ ===
const VisitTildaModel = require(`${PATH_MODELS}/visitTildaModel.js`)

// === ИНИЦИАЛИЗАЦИЯ ЛОГГЕРА ===
const logger = libLogger.init(CLASS_NAME, DEBUG_LEVEL, DEBUG)

/**
 * Класс для обработки данных посещений сайта.
 */
class VisitTilda {
  /**
   * Вставляет данные о посещении в базу данных.
   * @param {Object} data - Данные о посещении.
   * @param {string} requestId - Идентификатор запроса для логирования.
   * @returns {Promise<Object>} - Промис с данными созданной записи.
   */
  static async insert (data, requestId) {
    logger.debug(`[ID запроса: ${requestId}] Класс VisitTilda активирован`)

    try {
      logger.debug(`[ID запроса: ${requestId}] Данные для вставки: ${JSON.stringify(data)}`)

      // Проверка входных данных
      if (!data || typeof data !== 'object') {
        throw new Error('Неверный формат входных данных')
      }

      // Измененная логика проверки jsonParams
      let jsonParams = {}
      if (data.params && typeof data.params === 'object' && !Array.isArray(data.params)) {
        jsonParams = data.params // Если params уже объект, используем его напрямую
      } else if (typeof data.params === 'string') {
        jsonParams = JSON.parse(data.params) // Если params строка, парсим ее
      } else {
        throw new Error('Неверный формат данных jsonParams')
      }

      const preparedData = {
        uuid: data.uuid, // UUID
        url: data.url.split('?')[0], // Строка (URL)
        params: jsonParams, // JSONB (Параметры посещения)
        utm_source: jsonParams.utm_source || null, // Строка или null (UTM-источник)
        utm_medium: jsonParams.utm_medium || null, // Строка или null (UTM-канал)
        utm_campaign: jsonParams.utm_campaign || null, // Строка или null (UTM-кампания)
        utm_term: jsonParams.utm_term || null, // Строка или null (UTM-термин)
        utm_content: jsonParams.utm_content || null // Строка или null (UTM-контент)
      }

      logger.debug(`[ID запроса: ${requestId}] Подготовленные данные для записи:
        uuid: string (${preparedData.uuid}), // Ожидаемый тип: UUID
        url: string (${preparedData.url}), // Ожидаемый тип: Строка (URL)
        params: object (${JSON.stringify(preparedData.params)}), // Ожидаемый тип: JSONB (Параметры посещения)
        utm_source: string or null (${preparedData.utm_source || 'null'}), // Ожидаемый тип: Строка или null (UTM-источник)
        utm_medium: string or null (${preparedData.utm_medium || 'null'}), // Ожидаемый тип: Строка или null (UTM-канал)
        utm_campaign: string or null (${preparedData.utm_campaign || 'null'}), // Ожидаемый тип: Строка или null (UTM-кампания)
        utm_term: string or null (${preparedData.utm_term || 'null'}), // Ожидаемый тип: Строка или null (UTM-термин)
        utm_content: string or null (${preparedData.utm_content || 'null'}), // Ожидаемый тип: Строка или null (UTM-контент)
      `)

      // Создание записи в базе данных
      const visit = await VisitTildaModel.create(preparedData)

      logger.debug(`[ID запроса: ${requestId}] Запись успешно создана: ${JSON.stringify(visit)}`)
      return visit
    } catch (error) {
      logger.error(`[ID запроса: ${requestId}] Ошибка: ${error.message}`)
      throw error
    }
  }

  /**
   * Метод для синхронизации модели с базой данных.
   */
  static async syncModel () {
    try {
      await sequelize.sync()
      console.log('Модель успешно синхронизирована с базой данных.')
    } catch (error) {
      console.error('Ошибка синхронизации модели с базой данных:', error)
    }
  }
}

module.exports = VisitTilda
