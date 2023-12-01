const speakeasy = require('speakeasy');
const Users=require('../Models/Users')
const bcrypt=require('bcrypt')
const QRCode = require('qrcode');
const { authenticator } = require('otplib');
var otpGenerator = require("otp-generator");
const { checkPrimeSync } = require('crypto');
const otpModel=require('../Models/Otp')
const sendMail=require('../Controllers/nodeMailer');

const jwt = require("jsonwebtoken");

const { promisify } = require("util");

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
}


exports.register=async(req,res)=>{
    try{
    const {username,password,email}=req.body;
    console.log(username)

   const data=await Users.create({username:username,password:password,email:email})

    // Generate a secret key.
    const secret = speakeasy.generateSecret({length: 20});
    console.log(secret)
    const response=await Users.findByIdAndUpdate(data._id,{secretKey:secret.base32});
    console.log(response)
  
  // Get the otpauth URL
// const otpauth_url = speakeasy.otpauthURL({
//   secret: secret.base32,
//   label: encodeURIComponent(data.email),
//   issuer: '2FA'
// });

// Generate a QR code that the user can scan with their TOTP app
const dataUrl=await QRCode.toDataURL(secret.otpauth_url);

   return res.status(200).json({status:"success",otpUrl:dataUrl})

    }catch(err)
    {
        return res.status(400).json({status:"error"})
    }
}
// Save this secret in your database, associated with the user.
exports.loginCheck=async (req,res)=>{
    try{
    const {username,password}=req.body
    if(!username || !password) return res.status(400).json({status:"Fail",message:"No username or password given"})

    const check=await Users.findOne({username:username}).select("+password");
    if(!check) return res.status(400).json({status:"Fail",message:"Invalid Username"})

    if ((await check.correctPassword(password,check.password)) == false) {
        return res.status(401).json({
          reply: "Incorrect Password",
        });
      }

   
const token = signToken(check._id);

//  const data=await generateEmailOtp(check.email);


return res.status(200).json({status:"success",token:token})
    }catch(err){
        console.log(err)
    }
    
}

async function generateEmailOtp(email){
    try{
        
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets:false,
      upperCaseAlphabets:false,
      specialChars:false
    });
    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 10);
    //create Db instance
    const otp_instance = await otpModel.create({
      otp: otp,
      expiration_time: expiration_time,
    });
    var details = {
      timestamp: now,
      check: req.body.email,
      success: true,
      message: "OTP sent to user",
      otp_id: otp_instance._id,
    };
    const mailBody=` Dear Customer,
  
    Your OTP for verification is: ${otp}
    
    Valid for 10 minutes.
    
    For issues, contact: rohankurdekar2006@gmail.com
    
    Thanks,
    XYZ Team`
    console.log(email)
    if(sendMail('OTP Verification',mailBody,email)) return {status:"success",details:details}
  }catch(err)
  {
    return {status:"Fail",message:"Problem while sending OTP"}
  }};

  exports.verifyOtp=async(req,res)=>{
    try{


    }catch(err){

    }
}
exports.verifytOtp=async(req,res)=>{
    try{
        const {totpToken}=req.body;
        console.log(totpToken)
        
        const secret=req.user.secretKey;
        console.log(secret)
        // const verified = authenticator.verify({
        //     token: totpToken,
        //     secret: secret
        //   });
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: totpToken,
            
          });
          console.log(verified)
        if (verified) {
            res.json({ success: true, message: 'Token valid' });
          } else {
            res.json({ success: false, message: 'Token invalid' });
          }

       
    }catch(err)
    {
        console.log(err)
    }
}


exports.protect=async(req,res,next)=>{
    
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      // conditionalLog(token)
    }
   

    if (!token) {
      return res.status(401).json({
        reply: "Please Login to get access",
      });
    }
    console.log(token)
    //verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if user still exists
    const freshUser = await Users.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        status: "fail",
        message: "user no longer exists",
      });
    }
   req.user = freshUser;
   console.log(req.user)
    //grant access to the protected route
    next();
}

