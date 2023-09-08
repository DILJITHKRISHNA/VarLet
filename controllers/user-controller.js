const UserDb = require("../models/user-model")
const Product = require('../models/product-model')
const bcrypt = require('bcrypt')
const { otpGen } = require("./otp-controller");
const { name } = require('ejs');
const Address = require('../models/address-Model');
const crypto = require('crypto')
const passwordValidator = require('password-validator');
const nodemailer = require("nodemailer");
const { response } = require("../routes/user-Routes");
const { log } = require("console");
const mongoose = require('mongoose')
const Orderdb = require('../models/order-Model');
const addressModel = require("../models/address-Model");
const orderModel = require("../models/order-Model");
const categorymodel = require("../models/category-model");

var schema = new passwordValidator();


schema
  .is().min(5)
  .is().max(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces()



let otp1
let registerdEmail;

let OTP = otpGen();
let userData;

const securepassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;

  } catch (error) {
    console.log(error.message);
  }
}




/////
const LoadOtp = (req, res) => {
  try {
    res.render("otp");
  } catch (error) {
    console.log(error.message);
  }
};

/////
const loadLogin = async (req, res) => {

  try {

    res.render('login')

  } catch (error) {
    console.log(error.message);
  }
}
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  console.log("heyy this is user home");
  
  try {
    const product = await Product.find({})

    res.render('index-5', { productData: product });

  } catch (error) {
    console.log(error.message);
  }
}


const loadSignup = async (req, res) => {
  try {
    console.log('ll');
    res.render('signup')

  } catch (error) {
    console.log(error.message);
  }
}

//   sendOTP(userData.name,userData.email,OTP)

const sendOTP = async (name, email, OTP) => {

  try {
    console.log('is working send otp');
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "diljithkrishna327@gmail.com",
        pass: 'ieqklurshqrwbrfm'
      }
    });

    const mailOptions = {
      from: "diljithkrishna327@gmail.com",
      to: email,
      subject: 'Your OTP',
      text: OTP
    };

    await transporter.sendMail(mailOptions);
    console.log("Email has been sent");
  } catch (error) {
    console.log("error is on sendOTP method", error.message);
  }
}


// const resendOTP = async (req, res) => {

//     try {

//         sendOTP(req.session.username, req.session.email, OTP);

//     } catch (error) {
//         console.log('resendOtp method', error.message);
//     }

// };

const insertUser = async (req, res) => {
  try {
    console.log("insert user");
    console.log(req.body);

    const spassword = await securepassword(req.body.password);
    // Check if the email is already registered
    const existingUser = await UserDb.findOne({ email: req.body.email });

    if (existingUser) {
      // If the email is already registered, return an error response
      res.render('login', { message: "Email already registered." });
    }

    const user = await UserDb({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: spassword,

      is_verified: 0,
    });
    const userData = await user.save();
    console.log("user Inserted");
    req.session.user_id = userData._id;
    console.log(req.session.user_id);
    await sendOTP(user.name, user.email, OTP);

    registerdEmail = user.email;

    otp1 = OTP;

    res.render("otp");


  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};



const verifyOTP = async (req, res) => {

  try {

    console.log("this is otp check");
    const otp = req.body.otp;


    if (otp == otp1) {
      console.log(otp, "============================================");

      const isVerified = await UserDb.findOneAndUpdate(
        { email: registerdEmail }, { $set: { is_verified: 1 } })

      console.log(isVerified, "==========++++++++++++++++++++++++++++++++++");
      res.render('login')



    } else {
      console.log('gg');
      res.render('register', { messageFailed: 'Incorrect OTP' })
    }

  } catch (error) {
    console.log(error.message);
  }

};
const verifyLogin = async (req, res) => {
  try {
    console.log('entered to verify login');
    const email = req.body.email;
    const password = req.body.password;

    const userData = await UserDb.findOne({ email: email });

    console.log(userData, 'userdata');

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_verified === 1) {
          if (!userData.is_block) {
            req.session.isLoggedIn = true;
            req.session.userId = userData._id;
            res.redirect('/');
            console.log('lll');
          } else {
            req.session.isLoggedIn = false; // Set isLoggedIn to false if the user is blocked
            res.render('login', { message: 'You are Blocked by admin!' });
          }
        } else {
          res.render('login', { message: 'Password incorrect!' });
        }
      } else {
        res.render('login', { message: 'Incorrect credentials!' });
      }
    } else {
      res.render('login', { message: 'User does not exist!' });
    }
  } catch (error) {
    console.log(error);
  }
};


