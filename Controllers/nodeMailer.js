//NodeMailer
const nodeMailer=require('nodemailer')

const transporter = nodeMailer.createTransport({
    service:'gmail',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'rohankurdekar2006@gmail.com',
      pass: 'Siri_2092'
    }
  });
  //function to send mails
const sendMail=async(subject,body,senderId)=>{
  try{
  const info = await transporter.sendMail({
    from: 'Rohan <rohankurdekar2006@gmail.com>', // sender address
    to: `otp<${senderId}>`, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
  });
 
  return true;
}catch(err)
{
  console.log(err)
  return false;
}

}


module.exports=sendMail
