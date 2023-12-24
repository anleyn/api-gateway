/**
 * Форматирует объект даты в строку с указанием дня, месяца, года, часов, минут и секунд.
 * Дата форматируется в формате `DD/MM/YYYY HH:mm:ss`.
 *
 * @param {Date} date - Объект даты, который нужно отформатировать.
 * @returns {string} Строка, представляющая отформатированную дату и время.
 */
const getFormattedTime = date => {
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear().toString()
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

/**
 * Объект `datetime` содержит методы для работы с датой и временем.
 */
const datetime = {
  /**
   * Возвращает текущее время, скорректированное с учетом часового пояса GMT+3.
   * Время форматируется в формате `DD/MM/YYYY HH:mm:ss`.
   *
   * @returns {string} Строка, представляющая текущее время.
   */
  now: () => {
    const now = new Date()
    now.setHours(now.getHours() + 3) // GMT+3
    return getFormattedTime(now)
  },

  /**
   * Записывает текущее время в переданный объект запроса (req) и возвращает его в отформатированном виде.
   * Время форматируется в формате `DD/MM/YYYY HH:mm:ss`.
   *
   * @param {Object} req - Объект запроса, в который будет добавлено текущее время.
   * @returns {string} Отформатированная строка времени начала запроса.
   */
  req: req => {
    req.timeStart = new Date()
    req.timeStart.setHours(req.timeStart.getHours() + 3) // GMT+3
    return getFormattedTime(req.timeStart)
  }
}

module.exports = datetime
