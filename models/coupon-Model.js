const mongoose = require('mongoose')

const couponschema = new mongoose.Schema(
    {   
         couponName:{
            type:String,
            required:true

        },
        couponCode:{
             type:String,
             required:true
        },

        discountPercentage:{
            type:Number
        },

        activationDate:{
            type:Date,
            required:true
        },
        expiryDate:{
            type:Date,
            required:true,
        },
        criteriaAmount:{
            type:Number,
            required:true

        },
        usedUsers:{
            type:Array,
            ref:"User",
            default:[]
        },
        usersLimit:{
          type:Number, 
          required:true,
        },
        status:{
           type:Boolean,
           default:true,  
           
        }


    }
)

module.exports = mongoose.model("coupon",couponschema)