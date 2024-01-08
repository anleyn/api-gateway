// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_GC_CLASSES = path.join(process.cwd(), '/services/external/getcourse/classes')

const GCDeal = require(`${PATH_GC_CLASSES}/GCDeal.js`)
const GCUserTest = require(`${PATH_GC_CLASSES}/GCUserTest.js`)

/**
 * Класс расширяет GCDeal, добавляя специфические поля для заказа.
 */
class GCDealTest extends GCDeal {
  /**
   * Конструктор для создания расширенного заказа.
   * @param {Object} data Данные заказа.
   */
  constructor (data) {
    const userNeso = new GCUserTest(data)
    super(userNeso.user, data)

    this.deal.addfields = {
      deal_utm_source: data.utm_source || null,
      deal_utm_medium: data.utm_medium || null,
      deal_utm_campaign: data.utm_campaign || null,
      deal_utm_content: data.utm_content || null,
      deal_utm_term: data.utm_term || null,
      deal_gcpc: data.gcpc || null,
      education_id: data.ed_id || null,
      education_date: data.date || null,
      education_channel: data.channel || null,
      service1: data.service1 || null,
      service2: data.service2 || null,
      service3: data.service3 || null,
      service4: data.service4 || null,
      service5: data.service5 || null,
      from_api: true
    }
  }
}

module.exports = GCDealTest
