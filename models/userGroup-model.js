const Sequelize = require('sequelize'); 
const sequelize = require('../utils/database'); 

const GroupUser =sequelize.define('usergroups', {
    isGroupAdmin:{ type:Sequelize.BOOLEAN, defaultValue: false},

    },
)

module.exports = GroupUser;