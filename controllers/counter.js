// Определяем пути
const path = require('path')
const pathLib = path.join(process.cwd(), '/lib')
const pathConfig = process.env.CONFIG || path.join(process.cwd(), '/config')
const pathCounters = path.join(process.cwd(), '/temp/counters.tmp')

// Подключаем библиотеки
const { conf, temp } = require(`${pathLib}/fsrw`)

// Читаем конфиги
const config = conf.read(`${pathConfig}/settings.yml`)

module.exports = async (req, res) => {
  const params = new URLSearchParams(req.url)
  try {
    // Получаем имя и лимит
    const counterName = params.get('counter') || config.route1.counter_default
    const counterLimit = params.get('limit')
    // Получаем текущее значение
    const counterValue = temp.readValue(config.route1.counter_path, counterName)
    // Обработка значения
    if (counterValue < counterLimit) await temp.incrementValue(pathCounters, counterName)
    else await temp.setValue(pathCounters, counterName, 1)
    // Обработка результата
    return String(counterValue)
  } catch (error) {
    // Обработка ошибки
    return error.isTransient ? 503 : 500
  }
}
