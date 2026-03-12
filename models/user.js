const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    },
})

//passportLocalMongoose will add a username,hash salt feild to store the 
//usernae,the hashed and password and the salt value
userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);
