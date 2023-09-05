const res = require('express/lib/response');
const Userdb = require('../models/user-model');
const bcrypt = require('bcrypt');
const Category = require('../models/category-model');
const orderDb = require('../models/order-Model')
const productdb = require('../models/product-model')

// const { any } = require('promise');
// const randomstring=require('randomstring')


//login page render
const loadlogin = async(req,res)=>{
  console.log("heyyyy this is admin login");
  try{
    const admin = req.session.adminId;
    console.log(admin+'<-------ADMIN IN ADMIN LOGIN---------->');
    if(admin) {
      res.redirect('/admin/adminhome')
    } else {
      res.render('signin',{ message: '' })
    }

  }catch(error){
    console.log(error.message);
  }
}

//user admin ---->list user+
const loaduser = async(req,res)=>{
  console.log("heyy this is admin list user");
  try{     
    
    const users= await Userdb.find({})
      res.render('list-user',{users:users})
        console.log(users);

      } catch (error) {
        console.log(error.message);
      }
  }


////////////////////////////////////////////
const verifyAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
      console.log(req.body,'body',process.env.admin,'pass',process.env.password);
    if(process.env.admin === email && process.env.password === password){
      req.session.adminId = true
      res.redirect('/admin/adminhome')
    }else{
      console.log('else')
      res.render('signin', { message: 'Username or password incorrect' });
    }

  } catch (error) {
    console.log(error.message);
  }
};

// app.use(session({
//   secret: 'my-secret-key',
//   resave: false,
//   saveUninitialized: false
// }));

//adminLoadhome
// const loadHome = async (req,res)=>{
//   try{
//     const admin =req.session.adminId;
//     if (admin){
//       res.render('adminhome');
//     }else{
//       res.redirect('/admin/signin')
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// }

const loadHome = async (req, res) => {
  try {
    const productData = await productdb.find({ is_delete: false });
    const userData = await Userdb.find({});
    console.log(userData,"userDataaaaaaaaaa");
    const orderData = await orderDb.find({});
    console.log(orderData);

    const totalSales = await orderDb.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    console.log(totalSales,"total salesssssssss");
    let totalAmount = 0;

    if (totalSales.length > 0) {
      totalAmount += totalSales[0].totalAmount;
      console.log("Total amount of delivered orders:", totalAmount);
    } else {
      console.log("No delivered orders found.");
    }
    const cod = await orderDb.find({ paymentMethod: "COD"}).count();
    const totalCodResult = await orderDb.aggregate([
      {
        $unwind: "$orderData",
      },
      {
       
        $match: { status: "Delivered", paymentMethod: "COD" },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$items.Totalprice" },
        },
      },
    ]);

    let totalCod = 0;
    if (totalCodResult.length > 0) {
      totalCod = totalCodResult[0].totalCodAmount;
    } else {
      console.log("No COD orders found.");
    }
    const online = await orderDb.find({ paymentMethod: "onlinePayment"}).count();
    const totalOnlinePaymentResult = await orderDb.aggregate([
      {
        $unwind: "$orderData",
      },
      {
      
        $match: { status: "Delivered", paymentMethod: "onlinePayment" },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$items.Totalprice" },
        },
      },
    ]);

    let totalOnline = 0;
    if (totalOnlinePaymentResult.length > 0) {
      totalOnline = totalOnlinePaymentResult[0].totalCodAmount;
    } else {
      console.log("No online orders found.");
    }
    const wallet = await orderDb.find({ paymentMethod: "wallet"}).count();
    const totalWalletResult = await orderDb.aggregate([
      {
        $unwind: "$orderData",
      },
      {
       
        $match: { status: "Delivered", paymentMethod: "wallet" },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$items.Totalprice" },
        },
      },
    ]);

    let totalWallet = 0;
    if (totalWalletResult.length > 0) {
      totalWallet = totalWalletResult[0].totalCodAmount;
    } else {
      console.log("No wallet orders found.");
    }

    // first year sales report

    const firstYear = new Date();
    const secondyear = new Date(
      firstYear.getTime() - 365 * 24 * 60 * 60 * 1000
    );

    const totalSalesYear = await orderDb.aggregate([
      {
        $unwind: "$orderData",
      },
      {
        $match: {
          status: "Delivered",
          date: { $gte: secondyear, $lt: firstYear }, // Filter by the specific year
         
        },
      },
      {
        $group: {
          _id: null,
          totalYearAmount: { $sum: "$items.Totalprice" },
        },
      },
    ]);

    let totalAmountYear = 0;

    if (totalSalesYear.length > 0) {
      totalAmountYear = totalSalesYear[0].totalYearAmount;
      console.log("Total amount of delivered orders:", totalAmountYear);
    } else {
      console.log("No delivered orders found.");
    }

    //====================SECOND YEAR AGRIGATION =============//

    const thiredyear = new Date(
      secondyear.getTime() - 365 * 24 * 60 * 60 * 1000
    );

    const totalSalesSecondYear = await orderDb.aggregate([
      {
        $unwind: "$orderData",
      },
      {
        $match: {
          status: "Delivered",
          date: { $gte: thiredyear, $lt: secondyear }, // Filter by the specific year
        },
      },
      {
        $group: {
          _id: null,
          totalSecondYearAmount: { $sum: "$items.Totalprice" },
        },
      },
    ]);

    let totalAmountSecondYear = 0;

    if (totalSalesSecondYear.length > 0) {
      totalAmountSecondYear = totalSalesSecondYear[0].totalSecondYearAmount;
      console.log(
        "Total amount of delivered second orders:",
        totalAmountSecondYear
      );
    } else {
      console.log("No delivered orders found.");
    }

    //=================THIRD YEAR SALES =================//

    const FOURTHYEAR = new Date(
      thiredyear.getTime() - 365 * 24 * 60 * 60 * 1000
    );

    const totalSalesThirdYear = await orderDb.aggregate([
      {
        $unwind: "$orderData",
      },
      {
        $match: {
          status: "Delivered",
          date: { $gte: FOURTHYEAR, $lt: thiredyear }, // Filter by the specific year
        },
      },
      {
        $group: {
          _id: null,
          totalThirdYearAmount: { $sum: "$items.Totalprice" },
        },
      },
    ]);

    let totalAmountThirdYear = 0;

    if (totalSalesThirdYear.length > 0) {
      totalAmountThirdYear = totalSalesThirdYear[0].totalThirdYearAmount;
      console.log(
        "Total amount of delivered second orders:",
        totalAmountThirdYear
      );
    } else {
      console.log("No delivered orders found.");
    }



    res.render("adminhome", {
      product: productData,
      user: userData,
      order: orderData,
      total: totalAmount,
      totalCod,
      totalWallet,
      totalOnline,
      firstYear,
      totalAmountYear,
      secondyear,
      totalAmountSecondYear,
      thiredyear,
      totalAmountThirdYear,
      online,
      cod,
      wallet
      
    });
  } catch (error) {
    console.log(error.message);
  }
};



