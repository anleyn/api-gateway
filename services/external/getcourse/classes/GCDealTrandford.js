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
      // Переключатели
      Не_уведомлять: data.no_notification || null,
      Не_обрабатывать: data.no_processing || null,
      // Системные
      from_api: true,
      set_status: data.set_status || null,
      deal__created_type: data.created_type || 'not-user',
      deal__pay_type: data.pay_type || null,
      // Аналитика вебинара
      web__id: data.web__id || null,
      web__checkin_visit: data.web__checkin_visit || null,
      web__checkin_finish: data.web__checkin_finish || null,
      web__checkin_click: data.web__checkin_click || null,
      web__duration: data.web__duration || null,
      web__till: data.web__till || null,
      web__comments: data.web__comments || null,
      // Аналитика меток
      analytics__info: data.ed_id || null,
      analytics__deal_url: data.url || null,
      analytics__deal_source: data.utm_source || null,
      analytics__deal_medium: data.utm_medium || null,
      analytics__deal_campaign: data.utm_campaign || null,
      analytics__deal_content: data.utm_content || null,
      analytics__deal_term: data.utm_term || null,
      analytics__deal_group: data.utm_group || null,
      deal_gcpc: data.gcpc || null,
      // Другие
      Доступ_с_предобучением: data.pre_train || null,
      Можно_выдавать_доступ_к_обучению: data.train_access_grant || null,
      deal_instl_type: data.deal_instl_type || null,
      deal_instl_month: data.deal_instl_type || null,
      deal_instl_cost: data.deal_instl_type || null,
      deal_instl_date: data.deal_instl_type || null,
      deal_instl_link: data.deal_instl_type || null,
      deal_instl_payments: data.deal_instl_type || null
    }
  }
}

module.exports = GCDealNeso
