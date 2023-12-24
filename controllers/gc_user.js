// Определяем пути
const path = require('path')
const pathLib = path.join(process.cwd(), '/lib')
const pathConfig = path.join(process.cwd(), '/config')

// Подключаем библиотеки
const { conf } = require(`${pathLib}/fsrw`)
const { datetime } = require(`${pathLib}/datetime`)

// Читаем конфиги
const config = conf.read(`${pathConfig}/settings.yml`)
const mode = config.application.mode

// Подключаем модули
const https = require('https')
const querystring = require('querystring')

module.exports = async (req, res, logger, uniqueId) => {
  // Константы запроса
  const params = new URLSearchParams(req.url)
  const timeStart = datetime.req(req)

  // Выбираем получателя заказа
  const target = mode === 'test' ? 'test' : params.get('target')
  const GC_HOST = config.gc[target].domain
  const GC_KEY = process.env[config.gc[target].key]

  try {
    // Формирование тела POST-запроса в JSON-формате и его кодировка в base64
    const objGcUser = {
      user: {
        email: params.get('email') || null,
        phone: params.get('phone') || null,
        first_name: params.get('firstName') || null,
        last_name: params.get('lastName') || null,
        addfields: {
          Логин_в_Telegram: params.get('telegram') || null,
          sb_id: params.get('sb_id') || null,
          sb_link: params.get('sb_link') || null,
          sb_project: params.get('sb_project') || null,
          analytics__last_reg: params.get('last_reg') || null,
          analytics__user_source: params.get('utm_source') || null,
          analytics__user_medium: params.get('utm_medium') || null,
          analytics__user_campaign: params.get('utm_campaign') || null,
          analytics__user_term: params.get('utm_term') || null,
          partners__user_gcpc: params.get('gcpc') || null
        }
      },
      system: {
        refresh_if_exists: 1
      }
    }

    // Фильтр пустых строк и некорректных значений
    function filterObject (obj) {
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') filterObject(obj[key])
        else if (obj[key] === undefined || obj[key] === null || obj[key] === '') delete obj[key]
      })
      return obj
    };

    const objGcUserFiltred = filterObject(objGcUser)
    const jsonGcUserFiltred = JSON.stringify(objGcUserFiltred)
    const encodedData = Buffer.from(jsonGcUserFiltred).toString('base64')

    // Конструктор параметров для запроса к GetCourse
    const postData = querystring.stringify({
      action: 'add',
      key: GC_KEY,
      params: encodedData
    })

    // Параметры HTTPS-запроса к GetCourse
    const requestOptions = {
      hostname: GC_HOST,
      path: '/pl/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    }

    // Логируем информацию о исходящем POST-запросе
    logger.info(`${timeStart}, ${uniqueId}, POST ${requestOptions.hostname}${requestOptions.path} is sending...`, {
      outgoingPostRequest: true
    })

    // HTTPS-запрос
    const response = await new Promise((resolve, reject) => {
      const requestPost = https.request(requestOptions, resPost => {
        let responseData = ''
        resPost.on('data', (chunk) => {
          responseData += chunk
        })
        resPost.on('end', () => {
          try {
            resolve(JSON.parse(responseData))
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData}`))
          }
        })
      })
      requestPost.on('error', (error) => {
        reject(error)
      })

      requestPost.write(postData)
      requestPost.end()
    })

    // Логируем сам объект response
    if (!response.success) {
      logger.info(`Response from GC: ${JSON.stringify(response)}`)
    }

    // Обработка ошибки в ответе GC
    if (!response.result.success) {
      logger.error(`${timeStart}, ${uniqueId}, POST response errored: ${JSON.stringify(response.result.error_message)} DATA: ${postData}`, {
        reqTime: timeStart,
        reqId: uniqueId,
        postRequestBody: true
      })
      throw new Error(JSON.stringify(response.result.error_message))
    } else {
      // Логируем успешный POST-запрос
      logger.info(`${timeStart}, ${uniqueId}, POST sending success. DATA: ${postData}`, {
        reqTime: timeStart,
        reqId: uniqueId,
        postRequestBody: true
      })
    }
    return '200'
  } catch (error) {
    // Логируем детали ошибки
    logger.error(`${timeStart}, ${uniqueId}, POST request failed: ${error.message}`, {
      stack: error.stack
    })
    // Обработка ошибки
    return error.isTransient ? 503 : 500
  }
}
