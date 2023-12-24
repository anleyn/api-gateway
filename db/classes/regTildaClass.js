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
const CLASS_NAME = 'regTildaService'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ПОДКЛЮЧЕНИЕ К ФАЙЛУ КОНФИГУРАЦИИ БАЗЫ ДАННЫХ ===
const dbConfig = require(`${PATH_DB_CONFIG}/khtapi.conf`)

// Создание экземпляра Sequelize
const sequelize = new Sequelize(dbConfig)

// === ПОДКЛЮЧЕНИЕ МОДЕЛИ ===
const RegTildaModel = require(`${PATH_MODELS}/regTildaModel.js`)

// === ИНИЦИАЛИЗАЦИЯ ЛОГГЕРА ===
const logger = libLogger.init(CLASS_NAME, DEBUG_LEVEL, DEBUG)

/**
 * Класс для обработки данных регистраций.
 */
/**
 * Класс для обработки данных регистраций.
 */
class RegTilda {
  /**
   * Парсинг cookie-файлов для извлечения параметров.
   * @param {string} cookies - Строка cookie.
   * @returns {Object} - Объект с параметрами.
   */
  static parseCookies (cookies) {
    const params = {}
    cookies.split(';').forEach(cookie => {
      const parts = cookie.split('=')
      const key = parts.shift().trim()
      const value = parts.join('=')
      if (key === 'TILDAUTM') {
        const utmParams = decodeURIComponent(value).split('|||')
        utmParams.forEach(utmParam => {
          const [utmKey, utmValue] = utmParam.split('=')
          if (utmKey && utmValue) {
            params[utmKey.trim()] = utmValue.trim()
          }
        })
      } else if (key === 'akhUserUUID') {
        params.akhUserUUID = value
      }
    })
    return params
  }

  /**
   * Вставляет данные регистрации в базу данных.
   * @param {Object} data - Данные регистрации.
   * @param {Object} headers - Заголовки запроса.
   * @param {string} requestId - Идентификатор запроса для логирования.
   * @returns {Promise<Object>} - Промис с данными созданной записи.
   */
  static async insert (data, headers, requestId) {
    logger.debug(`[ID запроса: ${requestId}] Класс RegTilda активирован`)

    try {
      logger.debug(`[ID запроса: ${requestId}] Данные для вставки: ${JSON.stringify(data)}`)

      // Парсинг и преобразование данных
      const phone = data.Phone ? parseInt(data.Phone.replace(/\D/g, ''), 10) : null
      const accountApplication = data.tranid ? data.tranid.split(':') : []
      const accountID = accountApplication.length > 0 ? parseInt(accountApplication[0], 10) : null
      const applicationID = accountApplication.length > 1 ? parseInt(accountApplication[1], 10) : null
      const formID = data.formid ? parseInt(data.formid.replace('form', ''), 10) : null
      const params = data.COOKIES ? RegTilda.parseCookies(data.COOKIES) : {}

      // Получение URL из заголовка Referer
      const url = headers.referer ? new URL(headers.referer).origin + new URL(headers.referer).pathname : null

      const preparedData = {
        createdAt: new Date(), // текущее время
        updatedAt: new Date(), // текущее время
        uuid: params.akhUserUUID || null,
        url, // URL из заголовка Referer
        params,
        email: data.email || null,
        phone,
        name: data.name || null,
        utm_source: data.utm_source || params.utm_source || null,
        utm_medium: data.utm_medium || params.utm_medium || null,
        utm_campaign: data.utm_campaign || params.utm_campaign || null,
        utm_content: data.utm_content || params.utm_content || null,
        utm_term: data.utm_term || params.utm_term || null,
        reg_id: data.reg_id || null,
        accountID,
        applicationID,
        formID
      }

      logger.debug(`[ID запроса: ${requestId}] Подготовленные данные для записи: ${JSON.stringify(preparedData)}`)

      // Создание записи в базе данных
      const registration = await RegTildaModel.create(preparedData)

      logger.debug(`[ID запроса: ${requestId}] Запись успешно создана: ${JSON.stringify(registration)}`)
      return registration
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
      logger.info('Модель успешно синхронизирована с базой данных.')
    } catch (error) {
      logger.error('Ошибка синхронизации модели с базой данных:', error)
    }
  }
}

module.exports = RegTilda
