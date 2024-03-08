const express = require('express');
const app = express();
const path = require('path');
const User = require('../models/user-model'); 



const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');








  exports.signUp = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const saltrounds = 10;
      bcrypt.hash(password, saltrounds, async (err, hash) => {
        if (err) throw new Error("Something wrong while hashing password");
        else {
          const existingUser = await User.findOne({ where: { email } });
          if (existingUser) {
            res.status(400).send("Email already registered");
          } else {
            const newUser = await User.create({ name, email, password: hash });
            console.log("server",newUser);
            //res.redirect("/");
            res.status(201).json({message: 'Signup succesful'});
          }
        }
      });
    } catch (err) {
      console.error("Signup failed", err);
      res.status(500).send("Signup failed" + err);
    }
}




exports.login = async (req, res) => {
  console.log("Signin Data from client to server", req.body);
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ where: { email } }); //if i  do findall it return array and i will have to use user[0]
      if (existingUser) {
        //convert password to hash and compare
        bcrypt.compare(password, existingUser.password, async (err, result) => {
          if (err)
            throw new Error("Trouble matching input password and stored hash");
          else {
            if (result === true){
              console.log("Login Successful!");
             // const uniqueData = Date.now();

              return res.status(200).json({success: true, message: "User logged in successfully", token: generateAccessToken(existingUser.id, existingUser.userName)});
            }
            else res.status(400).send("Incorrect Password");
          }
        });
      } else res.status(404).send("User not found");
    } catch (err) {
      console.error("Signin failed", err);
      res.status(500).send("Signin failed" + err);
    }
  }

  function generateAccessToken(id, name){
   // const uniqueData = Date.now();

    const token =  jwt.sign({userId:id, name:name }, 'secretKey');
    return token;
  }

  
  