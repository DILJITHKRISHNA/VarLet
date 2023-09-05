const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const productSchema = mongoose.Schema({

    productName: {
        type: String,
        require: true,
        unique:true
    },
    description: {
        type: String,
        require: true
    },
    images: {
        type: Array,
        required: true
    },
    category: {
        type: ObjectId,
        ref: "Category",
        required: true
    },
    price: {
        type: Number,
        required:true
    },
    discount: {
        type: Number,
    },
    salePrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        require: true,
    },
    status: {
        type: Boolean,
        default: true
    },
    list: {
        type: Boolean,
        default: true
    },
    // stock: {
    //     type: Number,
    //     required: true

    // }
    is_delete:{
        type:Boolean,
        default:false
      },
})

productSchema.index({ productName: 'text' });


module.exports = mongoose.model('Product', productSchema)