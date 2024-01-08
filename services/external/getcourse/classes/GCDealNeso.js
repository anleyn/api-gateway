// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_GC_CLASSES = path.join(process.cwd(), '/services/external/getcourse/classes')

const GCUser = require(`${PATH_GC_CLASSES}/GCUserNeso.js`)
const GCDeal = require(`${PATH_GC_CLASSES}/GCDeal.js`)

/**
 * Класс расширяет GCDeal, добавляя специфические поля для заказа.
 */
class GCDealNeso extends GCDeal {
  /**
   * Конструктор для создания заказа NeSo Академии.
   * @param {Object} data Данные заказа.
   */
  constructor (data) {
    super(data)

    const gcUser = new GCUser(data)

    this.user.addfields = {
      ...this.user.addfields,
      ...gcUser.user.addfields
    }

    this.deal.addfields = {
      analytics__info: data.ed_id || null,
      analytics__deal_source: data.utm_source || null,
      analytics__deal_medium: data.utm_medium || null,
      analytics__deal_campaign: data.utm_campaign || null,
      analytics__deal_content: data.utm_content || null,
      analytics__deal_term: data.utm_term || null,
      analytics__deal_group: data.utm_group || null,
      deal_gcpc: data.gcpc || null,
      set_status: data.set_status || null,
      from_api: true
    }
  }
}

module.exports = GCDealNeso
