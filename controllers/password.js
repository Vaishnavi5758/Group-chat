
//require mailer, UUID token and hashing libraries
// const Brevo = require('sib-api-v3-sdk');  //require('@getbrevo/brevo')
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const Brevo = require('@getbrevo/brevo')
const {v4:uuidv4} = require('uuid');       
const bcrypt = require('bcrypt'); 
const path = require('path'); 
const sequelize = require('../utils/database')       

const Resetpassword = require('../models/password-model');
const User = require('../models/user-model')

require('dotenv').config();  
const EMAIL ="patilvaishnavi5758@gmail.com " ;    
const PASSWORD ="bksg fnmm lzmj udhw";              //access environment variables
const brevoAPIKey = "xsmtpsib-7d00abbd9454ad234f5cc8ddc12db8bbfae1c127a140cf87498881f77d2dc433-s5YTI6BatmDJkgcE";

exports.forgotPasswordMail = async(req, res) => {
    
    const email = req.body.email; // Extract email directly from req.body
            console.log("Email:", email); // Log the email to verify
            
            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(400).json({ status: "Fail", message: "Email not found" });
    
            const id = uuidv4();
            const path =`http://localhost:3306/createNewPassword/${id}`;

            await Resetpassword.create({ id, userId: user.id, active: true });
    
            let config = {
                service : 'gmail',
                auth : {
                    user: EMAIL,
                    pass: PASSWORD
                }
            }
        
            let transporter = nodemailer.createTransport(config);
        
            let MailGenerator = new Mailgen({
                theme: "default",
                product : {
                    name: "Mailgen",
                    link : 'https://mailgen.js/'
                }
            })
        
            let response = {
                body: {
                    name: "CATCH your Expenses",
                    intro: `Reset Password: <a href="${path}">Click Here</a>`, // Constructed HTML link
                    outro: "Looking forward to doing more business"
                }
            
            };
            
            
        
            let mail = MailGenerator.generate(response)
        
            let message = {
                from : EMAIL,
                to : email,
                subject: "Reset Password",
                html:mail
            }
        
            transporter.sendMail(message).then(() => {
                return res.status(201).json({
                    msg: "you should receive an email"
                })
            }).catch(error => {
                return res.status(500).json({ error })
            })

            // res.status(201).json("getBill Successfully...!");
        }



exports.createNewPassword = async(req, res) =>{

  try{
  const createPasswordUUID = await Resetpassword.findOne({where:{id: req.params.id}})
  if(!createPasswordUUID)return res.status(400).json({status:"failed", message:"Invalid Link"})
  
  const passwordPath = path.join(__dirname,'..','public', 'password.html');
  return res.status(200).sendFile(passwordPath);

  }catch(err){
    console.log(err)
  }

}





exports.postNewPassword = async(req, res) =>{
  const { id } = req.params;
  console.log(">>>>>>>>>>>>>>>.id", id)
  const {password, confirmpassword} = req.body;      //can we get that id thru body too?  //is it necessary to check password and confirmpasswords are same here also, already have checked in frontend
  const t = await sequelize.transaction();
  
  try{
    const row = await Resetpassword.findOne({where:{id: id}}, {transaction: t});

    if(!row.active){
      await t.commit();
      return res.status(400).json({status: "Failed", message: "Expired Link", success:false});
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const updatedPassword = Resetpassword.update({active:false}, {where:{id:id}}, {transaction: t})

    const updatedUser = User.update({password: hashedPassword}, {where:{id: row.userId}}, {transaction: t})

    await Promise.all([updatedPassword, updatedUser]);
    await t.commit();
    res.status(200).send({status:"Success", message: "Password updated successfully", success:true});

  }catch(err){
    t.rollback();
    console.log(err);
  }


}

   //API to send mail for forgot password
// exports.forgotPasswordMail = async (req, res) => {
//     try {
//         const email = req.body.email; // Extract email directly from req.body
//         console.log("Email:", email); // Log the email to verify
        
//         const user = await User.findOne({ where: { email } });
//         if (!user) return res.status(400).json({ status: "Fail", message: "Email not found" });

//         const id = uuidv4();
//         await Resetpassword.create({ id, userId: user.id, active: true });

//         // Create a Brevo instance
//         const defaultClient = await Brevo.ApiClient.instance;
//         var apiKey = defaultClient.authentications['api-key']; //isapi-key an argument?
//         apiKey.apiKey = brevoAPIKey;
//         const transEmailApi = new Brevo.TransactionalEmailsApi();
//         await Promise.all([apiKey, transEmailApi]);
//         const path = `http://13.201.162.141:3000/createNewPassword/${id}`;

//         const sender = {
//             email: "patilvaishnavi5758@gmail.com",
//             name: "Code Keshri",
//         };
//         const receivers = [{ email: email }];

//         await transEmailApi.sendTransacEmail({
//             sender,
//             to: receivers,
//             subject: "Reset Password",
//             textContent: "Click here to reset your password",
//             htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
//         });

//         res.status(200).json({ status: "Success", message: "Password reset email sent successfully!" });
//     } catch (error) {
//         console.error("Error sending password reset link", error);
//         res.status(500).json({ status: "Error", message: "Failed to send password reset email" });
//     }
// };