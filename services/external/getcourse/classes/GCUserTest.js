// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_GC_CLASSES = path.join(process.cwd(), '/services/external/getcourse/classes')

const GCUser = require(`${PATH_GC_CLASSES}/GCUser.js`)

/**
 * Класс расширяет GCUser, добавляя специфические поля пользователя.
 */
class GCUserTest extends GCUser {
  /**
   * Конструктор для создания расширенного пользователя.
   * @param {Object} data Данные пользователя.
   */
  constructor (data) {
    super(data)

    this.user.addfields = {
      Логин_в_Telegram: data.uname || null,
      vk_id: data.vk_id || null,
      sb_id: data.sb_id || null,
      sb_user_dialog_link: data.sb_link || null
    }
  }
}

module.exports = GCUserTest
