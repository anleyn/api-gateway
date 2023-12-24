const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')

// === КОНСТАНТЫ: ПУТИ ===
const PATH_DB_CONFIG = path.join(process.cwd(), '/db/config')

// === ПОДКЛЮЧЕНИЕ К ФАЙЛУ КОНФИГУРАЦИИ БАЗЫ ДАННЫХ ===
const dbConfig = require(`${PATH_DB_CONFIG}/khtapi.conf`)

// Создание экземпляра Sequelize
const sequelize = new Sequelize(dbConfig)

const RegTildaModel = sequelize.define('RegTilda', {
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  uuid: {
    type: DataTypes.UUID,
    allowNull: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  params: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
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
  utm_content: {
    type: DataTypes.STRING,
    allowNull: true
  },
  utm_term: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reg_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_id: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  application_id: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  form_id: {
    type: DataTypes.SMALLINT,
    allowNull: true
  }
}, {
  tableName: 'reg_tilda'
})

module.exports = RegTildaModel
