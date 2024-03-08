const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Resetpassword = sequelize.define('resetpassword', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },

// userId: Sequelize.INTEGER,    
active: Sequelize.BOOLEAN,
expireby: Sequelize.DATE

})

module.exports = Resetpassword;