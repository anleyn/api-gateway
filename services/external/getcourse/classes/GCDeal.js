// === ПОДКЛЮЧЕНИЕ МОДУЛЕЙ ===
const path = require('path')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_GC_CLASSES = path.join(process.cwd(), '/services/external/getcourse/classes')

const GCUser = require(`${PATH_GC_CLASSES}/GCUser.js`)

/**
 * Класс расширяет GCUser, добавляя поля для заказа.
 */
class GCDeal extends GCUser {
  /**
   * Конструктор для создания заказа.
   * @param {Object} data Данные заказа.
   */
  constructor (data) {
    super(data)

    this.deal = {
      deal_number: data.deal_number || null,
      offer_code: data.offer_code || null,
      product_title: data.product_title || null,
      product_description: data.product_description || null,
      quantity: data.quantity || 1,
      deal_cost: data.deal_cost || null,
      deal_status: data.deal_status || null,
      deal_is_paid: data.deal_is_paid || 'нет',
      manager_email: data.manager_email || null,
      deal_created_at: data.deal_created_at || null,
      deal_finished_at: data.deal_finished_at || null,
      deal_comment: data.deal_comment || null,
      payment_type: data.payment_type || null,
      payment_status: data.payment_status || null,
      partner_email: data.partner_email || null,
      addfields: {},
      deal_currency: data.deal_currency || 'RUB',
      funnel_id: data.funnel_id || null,
      funnel_stage_id: data.funnel_stage_id || null
    }

    this.system = {
      ...this.system,
      multiple_offers: data.multiple_offers || 0,
      return_payment_link: data.return_payment_link || 0,
      return_deal_number: data.return_deal_number || 0
    }
  }
}

module.exports = GCDeal
