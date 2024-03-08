const path = require('path');//working with file and directory paths
const express = require('express');
const app = express();
const dotenv=require('dotenv');
dotenv.config();

const bodyParser = require('body-parser');
const sequelize = require('./utils/database');
const cors = require('cors');
const compression=require('compression');


const signUpLoginRoutes = require('./routes/user');
const passwordRouter = require('./routes/password');





app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(express.static('images'));

app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware for parsing JSON in the request body
app.use(express.json());


// Use the userRoutes middleware

app.use(signUpLoginRoutes);

app.use( passwordRouter)




//import models and database
const User = require ('./models/user-model');
const password = require('./models/password-model');






sequelize
  .sync()
  .then(result => {
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.log(err);
  });
