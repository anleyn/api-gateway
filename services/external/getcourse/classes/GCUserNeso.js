// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_GC_CLASSES = path.join(process.cwd(), '/services/external/getcourse/classes')

const GCUser = require(`${PATH_GC_CLASSES}/GCUser.js`)

/**
 * Класс расширяет GCUser, включает дополнительные поля пользователя.
 */
class GCUserNeso extends GCUser {
  /**
   * Конструктор для создания пользователя NeSo Академии.
   * @param {Object} data Данные пользователя.
   */
  constructor (data) {
    super(data)

    this.user.addfields = {
      Логин_в_Telegram: data.tg_uname || null,
      sb_id: data.sb_id || null,
      sb_link: data.sb_link || null,
      analytics__user_source: data.utm_source || null,
      analytics__user_medium: data.utm_medium || null,
      analytics__user_campaign: data.utm_campaign || null,
      analytics__user_content: data.utm_content || null,
      analytics__user_term: data.utm_term || null,
      analytics__user_group: data.utm_group || null,
      partners__user_gcpc: data.user_gcpc || null
    }
  }
}

module.exports = GCUserNeso