// logout
const logout = async (req, res) => {

  try {
    req.session.destroy()

    res.redirect('/admin')
  } catch (error) {
    console.log(error.message);
  }
}



  const blockUser = async (req, res) => {
    console.log("block");
      try {
          const id = req.query.id;
          console.log(id);
          const user = await Userdb.findByIdAndUpdate({ _id: id }, { $set: { is_block: false} });
        
          if (user) {
              res.redirect('/admin/list-user')
          } else {
              res.redirect("/admin/list-user")
          }
      } catch (error) {
          console.log(error.message);
      }
  }
  const unblockUser = async (req, res) => {
    try {
      
        const id = req.query.id;
        const user = await Userdb.updateOne({ _id: id }, { $set: { is_block: true } });
        if (user) {
          res.redirect('/admin/list-user')
        } else {
          res.redirect('/admin/list-user')

        }
    } catch (error) {
        console.log(error.message)
    }
}


//sales Report
const loadSalesReport = async (req, res) => {
  try {
    const orderData = await orderDb.aggregate([
      { $unwind: "$items" },
      { $match: { status: "Delivered" } },
      { $sort: { date: -1 } },
    ]);

    res.render("salesReport", {
      order: orderData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const sortsalesReport = async (req, res) => {
  console.log("enter to sort sales reoport");
  try {
    const from = req.body.fromDate;
    const to = req.body.toDate;
    console.log(req.body,"bodyyyyyyyyyy");

    const orders = await orderDb.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          status: "Delivered",
          $and: [
            { "items.date": { $gt: new Date(from) } },
            { "items.date": { $lt: new Date(to) } },
          ],
        },
      },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "items",
          let: { productId: { $toObjectId: "$items.product" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$product"] } } }],
          as: "items.productDetails",
        },
      },
      {
        $addFields: {
          "items.productDetails": {
            $arrayElemAt: ["$items.productDetails", 0],
          },
        },
      },
    ]);
    console.log(orders,"ordersssssssssss");
    res.render("salesReport", { order:orders });
  } catch (error) {
    console.log(error.message);
  }
};

const downloadSalesReport = async (req,res)=>{
try {
  
  const fromDate = new Date(req.query.fromDate);
  const toDate = new Date(req.query.toDate);

  // Fetch and filter sales report data from the database
  // Replace this with your actual database query
  const filteredSalesReport = getFilteredSalesReport(fromDate, toDate);

  // Define CSV fields based on your sales report data structure
  const fields = ['date', 'product', 'quantity', 'Totalprice', 'paymentMethod', 'totalAmount', 'status'];

  const json2csvParser = new Parser({ fields });
  const csvData = json2csvParser.parse(filteredSalesReport);

  const filePath = path.join(__dirname, 'temp', 'sales_report.csv'); // Change the file path as needed

  // Write the CSV data to a file
  fs.writeFileSync(filePath, csvData, 'utf-8');

  // Send the file as a downloadable attachment
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');

} catch (error) {
  
}
}
module.exports={
  loadlogin,
  verifyAdmin,
  loadHome,
  loaduser,
  logout,
  blockUser,
  unblockUser,
  loadSalesReport,
  sortsalesReport,
  downloadSalesReport,
}