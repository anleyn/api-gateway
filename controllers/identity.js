// Определяем пути
const path = require('path')
const pathLib = path.join(process.cwd(), '/lib')

// Подключаем библиотеки
const { datetime } = require(`${pathLib}/datetime`)

module.exports = async (req, res, logger, uniqueId) => {
  // Константы запроса
  const timeStart = datetime.req(req)
  const params = new URLSearchParams(req.url)
  const result = params.get('param')

  try {
    if (!result) {
      logger.error(`${timeStart}, ${uniqueId}, param "PARAM" not founded`, {
        reqTime: timeStart,
        reqId: uniqueId
      })
      throw new Error(JSON.stringify('Param not found'))
    }

    logger.info(`${timeStart}, ${uniqueId}, Get param: ${result}`, {
      reqTime: timeStart,
      reqId: uniqueId
    })

    return result
  } catch (error) {
    // Логируем детали ошибки
    logger.error(`${timeStart}, ${uniqueId}, ${error.message}`, {
      stack: error.stack
    })
    // Обработка ошибки
    return error.isTransient ? 503 : 500
  }
}
