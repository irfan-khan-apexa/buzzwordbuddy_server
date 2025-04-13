const sequelize = require('../config/sequelize');
const Buzzword = require('./Buzzword');
const UserSentence = require('./UserSentence');

// ✅ This sets up the relationship
UserSentence.belongsTo(Buzzword, { foreignKey: 'term_id' });
Buzzword.hasMany(UserSentence, { foreignKey: 'term_id' });

module.exports = {
    sequelize,
    Buzzword,
    UserSentence,
};
