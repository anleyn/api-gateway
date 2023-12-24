const path = require('path')
const pathLib = path.join(process.cwd(), '/lib')
const pathConfig = process.env.CONFIG || path.join(process.cwd(), '/config')

// Подключаем библиотеки
const { conf } = require(`${pathLib}/fsrw`)

// Читаем конфиги
const config = conf.read(`${pathConfig}/settings.yml`)

const API = {
  init: function (app) {
    // Проходим по каждому роуту, определенному в конфигурационном файле
    Object.keys(config.routes).forEach(routeName => {
      const routeConfig = config.routes[routeName]

      // Формируем путь к роутеру, учитывая поддиректорию, если она указана
      const routePath = routeConfig.path ? path.join(process.cwd(), routeConfig.path, `${routeName}.js`) : path.join(process.cwd(), '/controllers', `${routeName}.js`)

      // Подключаем роутер
      const routeModule = require(routePath)
      app.use(routeModule)
    })
  },
  allowCORS: (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
  },
  checkKey: (route, keyMap, value) => {
    const keys = keyMap[route] // Получаем массив ключей для данного пути
    if (!keys) { // Если массив ключей не существует
      throw new Error('Access denied: Keyring not found')
    }
    let authSuccess = false // Устанавливаем флаг на false
    keys.forEach(key => {
      if (key === value) { // Сравниваем ключи
        authSuccess = true
      }
    })
    if (!authSuccess) { // Совпадений нет
      throw new Error('Access denied: Invalid auth token')
    }
  }
}

module.exports = {
  API
}
