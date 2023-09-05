const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

  deliveryDetails: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Types.ObjectId,
  },
  address: {
    type: mongoose.Types.ObjectId,

  },
  userId: {
    type: String,
    required: true,

  },
  userName: {
    type: String,
    required: true,

  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    Totalprice: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalAmount: {
    type: Number,
    required: true,

  },
  date: {
    type: Date
  },
  status: {
    type: String,
    default: true,
  },
  paymentMethod: {
    type: String
  },
  paymentId: {
    type: String
  },
  orderId: {
    type: String,
    unique: true, // if each order should have a unique orderId
  },
  discount: {
    type: String
  }
})

module.exports = mongoose.model("order", orderSchema);