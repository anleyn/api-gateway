/**
 * Базовый класс для создания объекта пользователя.
 */
class GCUser {
  /**
   * Конструктор для создания пользователя.
   * @param {Object} data Данные пользователя.
   */
  constructor (data) {
    this.user = {
      email: data.email || null,
      phone: data.phone || null,
      first_name: data.firstName || null,
      last_name: data.lastName || null,
      city: data.city || null,
      country: data.country || null,
      group_name: data.groupName || null,
      addfields: {}
    }
    this.session = this.createSession(data.session || {})
    this.system = {
      refresh_if_exists: data.refreshIfExists || '1',
      partner_email: data.partnerEmail || null
    }
  }

  /**
   * Создает объект сессии пользователя.
   * @param {Object} sessionParams Параметры сессии.
   * @returns {Object} Объект сессии.
   */
  createSession (sessionParams) {
    return {
      utm_source: sessionParams.utm_source || null,
      utm_medium: sessionParams.utm_medium || null,
      utm_content: sessionParams.utm_content || null,
      utm_campaign: sessionParams.utm_campaign || null,
      utm_group: sessionParams.utm_group || null,
      gcpc: sessionParams.gcpc || null,
      gcao: sessionParams.gcao || null,
      referer: sessionParams.referer || null
    }
  }
}

module.exports = GCUser
