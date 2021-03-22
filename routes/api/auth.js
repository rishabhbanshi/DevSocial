const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const User=require('../../models/Users')
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const {check, validationResult} = require('express-validator');
const config=require('config');

router.get('/',auth,async (req,res)=>{
    try{
        const user= await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        res.status(500).send('Server error');
    }
});

//VALIDATION OF USER 

router.post('/',[
    check('email','Not Valid Email').isEmail(),
    check('password','Not valid Password').exists()
],async (req,res)=>{
const errors=validationResult(req);

if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
}

const{email,password}=req.body;

try{
    let user=await User.findOne({email});
    if(!user){
        res.status(400).json({errors:[{mssg:'Invalid Creditials'}]});
    }

 const isMatch=await bcrypt.compare(password,user.password);
    
    if(!isMatch){
        res.status(400).json({errors:[{mssg:'Invalid Creditials'}]}); 
    }

 const payload ={
     user:{
        id:user.id
     }
 }
 jwt.sign(payload,config.get('jwtSecret'),{expiresIn:360000},(err,token)=>{
    if(err) throw err;
    res.json({token});
 });
}catch(err){
    console.log(err.message);
    res.status(500).send('Server error');
}

}
);

module.exports=router;