/**
 * Объект `CORSHandler` содержит методы для настройки политики CORS (Cross-Origin Resource Sharing).
 */
const CORSHandler = {
  /**
   * Устанавливает заголовки CORS для входящих запросов.
   *
   * Этот метод устанавливает необходимые заголовки для поддержки политики CORS.
   * - 'Access-Control-Allow-Origin' со значением '*', позволяющее доступ с любого источника.
   * - 'Access-Control-Allow-Methods' со списком поддерживаемых методов HTTP.
   * - 'Access-Control-Allow-Headers' со списком разрешенных заголовков.
   *
   * @param {Object} req - Объект запроса Express.js.
   * @param {Object} res - Объект ответа Express.js.
   * @param {Function} next - Callback функция для продолжения цепочки middleware.
   */
  allowCORS: (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, key')

    // Обрабатываем предварительные запросы (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    next()
  }
}

module.exports = CORSHandler
