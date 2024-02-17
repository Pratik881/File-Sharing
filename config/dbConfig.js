require('dotenv').config
const mongoose=require('mongoose')
const connectDb=async()=>{
    try{
    await  mongoose.connect('mongodb://localhost:27017/fileSharing')
    console.log("connection successfull")
    }
    catch(err){
        console.log('error connecting to db')
    }
}
module.exports=connectDb