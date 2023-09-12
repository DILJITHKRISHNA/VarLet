const couponDb = require("../models/coupon-Model");
const userDb = require("../models/user-model");

const orderDb = require('../models/order-Model')

//=================ADMIN LOAD COUPON=======================//

const loadCoupon = async (req, res) => {
    try {
      const couponsData = await couponDb.find({status:true}).populate("usedUsers");
     
      const todaydate = new Date();
      res.render("couponList", { coupons: couponsData, todaydate });
    } catch (error) {
      console.log(error.message);
    }
  };

  const addCoupon = async (req, res) => {
    try {
      const alreadyCoupon = await couponDb.findOne({
        couponCode: req.body.couponCode.trim(),
      });
      console.log(alreadyCoupon,"already couponnnnnn");
      if (alreadyCoupon) {
        //here it checks if a couponcode already exists in the couponDb
        res.redirect('/admin/couponList')
      } else {
        //if it doesnt exist then it creats a new coupon db with data from the req.body
        const data = new couponDb({
          couponName: req.body.couponName,
          couponCode: req.body.couponCode.trim(),
          discountPercentage: req.body.discountPercentage,
          activationDate: req.body.activationDate,
          criteriaAmount: req.body.criteriaAmount,
          expiryDate: req.body.expiryDate,
          usersLimit: req.body.usersLimit,
        });
        console.log(data,'dataadddd');
        const savedData = await data.save();
      }
  
      res.redirect("/admin/couponList");
    } catch (error) {
      console.log(error.message);
    }
  };

  //================= ADMIN EDIT COUPON =====================//

const editCoupon = async (req, res) => {
  console.log("entered to edit coupon");
  try {
    const id = req.params.id;
    const updatedCoupon = await couponDb.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          couponName: req.body.couponName,
          couponCode: req.body.couponCode,
          discountPercentage: req.body.discountPercentage,
          activationDate: req.body.activationDate,
          criteriaAmount: req.body.criteriaAmount,
          expiryDate: req.body.expiryDate,
          usersLimit: req.body.usersLimit,
        }, 
      }
    );

    if (updatedCoupon) {
      res.redirect("/admin/couponList");
    } else {
      res.redirect("/admin/couponList");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//=============== VARIFY COUPON FOR USER =====================

const verifyCoupon = async (req, res) => {
    try {
      const code = req.body.couponCode;
      console.log(code,"coupon codeeeeeeeeee");
      const amount = req.body.amount;
      console.log(amount,"amounttttttttttttt");
      const id = req.session.userId;
      console.log(id,"iddddddddddddddddddddd");
      const verifyData = await couponDb.findOne({
        couponCode: code,
        usedUsers: { $in: { id } },
      });
      if (verifyData) {
        res.json({ usedSuccess: true });
      } else {
        const couponData = await couponDb.findOne({ couponCode: code });
        if (couponData.expiryDate >= new Date()) {
          if (couponData.criteriaAmount <= amount) {
            if (couponData.usersLimit > 0) {
              await couponDb.findOneAndUpdate(
                { _id: couponData._id },
                {
                  $push: {
                    usedUsers: { id },
                  },
                  $inc: {
                    usersLimit: -1,
                  },
                }
              );
              const percentage = Math.round(
                (amount * couponData.discountPercentage) / 100
              );
              console.log(percentage);
              const lastTotal = Math.round(amount - percentage);
              console.log(lastTotal);
              res.json({ verifiedsuccess: true, lastTotal, percentage });
            } else {
              res.json({ limitsuccess: true });
            }
          } else {
            res.json({ critirianot: true });
          }
        } else {
          res.json({ notdate: true });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  
  const adminDeleteCoupon = async (req, res) => {
    console.log("entered into admindeletcoupon");
    try {
      const id = req.query.id;
      const deletedData = await couponDb.findByIdAndDelete({ _id: id });
      res.redirect("/admin/couponList");
    } catch (error) {
      console.log(error,"error is in admindelete coupon");
    }
  };

  module.exports ={
    loadCoupon,
    addCoupon,
    editCoupon,
    verifyCoupon,
    adminDeleteCoupon,
  }