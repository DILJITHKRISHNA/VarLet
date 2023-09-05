const { redirect } = require('express/lib/response');
const nodemailer = require('nodemailer');
const Category = require('../models/category-model');
const upload = require("../middleware/multer")



//list-category
const showcategory = async (req, res) => {

    try {
        console.log("comm onn list category");
        const category = await Category.find()
       
        res.render('list-category', { category })
    } catch (error) {

        console.log(error.message);
    }
}

// show category
const formcategory = async (req, res) => {
    console.log("category has been showed");
    try {
        console.log("entered to try in show category");
        res.render('add-category')
    } catch (error) {
        console.log(error.message);
    }
}
const categoryadd = async (req, res) => {
    try {
        const name = req.body.category;
        console.log(name);

        if (name.trim().length === 0) {
            return res.redirect('/admin/list-category');
        } else {
            const already = await Category.findOne({
                name: { $regex: name, $options: "i" }
            });

            if (already) {
                return res.render('add-category', { message: "Category is already taken" });
            } else {
                const newCategory = new Category({
                    name: name
                });

                const result = await newCategory.save();

                if (result) {
                    res.redirect('/admin/list-category');
                }
            }
        }
    } catch (error) {
        console.error("Error in adding category:", error);
        res.status(500).send("Internal Server Error");
    }
};

// edit category
// const editcategory = async (req, res) => {
//     try {
//         const category=await Category.findById({_id:req.query.id})
        
//       console.log("edit category is working");
//         res.render('edit-category' ,{category})

//     } catch (error) {
//         console.log(error.message,"edit category is not working");
//     }
// }


const editcategory = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id,"query id");
    if (!id) {
      // Handle the case when id is undefined or not provided
      return res.status(400).send('Invalid category ID');
    }

    const editdata = await Category.findById({_id: id});

    if (!editdata) {
      // Handle the case when the category with the given ID is not found
      return res.status(404).send('Category not found');
    }

    res.render('edit-category', { category: editdata });
  } catch (error) {
    console.log(error.message, "error is in edit category");
    res.status(500).send('Internal Server Error');
  }
};

  


// const updatedcategory = async (req, res) => {
//     try {
//         const id = req.query.id;
//         const newCategoryName = req.body.category.trim(); // Trim whitespace from the category name

//         // Use a case-insensitive regular expression to check if the new category name exists
//         const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${newCategoryName}$`, 'i') } });

//         if (existingCategory) {
//             console.log("Category name already exists");
//             // Handle the case where the new category name already exists
//             // You can choose to send an error response, redirect back to the edit page, etc.
//             return res.redirect('/admin/edit-category?id=' + id); // Redirect back to the edit page with the same id
//         }

//         if (id) {
//             await Category.findOneAndUpdate(
//                 { _id: id },
//                 {
//                     $set: {
//                         name: newCategoryName,
//                     }
//                 },
//                 { new: true } // Return the updated document after the update
//             );

//             console.log("Category updated successfully");
//             res.redirect('/admin/list-category');
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const updatedcategory = async (req, res) => {
    try {
        const name = req.body.category;
        const id = req.body.id;
        console.log(req.body);

        const editdata = await Category.findById({ _id: id });
        console.log(editdata, "editdata");

        if (name.trim().length === 0) {
            return res.redirect('/admin/edit-category');
        } else {
            const already = await Category.findOne({
                name: { $regex: name, $options: "i" }
            });

            if (already) {
                return res.render('edit-category', { message: "Category is already taken", category: editdata });
            } else {
                const data = await Category.findOneAndUpdate({ _id: id }, { $set: { name: name } });
                return res.redirect('/admin/edit-category');
            }
        }
    } catch (error) {
        console.error("Error in updated category:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

















const deleteCategory = async (req, res) => {
    try {
            const id = req.query.id
            console.log(id,"delete category is working",);
           const deletecategory = await Category.deleteOne({ _id: id })
                res.redirect('/admin/list-category');
                console.log(deletecategory);
        
    } catch (error) {
        console.log(error.message,"error is in deletecategory");
    }
};
module.exports={
    showcategory,
    formcategory,
    categoryadd,
    editcategory,
    deleteCategory,
    updatedcategory
}