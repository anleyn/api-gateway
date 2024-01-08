// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')
const axios = require('axios')
const querystring = require('querystring')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)
const getAppId = require(`${PATH_LIB}/utils/rotateGSheetsAppID.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const SERVICE_NAME = 'fillTableGSService'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(SERVICE_NAME, DEBUG_LEVEL, DEBUG)

/**
 * Формирует URL для HTTPS запроса к Google Apps Script, используя APPID.
 * @async
 * @param {string} strRequestId - Идентификатор запроса для логирования.
 * @param {string} strGId - ID таблицы.
 * @param {string} strGList - Имя таблицы.
 * @param {Object} objOutgoingData - Данные для отправки.
 * @returns {Promise<string>} URL для запроса.
 */
async function prepareData (strRequestId, strGId, strGList, objOutgoingData) {
  try {
    const appId = await getAppId()
    logger.debug(`[ID запроса: ${strRequestId}] APPID: ${appId}`)

    const GId = strGId
    const GList = strGList

    const queryParams = querystring.stringify({
      GId,
      GList,
      DATA: Object.values(objOutgoingData).join(',')
    })

    const url = `https://script.google.com/macros/s/${appId}/exec?${queryParams}`
    logger.debug(`[ID запроса: ${strRequestId}] URL для запроса: ${url}`)

    return url
  } catch (error) {
    logger.error(`[ID запроса: ${strRequestId}] Ошибка: ${error.message}`)
    throw new Error('Ошибка при формировании URL для запроса')
  }
}

/**
 * Выполняет HTTPS запрос к Google Apps Script по указанному URL.
 * @async
 * @param {string} strRequestId - Идентификатор запроса для логирования.
 * @param {string} url - URL для запроса.
 * @returns {Promise<Object>} Обещание, возвращающее данные ответа.
 */
async function pushData (strRequestId, url) {
  try {
    logger.debug(`[ID запроса: ${strRequestId}] Отправляем запрос на URL: ${url}`)
    const response = await axios.get(url)

    // Обработка ошибок, связанных с Google Apps Script
    if (response.data.startsWith('Error')) {
      const errorMessage = response.data.substring(7)
      logger.error(`[ID запроса: ${strRequestId}] Ошибка заполнения Google таблицы: ${errorMessage}`)
      throw new Error(errorMessage)
    }

    logger.debug(`[ID запроса: ${strRequestId}] Ответ от Google: ${JSON.stringify(response.data)}`)
    return response.data
  } catch (error) {
    // Передача оригинального сообщения об ошибке при HTTP-запросе
    logger.error(`[ID запроса: ${strRequestId}] Ошибка при выполнении запроса: ${error.message}`)
    throw error
  }
}

module.exports.handle = async (strRequestId, strGId, strGList, objOutgoingData) => {
  logger.info(`[ID запроса: ${strRequestId}] Сервис ${SERVICE_NAME} активирован, обрабатываемые данные: ${JSON.stringify(objOutgoingData)}`)
  logger.debug(`[ID запроса: ${strRequestId}] ID таблицы для заполнения: ${strGId}`)
  logger.debug(`[ID запроса: ${strRequestId}] Название листа для заполнения: ${strGList}`)

  const startTime = Date.now()

  try {
    logger.debug(`[ID запроса: ${strRequestId}] Вызываем функцию prepareData для формирования URL для запроса`)
    const url = await prepareData(strRequestId, strGId, strGList, objOutgoingData)
    logger.debug(`[ID запроса: ${strRequestId}] Вызываем функцию pushData для выполнения HTTPS запроса к Google Apps Script`)
    const responseData = await pushData(strRequestId, url)
    logger.debug(`[ID запроса: ${strRequestId}] Ответ от Google Apps Script: ${JSON.stringify(responseData)}`)

    const endTime = Date.now()
    logger.info(`[ID запроса: ${strRequestId}] Запрос успешно обработан. Время обработки: ${endTime - startTime}ms`)
    return responseData
  } catch (error) {
    const errorTime = Date.now()
    logger.error(`[ID запроса: ${strRequestId}] Ошибка при отправке данных в Google Apps Script: ${error.message}, Время возникновения ошибки: ${errorTime}`)
    logger.error(`Детали ошибки: ${error.stack}`)
    throw error
  }
}
