const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Buzzword = sequelize.define('Buzzword', {
    term: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    meaning: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    example_sentence: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'buzzwordbuddy',
    timestamps: false,
});

module.exports = Buzzword;
