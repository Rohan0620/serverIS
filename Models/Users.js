const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

const userSchema=new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        select: false,
      },
    email:{type:String,unique:true,required:true},
    secretKey:String
})

userSchema.pre("save", async function (next) {
    if (this.isModified) {
      this.password = await bcrypt.hash(this.password, 12);
      return next();
    } else {
      return next();
    }
  });

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword,
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };



const Users = mongoose.model("Users",userSchema);

module.exports=Users;



