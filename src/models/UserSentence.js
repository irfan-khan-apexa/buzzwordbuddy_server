const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserSentence = sequelize.define('UserSentence', {
    term_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_sentence: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    tableName: 'user_sentences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = UserSentence;