const sendVerifyMail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "diljithkrishna327@gmail.com",
        pass: "ieqklurshqrwbrfm"
      }
    });

    const mailOptions = {
      from: "diljithkrishna327@gmail.com",
      to: email,
      subject: 'Verification Email',
      html: `<p>Hi ${name}, please click <a href="http://localhost:3000/otp">here</a> to verify and enter your verification email. This is your OTP: ${otp}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email has been sent:', info.response);
    console.log(otp);
  } catch (error) {
    console.log(error);
  }
};

const forgetpass = async (req, res) => {
  try {
    res.render("forgetpass")
  } catch (error) {
    console.log(error,"error is in forget pass");
  }
}


let otpv;
let emailv;
const forgotVerifyMail = async (req, res) => {
  try {
    console.log("hiii im here");
    const email = req.body.email;
    const userData = await UserDb.findOne({ email: email });
    const name = userData.name;
    console.log(userData.name, "userdata.name");
    if (userData) {
      const randomnumber = Math.floor(Math.random() * 9000) + 1000;
      otpv = randomnumber;
      emailv = email;
      sendVerifyMail(name, email, randomnumber);
      res.render("forgetpass", { message: "please check your email" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyForgotMail = async (req, res) => {
  try {
    const otp = req.body.otp;

    if (otp == otpv) {
      res.render("resubmitPassword");
    } else {
      res.render("forgetpass", { message: "otp is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resubmitPassword = async (req, res, next) => {
  console.log('jhgghfhgfgfgfdfdfdfdfsfdsfdsf');
  try {
    if (req.body.password != req.body.password2) {
      console.log(req.body, 'hererererererer');
      return res.render("resubmitPassword", {
        message: "Password Not Matching",
      });
    }

    if (req.body.password.length < 5) {
      return res.render("resubmitpassword", {
        message: "Password Must Be Strong",
      });
    }

    const spassword = await securepassword(req.body.password);

    const changePassword = await UserDb.findOneAndUpdate(
      { email: emailv },
      { $set: { password: spassword } }
    );

    console.log(changePassword, 'change password........');

    if (changePassword) {
      return res.redirect("/login"); // Redirect to the login page
    } else {
      return res.render("resubmitPassword", {
        message: "Please try again!!",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};


// const resubmitPass = async (req, res, next) => {
//   try {

//   } catch (error) {
//     next(error);
//   }
// };


const resetPassowrd = (req, res) => {
  try {
    const token = req.params.token;
    UserDb.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(users => {


      res.render('login')
    })

  }
  catch (error) {
    res.render('user/404error')
  }
}


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


const loadshop = async (req, res) => {
  try {
    console.log(req.query, 'queryyyyy');
    const search = req.query.search || '';
    const cat = req.query.category || '';
    const price = req.query.sort || '';
    const page = req.query.page || 1;
    const limit = 8;
    const nameRegex = new RegExp(search, 'i');

    let products;
    let productCount;

    let sortOption; 

    if (req.query.sort) {
      sortOption = req.query.sort;
    }
    
    console.log(sortOption,"sortoopptionnnnnn");
    if (req.query.search) {
      products = await Product.find({ list: true, $text: { $search: search } });
    } else {
      console.log(search, 'search.....');
      products = await Product.find({ list: true });
    }
    if (req.query.category) {
      products = await Product.find({ list: true, category: req.query.category });
    }

    else if (sortOption === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    }else if (req.query.category && req.query.sort) {

      products = await Product.find({ list: true, category: req.query.category,price:price}).sort({ price: 1 }); 
    }


    const totalPages = Math.ceil(products.length / limit);
    products = products.slice((page - 1) * limit, page * limit);

    const data = await categorymodel.find({ is_active: true });

    res.render('shop', {
      productData: products,
      categoryId: data._id,
      category: data,
      totalPages: totalPages,
      currentPage: page,
      search: search,
      selectedSort: sortOption, // Pass the selected sort option to the template
    });
  } catch (error) {
    console.log(error, "error is in load shop");
  }
};





const filterCategory = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = req.query.page || 1;
    const limit = 8;
    
    const categoryId = req.params.id;

    const productCount = await Product.countDocuments({
      category: categoryId,
      list: true,
      $or: [
        { productName: { $regex: '.*' + search + '.*', $options: 'i' } },
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
      ],
    });

    const totalPages = Math.ceil(productCount / limit);
    console.log(totalPages,"totalpages");

    const productData = await Product.find({
      category: categoryId,
      list: true,
      $or: [
        { productName: { $regex: new RegExp('.*' + search + '.*', 'i') } },
        { name: { $regex: new RegExp('.*' + search + '.*', 'i') } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);

    const categories = await categorymodel.find({ is_active: true });

    res.render('shop', {
      totalPages: totalPages,
      productData: productData,
      category: categories,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const applyfilter = async (req, res) => {
  try {
      const selectedCategory = req.query.category;
      const selectedSort = req.query.sort;
      console.log("-----",selectedCategory);
      console.log("-----",selectedSort);

      // Use a filter object to build the query dynamically based on selected filters
      const filter = {};
      if (selectedCategory) {
          filter.category = selectedCategory;
      }

      // Use a sort object to specify sorting order based on selected sort option
      const sort = {};
      if (selectedSort === 'price-asc') {
          sort.price = 1;
      } else if (selectedSort === 'price-desc') {
          sort.price = -1;
      }

      // Use the filter and sort objects to query the database
      const products = await Product.find(filter);
      console.log('-----------------',products);

      res.json({ status: true, products });
  } catch (error) {
      console.error(error, "error is in apply filter");
      res.json({ status: false, error: 'Error applying filters' });
  }
};


const loadUserProfile = async (req, res) => {

  try {
    console.log("entered to load userprofile");
    const userId = req.session.userId;
    const userData = await UserDb.findOne({ _id: userId })

    res.render('profile', { user: userData, userId });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: true, message: 'internal sever error in load user profile' })
  }
}

const loadAddress = async (req, res) => {
  try {

    const userId = req.session.userId;

    const addresses = await Address.findOne({ userId: userId })
    console.log(addresses);
    res.render('address', { address: addresses.addresses })

  } catch (error) {

    console.log(error.message, "error is in loadAddress");

  }
}
const showaddress = async (req, res) => {
  try {
    // const userData = await User.findOne({_id:req.session.user_id})
    const addresses = await Address.findOne({ userId: req.session.user_id })
    const user = true

    res.render('address', { address: addresses, user })
  } catch (error) {
    console.log(error.message);
    console.log('error from showaddress');
    res.render('500')

  }
}

// const addingAddress = async (req,res)=>{
//   try{

//     if(req.session.user_id){
//       const userId = await req.session.user_id;
//       console.log(userId);
//       let addressObj = {

//         fullname: req.body.name,
//         mobile: req.body.mobile,
//         pincode: req.body.pincode,
//         houseAddress: req.body.address,
//         cityName: req.body.city,
//         state: req.body.state

//       }
//       console.log(addressObj);
//       const userAddress = await Address.findOne({userId: userId});

//       if(userAddress){
//         const useraddrs = await Address.findOne({userId: userId }).populate(userId).exec()
//         console.log(useraddrs);
//         useraddrs.userAddress.push(addressObj)
//          useraddrs.save().then((response)=>{ 
//             res.redirect('/profile')
//           }).catch((err)=>{
//             res.send(err)
//           })
//       }else{

//         let useraddressobj = {
//           userId: userId,
//           userAddress:[addressObj]
//         }
//         console.log(useraddressobj);
//          Address.create(useraddressobj).then((response)=>{
//           res.redirect('/profile')
//         })

//       }

//     }

//   }catch (error){

//     console.log(error.message,"error is in adding address");
//     res.render(500)

//   }
// }
const loadAddAdress = async (req, res) => {
  try {

    console.log("-----------------", req.session.user_id);

    const address = await Address.findOne({ userId: req.session.userId })

    res.render('addAddress', { address })

  } catch (error) {

    console.log(error.message, "error is in load add address");

  }
}

const loadPostAdress = async (req, res) => {
  try {
    const address = {
      userName: req.body.name,
      mobile: req.body.mobile,
      houseName: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
    };

    console.log("Entering load post address");

    // Find the existing document based on userId
    const existingAddress = await Address.findOne({ userId: req.session.userId });

    if (existingAddress) {
      existingAddress.addresses.push(address); // Push the new address to the addresses array
      const saveData = await existingAddress.save();
      if (saveData) {
        res.redirect('/checkout');
      } else {
        res.render('address', { address });
      }
      console.log(saveData, "Address is added");
    } else {
      // Create a new document with the address
      const newAddressData = new Address({
        userId: req.session.userId,
        addresses: [address],
      });

      const saveData = await newAddressData.save();
      if (saveData) {
        res.redirect('/checkout');
      } else {
        res.render('address');
      }
      console.log(saveData, "New address document is created");
    }

  } catch (error) {
    console.log(error.message, "Error in load post address");
  }
};

//=========================== DELETE ADDRESSS ==========================

const deleteAddress = async (req, res) => {
  try {

    const id = req.body.id;
    await addressModel.updateOne(
      { userId: req.session.userId },
      { $pull: { addresses: { _id: id } } }
    );
    res.json({ remove: true });
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const session = req.session.userId;
    const user = await UserDb.find();
    const addressData = await addressModel.findOne(
      { userId: req.session.userId },
      { addresses: { $elemMatch: { _id: id } } }
    );
    const address = addressData.addresses;

    res.render("editAddress", {
      addresses: address[0], session
    });
  } catch (error) {
    console.log(error.message);

  }
};

//============================INSERT UPDATED ADDRESS =================

const updateAddress = async (req, res) => {
  console.log("enter to the update address page");
  try {
    const id = req.query.id;
    const session = req.session.userId;
    console.log(req.body.alternativenumber);
    const address = await addressModel.updateOne(
      { userId: req.session.userId },
      { $pull: { addresses: { _id: id } } }
    );

    const pushAddress = await addressModel.updateOne(
      { userId: session },
      {
        $push: {
          addresses: {
            userName: req.body.userName,
            mobile: req.body.mobile,
            houseName: req.body.hoseName,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        },
      }
    );
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const walletHistory = async (req, res) => {
  try {

    const orderdb = await orderModel.find({ userId: req.session.userId, paymentMethod: "wallet" });

    res.render('walletHistory', { orders: orderdb })
  } catch (error) {
    console.log(error, "error is in wallet history");
  }
}

// <=====================user order list=============================>

const OrderList = async (req, res) => {
  try {
    const orderId = req.body.orderId
    const orderDb = await Orderdb.find({ userId: req.session.userId }).populate('items.product');
    res.render('listOrder', {
      orders: orderDb,

    })


  } catch (error) {
    console.log(error, "error is in order list");
  }
}

const orderDetail = async (req, res) => {
  try {
    const id = req.query.id
    const session = req.session.userId

    const orderData = await Orderdb
      .findOne({
        _id: req.query.id,
      })
      .populate("items.product");
    const productsData = orderData.items;

    const order = await Orderdb.findOne({ _id: id })


    res.render("orderDetails", { products: productsData, order, session });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {

  insertUser,
  verifyLogin,
  loadLogin,
  loadHome,
  userLogout,
  sendOTP,
  loadSignup,
  verifyOTP,
  loadshop,
  LoadOtp,
  loadUserProfile,
  loadAddress,
  // addingAddress
  loadAddAdress,
  loadPostAdress,
  forgetpass,
  forgotVerifyMail,
  resetPassowrd,
  verifyForgotMail,
  resubmitPassword,
  // resubmitPass,
  showaddress,
  OrderList,
  deleteAddress,
  loadEditAddress,
  updateAddress,
  walletHistory,
  orderDetail,
  filterCategory,
  applyfilter,
  // resendOTP,

}
