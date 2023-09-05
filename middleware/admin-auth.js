const notLogged = (req,res,next) =>{
    try {
        if(req.session.login){
            res.redirect('admin/adminhome')
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error);
    }
}

const logged = (req,res,next) =>{
    try {
        
        if(req.session.login){
            next()
        }
        else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error);
    }
   
}

module.exports={
    notLogged,
    logged
}