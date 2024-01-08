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
      // Переключатели
      Тестирование_воронок: data.test_funnels || null,
      // Основные
      Логин_в_Telegram: data.tg_uname || null,
      sb_id: data.sb_id || null,
      sb_project: data.sb_project || null,
      sb_link: data.sb_link || null,
      // Обучение
      p004_form: data.p004_form || null,
      p004_channel: data.p004_channel || null,
      p004_mentor: data.p004_mentor || null,
      p004_feedback: data.p004_feedback || null,
      p005_form: data.p004_form || null,
      p005_channel: data.p004_channel || null,
      p005_mentor: data.p004_mentor || null,
      p005_feedback: data.p005_feedback || null,
      p009_youtube: data.p009_youtube || null,
      p009_form: data.p004_form || null,
      p009_channel: data.p004_channel || null,
      p009_mentor: data.p004_mentor || null,
      p009_feedback: data.p009_feedback || null,
      // Системные
      system__service: data.service || null,
      partners__user_gcpc: data.gcpc || null,
      system__source: data.utm_source || null,
      system__medium: data.utm_medium || null,
      system__campaign: data.utm_campaign || null,
      system__content: data.utm_content || null,
      system__term: data.utm_term || null,
      system__group: data.utm_group || null,
      // Аналитика
      analytics__user_source: data.utm_source || null,
      analytics__user_medium: data.utm_medium || null,
      analytics__user_campaign: data.utm_campaign || null,
      analytics__user_content: data.utm_content || null,
      analytics__user_term: data.utm_term || null,
      analytics__user_group: data.utm_group || null
    }
  }
}

module.exports = GCUserNeso
