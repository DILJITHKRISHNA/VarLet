const mongoose=require("mongoose");
const express =require('express')
const app =express()
const session = require('express-session');
const multer = require('multer');
const upload = require('./middleware/multer');
const env = require('dotenv')
env.config()
const nocache = require('nocache')
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));
  

// mongoose.connect("mongodb://127.0.0.1:27017/database_user").then((data)=>{
mongoose.connect(process.env.mongodb).then((data)=>{
    
    console.log("mongodb is now connected");
})

const path = require('path')

app.use(express.static(path.join(__dirname,'public')))

app.use(nocache())

// const userRoute = require('./routes/userRoutes')
// app.use('/', userRoute)
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// setting view engine
app.set('view engine', 'ejs')
app.set('views','./views/user')

const adminRoutes = require('./routes/admin-Route');
app.use('/admin', adminRoutes)


const userRoutes = require('./routes/user-Routes');
app.use('/', userRoutes)


app.use((req, res)=>{
  res.render('404')
  });

// Block User Route
app.post('/block-user', (req, res) => {
    const userId = req.body['user-id'];
    
    res.redirect('/user-listing'); 
  });
  
  // Unblock User Route
  app.post('/unblock-user', (req, res) => {
    const userId = req.body['user-id'];
  
    res.redirect('/user-listing'); 
  })

  //port setting
app.listen(3000, function () {
    console.log('server is running in 3000..');
})