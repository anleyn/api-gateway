const fs = require('fs')
const yaml = require('js-yaml')

/**
 * Читает YAML конфигурационный файл.
 * @param {string} filePath Путь к файлу конфигурации.
 * @returns {Object|Error} Объект конфигурации, полученный из файла YAML, или объект ошибки.
 */
const read = (filePath) => {
  try {
    const config = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' })
    return yaml.load(config)
  } catch (err) {
    return new Error(`Error reading config file: ${err.message}`)
  }
}

module.exports = { read }
