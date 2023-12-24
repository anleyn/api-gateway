// Определяем пути
const path = require('path')
const pathLib = path.join(process.cwd(), '/lib')
const pathConfig = path.join(process.cwd(), '/config')

// Подключаем библиотеки
const { conf } = require(`${pathLib}/fsrw`)
// const { datetime } = require(`${pathLib}/datetime`)

// Читаем конфиги
const config = conf.read(`${pathConfig}/settings.yml`)
// const mode = config.application.mode

// Подключаем модули
const axios = require('axios')
const querystring = require('querystring')

module.exports = async (req, res, logger, uniqueId) => {
  // Константы и переменные
  const params = new URLSearchParams(req.url)

  const timeZone = config.application.timeZone
  const newDate = new Date()
  const savedDate = new Intl.DateTimeFormat('ru-RU', { timeZone, day: '2-digit', month: '2-digit', year: 'numeric' }).format(newDate).replace(/\//g, '.')
  const savedTime = new Intl.DateTimeFormat('ru-RU', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(newDate)

  const firstName = params.get('first_name') || ''
  const lastName = params.get('last_name') || ''
  const fullName = firstName && lastName ? firstName + ' ' + lastName : firstName || lastName

  const SSID = params.get('gsheet_id') || null
  const SHEET = params.get('gsheet_list') || null

  const APPID = 'AKfycbxt1JbVAQ7VkLY87HZHmqa_CHoAW59OaZ6LOlbC2ByeiBrkGgvZZnwjqWPkaGRpDPpH'

  let arrData

  // Устанавливаем режим работы
  // const target = mode === 'test' ? 'test' : params.get('target')

  try {
    if (SHEET === 'reg_gc') {
      arrData = [
        savedDate,
        savedTime,
        params.get('sb_id') || null,
        params.get('gc_id') || null,
        fullName,
        params.get('email') || null,
        params.get('phone') || null,
        params.get('utm_source') || null,
        params.get('utm_medium') || null,
        params.get('utm_campaign') || null,
        params.get('utm_term') || null,
        params.get('utm_content') || null,
        params.get('utm_group') || null,
        params.get('ed_id') || null,
        params.get('created_at') || null
      ].join(',')
    } else if (SHEET === 'reg_sb') {
      arrData = [
        savedDate,
        savedTime,
        params.get('sb_id') || null,
        params.get('email') || null,
        params.get('phone') || null,
        params.get('telegram') || null,
        params.get('instagram') || null,
        params.get('utm_source') || null,
        params.get('utm_medium') || null,
        params.get('utm_campaign') || null,
        params.get('utm_content') || null,
        params.get('utm_term') || null,
        params.get('utm_group') || null,
        params.get('ed_id') || null,
        params.get('date_of_creation') || null
      ].join(',')
    }

    // Конструктор параметров для запроса к Google APP
    const getParams = querystring.stringify({
      SSID,
      SHEET,
      DATA: arrData
    })

    // Формирование исходящего GET-запроса
    const url = `https://script.google.com/macros/s/${APPID}/exec?${getParams}`

    // HTTPS-запрос к Google APP
    try {
      const response = await axios.get(url)
      return `${response.data}`
    } catch (error) {
      console.error(`HTTPS request error: ${error.message}`)
      throw new Error('TBD error message or object')
    }
  } catch (error) {
    // Обработка ошибки
    return error.isTransient ? 503 : 500
  }
}
