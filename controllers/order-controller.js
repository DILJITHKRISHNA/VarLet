const User = require('../models/user-model');
const Products = require('../models/product-model');
const CartDb = require('../models/cart-Model');
const { logout_user } = require('../middleware/auth');
const Address = require('../models/address-Model');
const orderdb = require('../models/order-Model')
const couponDb = require('../models/coupon-Model')
const mongoose = require('mongoose')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const uuid = require('uuid');
const puppeteer = require('puppeteer')
const path = require('path'); // Import the path module
const fs = require("fs");
const ejs = require("ejs");
const { log } = require('console');



var instance = new Razorpay({ 
  key_id:'rzp_test_1U4nqU3IHdsXcp',
  key_secret:'nDca5cnXAKN8df0DtbRdpFGo',
});


const loadCheckout = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect("/login");
        }

        const userName = await User.findOne({ _id: req.session.userId });
        const addressdata = await Address.findOne({ userId: req.session.userId });
        const couponData = await couponDb.find({})
        
        const todayDate = new Date();
        const cartData = await CartDb.findOne({
            user: req.session.userId,
        }).populate("items.product");
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            return res.render("emptyCheckOut", {
                session: req.session.userId,
                user: userName,
                message: "Your cart is empty",
            }); 
        }

        const items = cartData.items;
        
        const total = await CartDb.aggregate([
            { $match: { user: req.session.userId } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: ["$items.Totalprice", "$items.quantity"],
                        },
                    },
                },
            },
        ]);
          console.log(total,'..........................................................');
        if (addressdata && addressdata.addresses.length > 0) {
            const address = addressdata.addresses;
            const Total = total.length > 0 ? total[0].total : 0;
            const Total2 = await CartDb.findOne({user:req.session.userId});
            const totalamount = Total2.cartTotal;
            const userWallet = userName.wallet;
            const userId = userName._id;
            const couponCode = undefined;


            res.render("checkout", {
                items: items,
                Total: Total,
                userId,
                session: req.session.userId,
                totalamount,
                user: userName,
                address,
                couponCode,
                userWallet,
                todayDate,
                coupons: couponData
            });
        } else {
            res.render("emptyCheckOut", {
                session: req.session.userId,
                user: userName,
                message: "Please enter a valid address",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};


// ======================PLACE ORDER============================
const placeOrder = async (req, res) => {
  try {
    
    const address = req.body.address;
    
    const cartData = await CartDb.findOne({ user: req.session.userId })
    if (!cartData) {
      console.log("cart data not found");
    }
    const products = cartData.items;
    const total = parseInt(req.body.Total);
    const subTotal = req.body.Subtotal;
    const paymentMethods = req.body.payment;
    
    const userName = await User.findOne({ _id: req.session.userId });
    const name = userName.name;
    const status = paymentMethods === "COD" ? "placed" : "pending";

    
    const order = new orderdb({
      orderId: uuid.v4(), 
      deliveryDetails: address,
      userId: req.session.userId,
      userName: name,
      paymentMethod: paymentMethods,
      items: products,
      productPrice: total,
      totalAmount: subTotal,
      date: new Date(),
      status: status,
    });

    const orderData = await order.save();

    if (orderData) {
      if (orderData.status === "placed") {
        await CartDb.deleteOne({ user: req.session.userId });
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].product;
          const count = products[i].quantity;
          await Products.findOneAndUpdate(
            { _id: pro },
            { $inc: { quantity: -count } }
          );
        }
        res.json({ codsuccess: true, orderid: orderData._id });
      } else {
      
        if (paymentMethods === "wallet") {
          const wallet = userName.wallet;

         
          if (wallet >= orderData.totalAmount) {
            await User.findOneAndUpdate(
              { _id: req.session.userId },
              { $inc: { wallet: orderData.totalAmount * -1 } }
            );
            await CartDb.deleteOne({ user: req.session.userId });
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].product;
              const count = products[i].quantity;
              await Products.findOneAndUpdate(
                { _id: pro },
                { $inc: { quantity: - count } }
              );
            }
            res.json({ walletSuccess:true, orderid: orderData._id });
          } else {
            
            res.json({ walletFailed: true, orderid: orderData._id });
          }
        } else {
          // Razorpay payment handling
          const options = {
            amount: orderData.totalAmount * 100,
            currency: "INR",
            receipt: "" + orderData._id,
          };

          instance.orders.create(options, function (err, order) {
            res.json({ order });
          });
        }
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred." });
  }
};

//=====================PLACED ORDERS SUCCESS PAGE==================
const successPage = async (req, res) => {
    console.log("enter to success page");
    try {
      const id = req.params.id;
      const userData = req.session.userId;
      const orderedProduct = await orderdb.findOne({ _id: id }).populate("items.product");
      const products = orderedProduct.items;
      const payment = orderedProduct.paymentMethod

      res.render("orderSuccess", {
        orderedProduct,
        product: products,
        payment,
        userData,
        id,
        session:userData, 
      });
    } catch (error) {
      console.log(error);
    }
  };

// =======================verify payment===================================

