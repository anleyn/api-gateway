// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')
const https = require('https')
const querystring = require('querystring')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_LIB = path.join(process.cwd(), '/lib')
const PATH_CONFIG = path.join(process.cwd(), '/config')

// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
const libConfig = require(`${PATH_LIB}/libConfig.js`)
const libLogger = require(`${PATH_LIB}/libLogger.js`)

// === КОНСТАНТЫ: КОНФИГУРАЦИЯ ===
const SERVICE_NAME = 'orderGCService'
const CONFIG = libConfig.read(`${PATH_CONFIG}/settings.yml`)
const DEBUG = CONFIG.application.debug
const DEBUG_LEVEL = CONFIG.application.debugLevel

// === ИНИЦИАЛИЗАЦИЯ ОБЪЕКТОВ И ФУНКЦИЙ ===
const logger = libLogger.init(SERVICE_NAME, DEBUG_LEVEL, DEBUG)

module.exports.handle = async (strRequestId, strClient, objFilteredOrderData) => {
  logger.info(`[ID запроса: ${strRequestId}] Сервис orderGCService активирован, обрабатываемые данные: ${JSON.stringify(objFilteredOrderData)}`)
  /**
   * FIXME: Что за херня в логах? Надо исправить и проверить остальные сервисы.
   */
  logger.debug(`Начало функции handle. requestId: ${strRequestId}, Тип requestId: ${typeof strRequestId}`)

  const startTime = Date.now()

  logger.debug(`[ID запроса: ${strRequestId}] Читаем данные из конфига для клиента ${strClient}`)
  const GC_HOST = CONFIG.environment[`gc-${strClient}`].domain
  logger.debug(`[ID запроса: ${strRequestId}] Домен GC: ${GC_HOST}`)
  logger.debug(`[ID запроса: ${strRequestId}] Читаем данные из переменных окружения для клиента ${strClient}`)
  const GC_KEY = process.env[CONFIG[`gc-${strClient}`].key]
  logger.debug(`[ID запроса: ${strRequestId}] Ключ GC: ${GC_KEY}`)

  logger.debug(`[ID запроса: ${strRequestId}] Формируем тело POST-запроса в JSON-формате и его кодировка в base64`)
  const strOrderData = JSON.stringify(objFilteredOrderData)
  logger.debug(`[ID запроса: ${strRequestId}] Данные для POST-запроса: ${strOrderData}`)
  const strEncodedData = Buffer.from(strOrderData).toString('base64')
  logger.debug(`[ID запроса: ${strRequestId}] Данные для POST-запроса в base64: ${strEncodedData}`)

  logger.debug(`[ID запроса: ${strRequestId}] Формируем тело POST-запроса в формате x-www-form-urlencoded`)
  const strPostData = querystring.stringify({
    action: 'add',
    key: GC_KEY,
    params: strEncodedData
  })
  logger.debug(`[ID запроса: ${strRequestId}] Данные для POST-запроса в формате x-www-form-urlencoded: ${strPostData}`)

  logger.debug(`[ID запроса: ${strRequestId}] Формируем опции для POST-запроса`)
  const objRequestOptions = {
    hostname: GC_HOST,
    path: '/pl/api/deals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': strPostData.length
    }
  }
  logger.debug(`[ID запроса: ${strRequestId}] Опции для POST-запроса: ${JSON.stringify(objRequestOptions)}`)

  try {
    logger.debug(`[ID запроса: ${strRequestId}] Начинаем обработку POST-запроса в GC`)
    const strGCResponse = await new Promise((resolve, reject) => {
      const requestPost = https.request(objRequestOptions, resPost => {
        let responseData = ''
        resPost.on('data', (chunk) => {
          responseData += chunk
        })
        resPost.on('end', () => {
          try {
            logger.debug(`[ID запроса: ${strRequestId}] Ответ от GC: ${responseData}`)
            resolve(JSON.parse(responseData))
          } catch (error) {
            logger.error(`[ID запроса: ${strRequestId}] Ошибка при обработке ответа от GC: ${error.message}`)
            reject(new Error(`Invalid JSON response from GC: ${responseData}`))
          }
        })
      })

      requestPost.on('error', (error) => {
        logger.error(`[ID запроса: ${strRequestId}] Ошибка при отправке POST-запроса в GC: ${error.message}`)
        reject(new Error(`Request to GC failed with error: ${error.message}`))
      })

      logger.debug(`[ID запроса: ${strRequestId}] Отправляем POST-запрос в GC: ${JSON.stringify(objRequestOptions)}`)
      requestPost.write(strPostData)
      requestPost.end()
    })

    const endTime = Date.now()
    logger.debug(`[ID запроса: ${strRequestId}] Запрос успешно обработан. Время обработки: ${endTime - startTime}ms`)
    return strGCResponse
  } catch (error) {
    const errorTime = Date.now()
    logger.error(`[ID запроса: ${strRequestId}] Ошибка при обработке посещения: ${error.message}, Время возникновения ошибки: ${errorTime}`)
    logger.error(`Детали ошибки: ${error.stack}`)
    throw error
  }
}
