const User=require('../models/user-model')
const verify_user = (req,res,next)=>{
    try {
        if(req.session.userId){
            next()
        }else{
            res.redirect('/login')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const logout_user = (req,res,next)=>{
    try {
        if(req.session.userId){
           res.redirect('/');
        }else{
           next()
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const blockedstatus = async (req,res,next)=>{
    try {
     if(req.session.userId && (req.url === '/index-5' || req.url === '/shop' || req.url === '/cart' || req.url ==='/profile')) {
     
        const userId = req.session.userId;
        const userData = await User.findById(userId);
        if (userData && userData.is_block) {
            req.session.destroy();
            return res.render('login', { message: 'You are blocked' });
        }
    }
    next();   
    } catch (error) {
        console.log(error.message);
  }
}



module.exports={
    verify_user,
    logout_user,
    blockedstatus,
}