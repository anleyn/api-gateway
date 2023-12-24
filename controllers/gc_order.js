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
    const gcObjDeal = {
      user: {
        email: params.get('email'),
        phone: params.get('phone') || null,
        first_name: params.get('firstName') || null,
        last_name: params.get('lastName') || null,
        addfields: {
          Логин_в_Telegram: params.get('uname') || null,
          vk_id: params.get('vk_id') || null,
          sb_id: params.get('sb_id') || null,
          sb_user_dialog_link: params.get('sb_link') || null
        }
      },
      deal: {
        offer_code: params.get('offer') || null,
        quantity: 1,
        deal_cost: params.get('cost') || '0',
        deal_status: 'new',
        addfields: {
          deal_utm_source: params.get('utm_source') || null,
          deal_utm_medium: params.get('utm_medium') || null,
          deal_utm_campaign: params.get('utm_campaign') || null,
          deal_utm_content: params.get('utm_content') || null,
          deal_utm_term: params.get('utm_term') || null,
          deal_gcpc: params.get('gcpc') || null,
          education_id: params.get('ed_id') || null,
          education_date: params.get('date') || null,
          education_channel: params.get('channel') || null,
          service1: params.get('service1') || null,
          service2: params.get('service2') || null,
          service3: params.get('service3') || null,
          service4: params.get('service4') || null,
          service5: params.get('service5') || null,
          from_api: true
        }
      },
      system: {
        refresh_if_exists: 1,
        return_payment_link: 1,
        return_deal_number: 1
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

    const gcCleanDeal = filterObject(gcObjDeal)
    const gcDealData = JSON.stringify(gcCleanDeal)
    const encodedData = Buffer.from(gcDealData).toString('base64')

    // Конструктор параметров для запроса к GetCourse
    const postData = querystring.stringify({
      action: 'add',
      key: GC_KEY,
      params: encodedData
    })

    // Параметры HTTPS-запроса к GetCourse
    const requestOptions = {
      hostname: GC_HOST,
      path: '/pl/api/deals',
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
        reject('unexpected error')
      })

      requestPost.write(postData)
      requestPost.end()
    })

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
      console.log(`payment_link: ${response.result.payment_link}`);
      // Возвращаем ссылку на страницу оплаты
      return response.result.payment_link;
    }
  } catch (error) {
    // Обработка ошибки
    return "error";
  }
}
