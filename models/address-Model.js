
const {ObjectId} = require('mongodb')
const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
   
    userId:{
        type:ObjectId,
        required:true,
    },
    addresses:[{
        userName:{
            type:String,
            required:true,
        },
        mobile:{
            type:String,
            required:true,
        },
        // altrenativeMob:{
        //     type:String,
        //     required:true,
        // },
        houseName:{
            type:String,
            required:true,
        },
        city:{
          type:String,
          required:true,
        },
        state:{
            type:String,
            required:true,
        },
        pincode:{
            type:String,
            required:true,
        },
     
    }]

})

module.exports = mongoose.model('Address',addressSchema);