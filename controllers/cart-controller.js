const Users = require('../models/user-model');
const Product = require('../models/product-model');
const Cartdb = require('../models/cart-Model');
const { default: mongoose } = require('mongoose');
const addressModel = require('../models/address-Model');
const Wishlistdb = require('../models/wishlist-Model')


//cart

const addtocart = async (req, res) => {



  const owner_id = req.session.userId

  const productId = req.body.productId

  const producting = await Product.findOne()

  // console.log("ijanweiugur", producting)

  const USER = await Cartdb.findOne({ user: req.session.userId });
  const product = await Product.findOne({ _id: productId })
  // console.log(product.stock)
  const cartTotal = product.price;

  if (product.stock <= 0) {
      console.log("no stock availabilty")
    return  res.json({ notAvailable: true })
  }else {
      console.log("stock is there")

      // const cartTotal =product.price;
      if (!USER) {
          const addToCart = await Cartdb({
              user: req.session.userId,
              items: [{ product: productId, Totalprice: product.price }],
              cartTotal: cartTotal
              
            });
          await addToCart.save().then((resp) => {
              console.log("saved succedsfully")
            return  res.redirect("/product/" + productId)

          })

      }
      else {
          const ExitProduct = await Cartdb.findOne({
              user: req.session.userId,
              "items.product": productId
          });

          if (ExitProduct != null) {
              // console.log(ExitProduct)
              console.log("same product exist")
              // let productitem = USER.items[ExitProduct]
              // productitem.quantity=items.quantity;
              // USER.items[ExitProduct]=productitem
              //         console.log("qunatity incresed")
              const Product_quantity = await Cartdb.aggregate([ 
                  {
                      $match:{user: new mongoose.Types.ObjectId(req.session.userId)},


                  },{
                      $project:{
                          items:{
                              $filter:{
                                  input:"$items",
                                  cond:{
                                      $eq:['$$this.product',
                                      new mongoose.Types.ObjectId(productId),
                                  ],
                                  },
                              },

                          },
                      },
                  },

              ])
              const quantity = Product_quantity[0].items[0].quantity;
              if(product.stock<=quantity){
                  console.log("stock reached to limit")
                return  res.json({ stockReached: true });
              }
              else{

              await Cartdb.findOneAndUpdate({
                  user: req.session.userId,
                  "items.product": productId
              },
                  {
                      $inc: {
                          "items.$.quantity": 1,
                          "items.$.Totalprice": product.price,
                          cartTotal: cartTotal


                      },
                  }).then(() => {
                    return  res.redirect("/product/" + productId)
                  })

               }

          }
          else {
              console.log("new product ")
              const addTOcart = await Cartdb.findOneAndUpdate({
                  user: req.session.userId
              }, {
                  $push: {
                      items: {
                          product: productId, Totalprice: product.price
                      }



                  },
                  $inc: {
                      cartTotal: cartTotal
                      // +product.price
                  }
              });

              addTOcart.save().then((response) => {
                  console.log("differnet product reading....")
                 return res.redirect("/product/" + productId)
              })
              

          }

      }

  }
  // res.json({status : true})
}



const ListCart = async (req, res) => {
  try {
    
    let owner_id = req.session.userId
   

    const cartItems = await Cartdb.findOne({ user: new mongoose.Types.ObjectId(owner_id) })
        .populate('items.product')


    res.render('cart', {
      cartData: cartItems,
      user: req.session.userId})
   
  }catch (error) {
          console.log(error.message,"error is in listcart")
    }

  }

  const cartQuantityIncrease = async (req, res) => {
    console.log("enter to cartQuantity");
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        const newQuantity = parseInt(req.body.quantity);

        // Retrieve cart and product data
        const cartData = await Cartdb.findOne({ user: userId });
        const productData = await Product.findOne({});

        // Find the specific cart item
        const cartItem = cartData.items.find(item => item.product._id.toString() === productId);

        // Check if the new quantity exceeds product stock
        if (newQuantity > productData.quantity) {
            return res.json({ success: false, check: true });
        }

        // Update quantity and total price
        cartItem.quantity = newQuantity;
        console.log("Updated quantity:", cartItem.quantity);
        cartItem.Totalprice = productData.price * newQuantity;
        console.log("Updated total price:", cartItem.Totalprice);

        // Update cart total
        const cartTotal = cartData.items.reduce((total, item) => total + item.Totalprice, 0);
        cartData.cartTotal = cartTotal;
        console.log("Updated cart total:", cartTotal);

        // Save changes
        await cartData.save();

        res.json({ success: true, updatedCartTotal: cartTotal });
    } catch (err) {
        console.log(err.message,"error is in quanity increase cart");
    }
};


  
 //detete cart
//=============================REMOVE CART ITEMS ===================================
const deleteCart = async (req, res) => {
  try {
      const userId = req.session.userId;
      const proId = req.body.id;

      const cartData = await Cartdb.findOne({ user: userId });

      if (cartData) {
          const removedItem = cartData.items.find(item => item.product.toString() === proId);
          if (removedItem) {
              const updatedCartTotal = cartData.cartTotal - removedItem.Totalprice;

              await Cartdb.updateOne(
                  { user: userId },
                  { $pull: { items: { product: proId } }, $set: { cartTotal: updatedCartTotal } }
              );

              res.json({ success: true, updatedCartTotal });
          } else {
              res.json({ success: false, message: "Product not found in cart." });
          }
      } else {
          res.json({ success: false, message: "Cart not found for user." });
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: error.message });
  }
};

const loadWishlist = async(req,res)=>{
    try {
        const id = req.session.userId

        const wishlistData = await Wishlistdb.find({ user: id }).populate("products.productId");
        console.log(wishlistData,"wishlist dataa");
          
        if(wishlistData.length > 0){
            const wishlist = wishlistData[0].products
            const product =  wishlist.map((wish)=>wish.productId)
            console.log(product,"product");

            res.render('wishlist',{user:id, wishlist, product});
        }else{
            res.render('wishlist',{user:id, wishlist: [], product: []})
        }

    } catch (error) {
        console.log(error,"error is in loadwishlist");
        
    }
}

const addToWishList = async (req, res) => {
  try {
      
      const id = req.body.proId;
    console.log(id,"proIdddddddddddddddd");
      

      
      const userData = await Users.findById(req.session.userId);
   
      
      const wishlistData = await Wishlistdb
      .find({ user: req.session.userId })
      .populate("products.productId");

   

 if(wishlistData.length >0){
     await Wishlistdb.findOneAndUpdate(
        { user:req.session.userId,},
        {$push:{ products: { productId: id } }}
     )
     res.json({ success: true })
 }else{

      const wishlist = new Wishlistdb({
        user: req.session.userId,
        userName: userData.name,
        products: [
          {
            productId: id,
          },
        ],
      });
      const wish = await wishlist.save();
      if (wish) {
        res.json({ success: true });
      }
    }

        
    } catch (error) {
      console.log(error.message);
    }
  };
  const removeFromWishlist = async (req, res) => {
    try {
      const id = req.query.id;
      const user_id = req.session.userId;
  
      
      const productData = await Wishlistdb.findOneAndUpdate(
        { user: user_id },
        { $pull: { products: { productId: id } } }
      );
      res.redirect("/wishList");
    } catch (error) {
      console.log(error.message);
    }
  };
  

  
  
module.exports={
    addtocart,
    ListCart,
    deleteCart,
    cartQuantityIncrease,
    loadWishlist,
    addToWishList,
    removeFromWishlist,
}