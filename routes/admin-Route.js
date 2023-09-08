var express = require('express');
var adminRoute = express();
const multer = require("multer")
const upload = require('../middleware/multer');
//////////////////////////////////
const orderController = require("../controllers/order-controller")
const adminController = require("../controllers/admin-controller");
const productController = require('../controllers/product-controller');
const categoryController = require('../controllers/category-controller');
const couponController = require('../controllers/coupon-controller');
//////////////////////////////////

const auth = require('../middleware/admin-auth');
//viewengine
adminRoute.set('view engine', 'ejs');
adminRoute.set('views','./views/admin');

//adminlogin & log out
adminRoute.get('/',adminController.loadlogin);
adminRoute.post('/',adminController.verifyAdmin);
adminRoute.get('/logout',adminController.logout)

//adminDashboard
 adminRoute.get('/adminhome',adminController.loadHome)

//user management
adminRoute.get('/list-user',adminController.loaduser) 
adminRoute.get('/blockuser',adminController.blockUser);
adminRoute.get('/unblockuser',adminController.unblockUser);

//admin category management
adminRoute.get('/list-category',categoryController.showcategory)
adminRoute.get('/add-category',categoryController.formcategory)
adminRoute.post('/add-category',categoryController.categoryadd)
adminRoute.get('/edit-category',categoryController.editcategory)
adminRoute.post('/edit-category',categoryController.updatedcategory)
adminRoute.get('/delete-category',categoryController.deleteCategory);


//admin products management
adminRoute.get('/addproduct',productController.loadAddProduct);
adminRoute.post('/addproduct',upload.array('image',4),productController.addproduct);
adminRoute.get('/list-product',productController.loadListProduct);
adminRoute.get('/edit-product/:id',productController.editproduct)
adminRoute.post('/edit-product/:id',upload.array('newImage'), productController.productupdate)
adminRoute.post("/removeimage",productController.removeImage)
adminRoute.get('/imageCropper',productController.imageCropper)
adminRoute.get('/ListProduct',productController.productlist);
adminRoute.get('/unList-product',productController.productUnList);


//order management
adminRoute.get('/listOrder',orderController.orderList)
adminRoute.get('/orderFullDetails/:id',orderController.OrderDetails)
adminRoute.post('/updateStatus',orderController.updateStatus);

//coupon
adminRoute.get('/couponList',couponController.loadCoupon)
adminRoute.post('/couponList',couponController.addCoupon)
adminRoute.get('/deleteCoupon',couponController.adminDeleteCoupon)
adminRoute.post('/editCoupon/:id',couponController.editCoupon)



//salesReport
adminRoute.get('/salesReport',adminController.loadSalesReport)
adminRoute.post('/salesReportSort',adminController.sortsalesReport)
adminRoute.get('/salesReportDownload',adminController.downloadSalesReport)

module.exports = adminRoute;
