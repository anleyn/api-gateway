// Определяем пути
const path = require('path')
const pathLib = path.join(process.cwd(), '/lib')
const pathConfig = process.env.CONFIG || path.join(process.cwd(), '/config')
const pathCounters = path.join(process.cwd(), '/temp/counters.tmp')

// Подключаем библиотеки
const { conf, temp, file } = require(`${pathLib}/fsrw`)

// Читаем конфиги
const config = conf.read(`${pathConfig}/settings.yml`)

module.exports = async (req, res) => {
  const params = new URLSearchParams(req.url)
  try {
    // Определяем счётчик и количество пинкодов
    const counterName = config.route6.counter_name
    const counterPath = config.route6.counter_path
    const pinsLimit = config.route6.pins_limit
    // Получаем текущее значение
    const counterValue = temp.readValue(counterPath, counterName)
    if (counterValue < pinsLimit) {
      await temp.incrementValue(pathCounters, counterName);
    } else {
      throw new Error('Counter value has reached or exceeded the pin limit');
    }
    // Получение значения пин-кода
    const pinPath = path.join(process.cwd(), config.route6.pins_path)
    const pinValue = await file.readLine(pinPath, counterValue)
    return String(pinValue)
  } catch (error) {
    // Обработка ошибки
    return error.isTransient ? 503 : 500
  }
}
