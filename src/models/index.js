const sequelize = require('../config/sequelize');
const Buzzword = require('./Buzzword');
const UserSentence = require('./UserSentence');

// Future associations go here

module.exports = {
    sequelize,
    Buzzword,
    UserSentence,
};
