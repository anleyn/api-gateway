const winston = require('winston')
const path = require('path')

const PATH_LOG = path.join(process.cwd(), '/logs')

/**
 * Инициализирует логгер.
 * @param {string} name Имя логгера.
 * @param {string} debugLevel Уровень логирования.
 * @param {boolean} isDebug Включен ли режим отладки.
 * @returns {winston.Logger} Экземпляр логгера.
 */
function init (name, debugLevel, isDebug) {
  if (!isDebug) {
    return winston.createLogger({ transports: [] })
  }

  return winston.createLogger({
    level: debugLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    defaultMeta: { source: `${name}` },
    transports: [
      new winston.transports.File({ filename: path.join(PATH_LOG, `${name}.log`) }),
      new winston.transports.File({ filename: path.join(PATH_LOG, 'api.log') })
    ]
  })
}

module.exports = { init }
