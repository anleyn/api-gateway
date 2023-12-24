const path = require('path')
const axios = require('axios')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const SERVICE_NAME = 'testVivaOauthService'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(SERVICE_NAME, DEBUG_LEVEL, DEBUG)

// OAuth credentials
const CLIENT_ID = 'ywbroj98njr34egc3muepz9tgw5w9waodu6whkva123v1.apps.vivapayments.com'
const CLIENT_SECRET = 'o5HgP0vfH3u8hxibpNtG5N277jGLzD'

/**
 * Получает токен доступа через OAuth.
 */
async function getOAuthToken () {
  logger.debug('Начало функции getOAuthToken')
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  try {
    const response = await axios.post('https://demo-accounts.vivapayments.com/connect/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    logger.debug(`Токен получен: ${response.data.access_token}`)
    return response.data.access_token
  } catch (error) {
    logger.error(`Ошибка при получении токена: ${error.message}`)
    throw error
  }
}

/**
 * Создает заказ на оплату.
 *
 * @param {string} accessToken - Токен доступа.
 */
async function createPaymentOrder (accessToken) {
  logger.debug(`Начало функции createPaymentOrder с accessToken: ${accessToken}`)
  const url = 'https://demo-api.vivapayments.com/checkout/v2/orders'
  const orderDetails = {
    amount: 5000, // Сумма в минимальных единицах валюты (например, центы)
    customerTrns: 'Тестовый заказ',
    customer: {
      email: 'customer@example.com',
      fullName: 'Иван Иванов',
      phone: '6900000000',
      countryCode: 'GR',
      requestLang: 'el-GR'
    }
    // Другие параметры по необходимости
  }
  logger.debug(`Детали заказа: ${JSON.stringify(orderDetails)}`)
  try {
    const response = await axios.post(url, orderDetails, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    logger.debug(`Заказ создан: ${JSON.stringify(response.data)}`)
    return response.data
  } catch (error) {
    logger.error(`Ошибка при создании заказа: ${error.message}`)
    throw error
  }
}

/**
 * Обрабатывает данные о посещении и создает запись в базе данных.
 *
 * @param {string} requestId - Идентификатор запроса для логирования.
 * @param {Object} visitData - Данные о посещении.
 */
module.exports.processVisit = async (requestId, visitData) => {
  logger.debug(`Начало функции processVisit. requestId: ${requestId}, Тип requestId: ${typeof requestId}`)
  logger.debug(`Переданные данные о посещении: ${JSON.stringify(visitData)}, Тип visitData: ${typeof visitData}`)

  try {
    const startTime = Date.now()
    const accessToken = await getOAuthToken()
    logger.debug(`[ID запроса: ${requestId}] Полученный токен доступа: ${accessToken}`)

    const order = await createPaymentOrder(accessToken)
    logger.debug(`[ID запроса: ${requestId}] Данные созданного заказа: ${JSON.stringify(order)}`)

    const paymentUrl = order.orderCode // Предполагается, что API возвращает orderCode для доступа к платежу
    logger.debug(`[ID запроса: ${requestId}] Ссылка на оплату: ${paymentUrl}`)

    const endTime = Date.now()
    logger.debug(`[ID запроса: ${requestId}] Обработка завершена. Время выполнения: ${endTime - startTime}ms`)

    return paymentUrl
  } catch (error) {
    const errorTime = Date.now()
    logger.error(`[ID запроса: ${requestId}] Ошибка при обработке: ${error.message}, Время возникновения ошибки: ${errorTime}`)
    logger.error(`Детали ошибки: ${error.stack}`)
    throw error
  }
}
