const Message = require('../models/message-model');
const User = require('../models/user-model');
//const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
require('dotenv').config();

const secret_key=process.env.SECRET_KEY




const sendMessage = async (req, res) => {
    try {
      const message = req.body.message;
      const data = await Message.create({ message: message, userId: req.user.id, groupId: +req.body.activeGroupId});
      const user = await User.findOne({where:{ id: req.user.id}})   
      res.status(200).json({success: true, message: "Message sent successfully",newMessage:{data: data, user: user}})  
      }catch (err) {
        console.log("Error storing message")
      res.status(500).json({ success: false, error: err.message });
    }
  }
  
  const getMessage = async(req, res) =>{
      const userId = req.user.id; 
    try{
      const messages = await Message.findAll( {where: {groupId: req.params.groupId}, include: [{model: User, attribute: ['name']}]})
      console.log(`${userId}, ${req.params.groupId}, ${messages}`)
      res.status(200).json({success: true, allMessage: messages});
    }catch(err){
      res.status(500).json({success: false, error: err.message})
    }
  }

  const uploadFile = async(req, res) =>{
    const groupId = req.params.groupId;
    const userId = req.user.id;
    const data = req.body.data;
    console.log(">>>>>>>>>>>>>>>>>.",groupId, userId, data);
  try{
    const bufferData = Buffer.from(req.file.buffer, "binary");
    const filename = `${userId}/${req.file.originalname}`;
    const mimetype = req.file.mimetype;
    const url = await uploadToS3(bufferData, filename, mimetype);
    res.status(200).json({success: true, url, message: "file uploaded successfully"});
  }catch(err){
    res.status(500).json({success: false, message: "upload failed at backend", error: err.message})
  }
  }
  
  function uploadToS3(data, filename){
    //get credentials, login to AWS and upload the file.
    const BUCKET_NAME = process.env.BUCKET_NAME; //change bucket name
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
  
    const s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    })
  
     //params Bucket, Key, Body as required by AWS S3
    const params = {                               
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: 'public-read'
    }
  
    // return promise instead direct return as uploading is an asynchronous task
    return new Promise((resolve, reject)=>{
      s3bucket.upload(params, async (err, s3response)=>{
        try{
          if(err) {
            console.log("Error uploading file", err);
            reject(err);
          }else{
            console.log('File uploaded successfully', s3response)
            resolve(s3response.Location);
          }
        }catch(err){
          console.log("Waiting to login in AWS for upload", err)
        }
     
      })
    })
  }
  
  

  module.exports = {
    sendMessage,
    getMessage,
   uploadFile,
  }