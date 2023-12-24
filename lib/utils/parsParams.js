/**
 * Преобразует строку параметров в объект JSON.
 * Если параметры уже представлены в формате объекта, возвращает их как есть.
 * @param {string|object} params Строка параметров или объект.
 * @returns {object} Преобразованный объект JSON.
 */
export const parseParams = (params) => {
  if (typeof params === 'string') {
    try {
      return JSON.parse(params)
    } catch (error) {
      return {}
    }
  } else if (typeof params === 'object') {
    return params
  } else {
    return {}
  }
}
