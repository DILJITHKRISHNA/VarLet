const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{

        type:String,
        required:true
    },
    mobile:{

        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true,
        default:0,
    },

    status: {
        type:Boolean,
        require: true
    },

    is_verified:{
        type:Number,
        default:0
    },

    is_block:{
        type:Boolean,
        default:false
    },
    resetToken:{
       type:String,

    },
   resetTokenExpiration :{
       type: Date
    
    },
    wallet:{
        type:Number,
        default:0,
    }

})

module.exports = mongoose.model('User',userSchema);
