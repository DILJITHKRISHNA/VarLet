const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique:true,
    }, 
    is_active:{
        type: Boolean,
        default:true
    }
})

module.exports = mongoose.model("Category", categorySchema)