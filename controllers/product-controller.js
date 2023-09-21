const Product = require('../models/product-model')
const Category = require('../models/category-model')
const upload = require("../middleware/multer");
const sharp = require("sharp")
const { set } = require('mongoose');


const loadAddProduct = async (req,res) => {
  console.log("enter to load add product");
  try {
    
    const categories = await Category.find({})
    res.render('addproduct',{category: categories,err:false})
    
  } catch (error) {
    console.log(error.message);
  }

}


const loadListProduct = async (req,res) => {
  try {
const productDAta = await Product.find({})
const categories = await Category.find({})

    res.render('list-product',{product:productDAta, category:categories})
  } catch (error) {
    console.log(error.message);
  }

}

const addproduct  = async (req,res)=>{
    try{
     
    
    // const img = req.files.map((image) => image.filename);

    const img = [];

    if(!req.files){
      const categories = await Category.find({})
      res.render('addproduct',{category: categories,err:'Please add a valid image'})

    }

    for (let i = 0; i < req.files.length; i++) {
      img[i] = req.files[i].filename;
      await sharp("./public/productimages/" + req.files[i].filename)
        .resize({
          width: 3400,
          height: 2400,
        })
        .toFile("./public/admin/img/" + req.files[i].filename);
    }

    
     
    const productData = new  Product({
      productName: req.body.name,
      description:req.body.description,
      price:req.body.price,
      category: req.body.category,
      quantity:req.body.quantity,
      images: img,
    })
    const saveData = await productData.save() 
   
      if(saveData){
        res.redirect('/admin/list-product')
      }
    console.log(saveData,"product is adding");  
      
    }catch(error){
      console.log(error.message);
  
    }
  }
  
const editproduct = async (req, res)=>{
  try {
    const id = req.params.id
    const productData = await Product.findOne({_id:id})
    const categories = await Category.find()
    console.log(categories);
    if(productData){
      res.render("edit-product",{
        products:productData,
        category: categories,
       })

    }else{
      res.redirect("/admin/list-product")
    }
  } catch (error) {
      console.log(error.message);
  }
}

const productupdate = async (req, res) => {
  try {
    console.log(req.body, 'body');
    console.log(req.files, 'files'); // Check if files are received
    
    const existingProduct = await Product.findById(req.params.id);
        
    let images = existingProduct.images || [];
         
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(file.filename);
      });
    }
    
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          productName: req.body.name,
          description: req.body.description,
          price: req.body.price,
          category: req.body.category,
          quantity: req.body.quantity,
          images: images,
        }
      },
      { new: true }
    );

    console.log(updatedProduct, 'updated product');
    
    res.redirect('/admin/list-product');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
};



//delete products-------------------------
// const deleteproduct = async (req, res) => {
//   try {
//     const id = req.params.id;
//     await Product.deleteOne({ _id: id });
//     res.redirect("/admin/list-product");
//   } catch (error) {
//     console.log(error.message);
//   }
// };

//remove products-------------------------------------
const removeImage = async (req, res) => {
  const { id, position } = req.body;
  try {
    const productData = await Product.findById(id);
    productData.images.splice(position, 1);
    await productData.save();
    res.send({ success: true, message: 'Image removed' }); // Send a JSON response with success flag
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, message: 'Error removing image' }); // Send a JSON response with success flag
  }
};




const productlist = async (req, res) => {
 console.log("in product list....");
  try {
      const id = req.query.id;
      await Product.updateOne({ _id: id }, { $set: { list: true } }).then((response) => {
          res.redirect('/admin/list-product')
      })
      
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: true, message: 'internal sever error' })
  }
}
//------------------------------------------------------------------------------------------------------------------
const productUnList = async (req, res) => {
  console.log("in product unlist....");
  try {
      const id = req.query.id;
       Product.updateOne({ _id:id }, { $set: { list: false } }).then((response) => {
          res.redirect('/admin/list-product')
      })

  } catch (error) {
      console.log(error);
      res.status(500).json({ error: true, message: 'internal sever error' })
  }
}
const loadUserProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const productData = await Product.findOne({ _id: id });

    if (!productData) {
      // Product not found, render the '404' page
      res.render('404');
      return; // Return early to prevent further execution
    }

    console.log(productData, 'single product');
    res.render('product', {
      product: productData,
    });
  } catch (error) {
    res.render('404');
    console.log(error.message,"error is in load product");
  }
};






// ================image cropper page call==========================
const imageCropper = async (req, res) => {
  try {
    res.render("imageCropper");
  } catch (error) {
    console.log(error.message);
  }
};

//product searching ...
const search = async (req,res)=>{
  console.log(req.body)
 const Sresult= [];
  let payload = req.body.payload;
  console.log(req.body)
  console.log(payload)
  let regExp = new RegExp('^'+payload+'.*','i')
  let searchresults = await Product.aggregate([{$match:{$or:[{name:regExp},{brand:regExp}]}}])
  console.log(searchresults,"<><><><><><><>><")
  searchresults.forEach((el,i)=>{
      Sresult.push({name:el.name , type:'product' ,id:el._id})
  })
  // search = search).slice(0,10);
  res.send({payload: Sresult})
}

const quickview = async(req,res)=>{
  console.log("enter to quick view");
  try {
    
    const productDAta = await Product.find({})
    const categories = await Category.find({})


    res.render('quickView',{product:productDAta, category:categories});

  } catch (error) {
    res.render('500')
    console.log(error,"error is in quickview");
  }
}

module.exports={

   loadAddProduct,
   addproduct,
   loadListProduct,
   editproduct,
   productupdate,
  //  deleteproduct,
     removeImage,
   productlist,
    productUnList,
    loadUserProduct,
    imageCropper,
    search,
    quickview,
}