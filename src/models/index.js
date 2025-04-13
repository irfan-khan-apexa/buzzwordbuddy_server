const sequelize = require('../config/sequelize');
const Buzzword = require('./Buzzword');
const UserSentence = require('./UserSentence');

<<<<<<< HEAD
// Future associations go here
=======
// ✅ This sets up the relationship
UserSentence.belongsTo(Buzzword, { foreignKey: 'term_id' });
Buzzword.hasMany(UserSentence, { foreignKey: 'term_id' });
>>>>>>> Upadted_calander_11_04_2025

module.exports = {
    sequelize,
    Buzzword,
    UserSentence,
};
