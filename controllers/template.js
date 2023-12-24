const path = require('path')

// Пути к библиотекам и конфигурациям
const LIBRARY_PATH = path.join(process.cwd(), '/lib')
const CONFIG_PATH = path.join(process.cwd(), '/config')

// Подключение библиотеки для работы с файлами
const { conf } = require(`${LIBRARY_PATH}/fsrw`)

// Чтение конфигурационного файла
const config = conf.read(`${CONFIG_PATH}/settings.yml`)

/**
 * Основная функция контроллера.
 * @param {express.Request} request - Объект запроса.
 * @param {express.Response} response - Объект ответа.
 * @param {object} logger - Логгер.
 * @param {string} requestId - Уникальный идентификатор запроса.
 * @returns {Promise<number|string>} Статус ответа или результат выполнения.
 */
module.exports = async (request, response, logger, requestId) => {
  const startTime = Date.now()

  try {
    // Логика обработки запроса

    const result = 'Результат выполнения'
    logger.info(`[Controller] Start: ${startTime}, ID: ${requestId}, Method: ${request.method}, Path: ${request.path}, Duration: ${Date.now() - startTime} ms, Result: ${result}.`)
    return result
  } catch (error) {
    logger.error(`[Controller] Start: ${startTime}, ID: ${requestId}, Error in Method: ${request.method}, Path: ${request.path}, Error: ${error.message}`)
    return error.isTransient ? 503 : 500
  }
}
