const express = require("express")
const user_route = express();
const userController = require('../controllers/user-controller')
const auth = require('../middleware/auth');
const cartController = require('../controllers/cart-controller')
const orderController = require('../controllers/order-controller')
const productController = require('../controllers/product-controller')
const couponController =  require('../controllers/coupon-controller')

//view engine setup
user_route.set('view engine', 'ejs');
user_route.set('views','./views/user');


//register
user_route.get('/register',userController.loadLogin); 
user_route.post('/register',userController.insertUser);
user_route.get("/logout",auth.verify_user, userController.userLogout);

// //register with login
user_route.get('/login',userController.loadLogin);
user_route.get('/forgetpass',auth.logout_user,userController.forgetpass)
user_route.post('/forgetpass',userController.forgotVerifyMail)
user_route.post('/verifyForgot',userController.verifyForgotMail)
user_route.post('/resubmitPassword',userController.resubmitPassword)
user_route.get('/resubmitPassword',userController.resetPassowrd)

user_route.post('/insertUser',userController.insertUser);
user_route.post('/login',userController.verifyLogin)

// //home
user_route.get("/",userController.loadHome)
user_route.get("/home",auth.blockedstatus,userController.loadHome)
//otp
user_route.get("/otp", userController.LoadOtp);
user_route.post("/checkotp",userController.verifyOTP);
    
//shop
user_route.get('/shop',auth.blockedstatus,userController.loadshop);
user_route.get('/filterCategory/:id',userController.filterCategory)
user_route.get('/apply-filters',userController.applyfilter)


//cart
user_route.post('/add-to-cart',auth.verify_user,cartController.addtocart);
user_route.get('/cart',auth.blockedstatus,auth.verify_user,cartController.ListCart);
user_route.post("/deleteCart", cartController.deleteCart);
user_route.post("/cartQuantityIncrease",auth.verify_user, cartController.cartQuantityIncrease);

//checkout
user_route.get('/checkout',auth.blockedstatus,auth.verify_user,orderController.loadCheckout)
user_route.post('/checkout',auth.verify_user,orderController.placeOrder);
user_route.get("/orderSuccess/:id",auth.verify_user,orderController.successPage);
user_route.post('/verify-payment',orderController.verifyPayment) 

//product
user_route.get('/product-details/:id',auth.blockedstatus,productController.loadUserProduct);


//user profile
user_route.get('/profile',auth.blockedstatus,auth.verify_user, userController.loadUserProfile);
user_route.get('/address',auth.verify_user,userController.loadAddress)
user_route.get('/addAddress',auth.verify_user,userController.loadAddAdress)
user_route.post('/addAddress',userController.loadPostAdress)
user_route.post("/deleteAddress",userController.deleteAddress)
user_route.get('/editAddress',auth.verify_user,userController.loadEditAddress);
user_route.post('/updateAddress',userController.updateAddress)
user_route.get('/walletHistory',auth.verify_user,userController.walletHistory)

//search
user_route.get('/search',productController.search)

//wishlist
user_route.get('/wishlist',auth.verify_user,cartController.loadWishlist)
user_route.post('/wishlist',auth.verify_user,cartController.addToWishList)
user_route.get('/removeItem',auth.verify_user,cartController.removeFromWishlist)

//user order
user_route.get('/orderlist',auth.verify_user,userController.OrderList)
user_route.get('/orderdetails',auth.verify_user,userController.orderDetail)
user_route.post('/cancelOrder/:orderId',orderController.orderCancel)
user_route.get("/invoice/:id",auth.verify_user,orderController.loadInvoice)
user_route.post('/returnorder',orderController.returnProduct)

//coupon
user_route.post('/applyCoupon',couponController.verifyCoupon)

//quickview
user_route.get('/quickView',productController.quickview)

module.exports= user_route