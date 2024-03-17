const path = require('path');//working with file and directory paths
const express = require('express');
const app = express();
const dotenv=require('dotenv');
dotenv.config();
const WebSocket = require('ws');
const server = require("http").createServer(app);
const io = require("socket.io")(server) 
const jwt = require('jsonwebtoken');



const bodyParser = require('body-parser');
const sequelize = require('./utils/database');
const cors = require('cors');
const compression=require('compression');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());


const userRouter = require('./routes/user');
const passwordRouter = require('./routes/password');
const messageRouter = require('./routes/message');
const groupRouter = require('./routes/group');

//import models and database
const User = require ('./models/user-model');
const Resetpassword = require('./models/password-model');
const Message = require('./models/message-model');
const Group = require('./models/group-model');
const Usergroup = require('./models/userGroup-model');


//Model Relation
User.hasMany(Resetpassword);
Resetpassword.belongsTo(User,  {constraints: true, onDelete: 'CASCADE'});

User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(Group);     //can be skipped
Group.belongsTo(User,  {constraints: true, onDelete: 'CASCADE'});

// Usergroup.belongsTo(User);
// Usergroup.belongsTo(Group);
Group.belongsToMany(User, {through: Usergroup});
User.belongsToMany(Group, {through: Usergroup});

Group.hasMany(Message);
Message.belongsTo(Group, {constraints: true, onDelete: 'CASCADE'});





// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(express.static('images'));

app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware for parsing JSON in the request body
app.use(express.json());


// Use the userRoutes middleware

app.use(userRouter);
app.use(passwordRouter);
app.use(messageRouter);
app.use(groupRouter);

//route directs
app.use("/", userRouter);
app.use("/", messageRouter);
app.use("/password", passwordRouter);
app.use('/group', groupRouter);



sequelize
  .sync()
  .then((result) => {
    server.listen(3000, () => {
      console.log("Server running");
    });
  })
  .catch((err) => {
    console.log("Database Error setting Sequelize", err);
  });
 
//initialize the socket aka connection event and give socket.id key to user
const users = [];
io.on("connection", (socket) => {
  socket.on("user-joined", (usertoken) => {
    const user = jwt.decode(usertoken);
    users[socket.id] = user;                                      
    socket.broadcast.emit("user-joined-broadcast", user);

  });

  // send-message event and recieve-message broadcast
  socket.on("send-message", (message) => {
    const user = jwt.decode(message.token);
    const userb = users[socket.id];
    const data =  { user: user.name, message: message.message }
    socket.broadcast.emit("receive-message", data);
  });

// user-left event & broadcast it executes automatically when user log out or close the tab, inbuilt socket.io feature
  socket.on("disconnect", () => {
    const user = users[socket.id];
    delete users[socket.id];
    socket.broadcast.emit("user-left", user.name);
  });
});








