const Sequelize = require('sequelize'); //table
const sequelize = require('../utils/database'); //connected object

const Message =sequelize.define('messages', {
    message: {type: Sequelize.STRING},
    }, 
    
)

module.exports = Message;