const verifyPayment = async (req, res) => {
  try {
    const cartData = await CartDb.findOne({ user: req.session.userId });
    const products = cartData.items;
    const details = req.body;
    const hmac = crypto.createHmac("sha256", process.env.Razorpay);

    console.log(details);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");

    if (hmacValue === details.payment.razorpay_signature) {
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].product;
        const count = products[i].quantity;
        await Products.findByIdAndUpdate(
          pro,
          { $inc: { quantity: count } }
        );
      }
      await orderdb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: {status: "placed" } }
      );
      await orderdb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await CartDb.deleteOne({ userId: req.session.userId });
      const orderid = details.order.receipt;
      res.json({ onlineSuccess: true, orderid });
    } else {
      await orderdb.findByIdAndRemove(details.order.receipt)
      await CartDb.findByIdAndRemove({ user:req.session.userId})
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const addAddressCheckout = async (req, res) => {

//     try {

//         if (req.session.userId) {

//             const userId = req.session.userId

//             let AddressObj = {

//                 fullname: req.body.name,
//                 mobile: req.body.mobile,
//                 pincode: req.body.pincode,
//                 houseAddress: req.body.houseAddress,
//                 cityName: req.body.city,
//                 state: req.body.state

//             }

//             const userAddress = await Address.findOne({ userId: userId })

//             if (userAddress) {

//                 const userAdrs = await Address.findOne({ userId: userId }).populate('userId').exec()
//                 userAdrs.userAddress.push(AddressObj)

//                 await userAdrs.save().then((reps) => {
//                     res.redirect('/user/checkout')
//                 }).catch((err) => {
//                     console.log(err);
//                 })
//                 console.log(userAdrs + "saved");
//             } else {
//                 let userAddressObj = {

//                     userId: userId,
//                     userAddresses: [AddressObj]
//                 }
//                 await Address.create(userAddressObj).then((res) => {
//                     res.redirect('/checkout')
//                 })
//             }

//         }

//     } catch (error) {
//         console.log(error.message);
//     }
// }

// =================admin order list ==============================
const orderList = async (req, res) => {
    console.log("enter into order list");
    try {
        const order = await orderdb.find({}).populate('user')
        
        res.render('listOrder',{ 
          orders: order,
        })

    } catch (error) {

        console.log(error, "error is in orderList");

    }
}
// admin side order controller

const OrderDetails = async (req, res) => {
  try {
    const id = req.params.id;
     
    const orderDetail = await orderdb.findOne({ _id: id }).populate("items.product")
    if (!orderDetail) {
      return res.status(404).send('Order not found');
    }
    res.render('orderFullDetails', { orders: orderDetail });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//======================= STATUS UPDATE IN ADMIN SIDE=========================

const updateStatus = async (req, res) => {
  try {
    
    const proId = req.body.proId;
    const orderId = req.body.orderId;
    const statusChange = req.body.status;



console.log(req.body);
    const updatedOrder = await orderdb.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        $set: {
          status: statusChange, 
        },
      },
      { new: true }
    );

    console.log(updatedOrder);

    // if (statusChange === "Delivered") {
    //   await orderdb.findOneAndUpdate(
    //     {
    //       userId: userId,
    //       "items.product": id, // Use correct field path
    //     },
    //     {
    //       $set: {
    //         "items.$.deliveryDate": new Date(),
    //       },
    //     },
    //     { new: true }
    //   );
    // }

    if (updatedOrder) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error);
  }
};


//========================= FOR CANCEL ORDER  ====================

const orderCancel = async (req, res) => {
  console.log("entered to ordercancel");
  try {
    const orderId = req.params.orderId;
    const Id = req.session.userId;
  
    const updatedData = await orderdb.findOneAndUpdate(
      { userId: Id, "_id": orderId },
      {
        $set: {
          status: "cancelled",
        },
      },
      { new: true }
    );

    const productsData = updatedData;
    if (productsData.paymentMethod == "onlinePayment" || productsData.paymentMethod == "wallet" ) {
      const amount = parseFloat(req.body.totalAmount); // Assuming this is where the cancel amount is stored
      const refunded = await User.updateOne(
        { _id: req.session.userId },
        { $inc: { wallet: amount} }
      );

      res.json({success:true})

    } 
      res.json({success:true})
    

  } catch (error) {
    console.log(error);
  }
};

const loadInvoice = async (req, res) => {
  console.log("enter into load invoice");
  try {
    const id = req.params.id;
    const user = req.session.userId;
    const userData = await User.findOne({ _id: user });

    const orderData = await orderdb
      .findOne({ _id: id })
      .populate("items.product");

    const date = new Date();

    data = {
      order: orderData,
      user: userData,
      date,
    };
    
     
    const filepathName = path.resolve(__dirname, "../views/user/invoice.ejs");

    const html = fs.readFileSync(filepathName).toString();
    const ejsData = ejs.render(html, data);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({ format: "Letter" });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename= order invoice.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    console.log(error);
  }
};

const returnProduct = async (req,res) => {
 console.log("entering to return product");
  try {
    try {
      console.log(req.body);
      const userId = req.session.userId
      const id = req.body.orderId;

     
      const updatedData = await orderdb.findOneAndUpdate(
        { _id:id },
        {
          $set: {
           status:'returned'
          },
        },
        { new: true }
      );
        
        const refunded = await User.updateOne(
          { _id: req.session.userId },
          { $inc: { wallet: updatedData.totalAmount } }
        );
  
        res.json({success:true})
  
    } catch (error) {
      console.log(error);
    }
    
  } catch (error) { 
    console.log(error.message);
  }


}
module.exports = {
    loadCheckout,
    orderList,
    OrderDetails,
    placeOrder,
    successPage,
    verifyPayment,
    updateStatus,
    orderCancel,
    loadInvoice,
    returnProduct,
  
}