const Sequelize = require('sequelize'); //table
const sequelize = require('../utils/database'); //connected object

const Group =sequelize.define('groups', {
    groupname: {type: Sequelize.STRING},
    isAdmin: {type: Sequelize.BOOLEAN, defaultValue:true},
    }, 
    
)

module.exports = Group;