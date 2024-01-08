/**
 * Валидация и преобразование телефонного номера.
 * @param {string} phone Телефонный номер для валидации.
 * @returns {string} Преобразованный телефонный номер.
 * @throws {Error} Если формат телефонного номера неверный.
 */
const validatePhone = (phone) => {
  const cleanedPhone = phone.replace(/[^\d+]|(?<=\d)\+|(?<!^)\+/g, '')
  const phoneRegex = /^\+?(\d{1,3})?(\d{10})$/
  const match = cleanedPhone.match(phoneRegex)
  if (!match) {
    throw new Error('Incorrect phone format')
  }
  return match[1] ? match[1] + match[2] : '7' + match[2]
}

/**
 * Валидация адреса электронной почты.
 * @param {string} email Адрес электронной почты для валидации.
 * @returns {string} Адрес электронной почты.
 * @throws {Error} Если формат адреса электронной почты неверный.
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Incorrect email format')
  }
  return email
}

/**
 * Валидация телефонных номеров и адресов электронной почты.
 * @param {string} type Тип валидации ('phone' или 'email').
 * @param {string} value Значение для валидации.
 * @returns {string} Результат валидации.
 * @throws {Error} Если валидация не удалась.
 */
const validateString = (type, value) => {
  switch (type) {
    case 'phone':
      return validatePhone(value)
    case 'email':
      return validateEmail(value)
    default:
      throw new Error('Unknown validation type')
  }
}

module.exports = { validateString }
