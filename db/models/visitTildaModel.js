const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_DB_CONFIG = path.join(process.cwd(), '/db/config')

// === ПОДКЛЮЧЕНИЕ К ФАЙЛУ КОНФИГУРАЦИИ БАЗЫ ДАННЫХ ===
const dbConfig = require(`${PATH_DB_CONFIG}/khtapi.conf`)

// Создание экземпляра Sequelize
const sequelize = new Sequelize(dbConfig)

const VisitTildaModel = sequelize.define('Visit', {
  uuid: {
    type: DataTypes.UUID,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  params: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  utm_source: {
    type: DataTypes.STRING,
    allowNull: true
  },
  utm_medium: {
    type: DataTypes.STRING,
    allowNull: true
  },
  utm_campaign: {
    type: DataTypes.STRING,
    allowNull: true
  },
  utm_term: {
    type: DataTypes.STRING,
    allowNull: true
  },
  utm_content: {
    type: DataTypes.STRING,
    allowNull: true
  },
  visit_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'visits_tilda'
})

module.exports = VisitTildaModel
