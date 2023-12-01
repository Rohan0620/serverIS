const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv').config();
const app=express();
const authControllers=require('../server/Controllers/Authentication')


app.use(express.json());


app.post('/registerusers',authControllers.register);

app.post('/login',authControllers.loginCheck)

app.post('/verifyTotp',authControllers.protect,authControllers.verifytOtp)


const DB = process.env.DATABASE.replace(
    "<password>",
    process.env.PASSWORD,
  );
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((con) => {
    // console.log(con.connections)
    const db = mongoose.connection;
    console.log("SUCCESFULL CONNECTED");
  });

  
  







const server=app.listen(process.env.PORT,()=>{
    console.log(`listening on port ${process.env.PORT}`)
})