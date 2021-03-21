const express=require('express');
const router=express.Router();
const {check, validationResult} = require('express-validator');
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs');
const config =require('config');
const jwt =require('jsonwebtoken');

const User=require('../../models/Users');

router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','Not Valid Email').isEmail(),
    check('password','Not valid Password').isLength({ min : 6})
],async (req,res)=>{
const errors=validationResult(req);

if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
}

const{name,email,password}=req.body;

try{
    let user=await User.findOne({email});
    if(user){
        res.status(400).json({errors:[{mssg:'User Exists'}]});
    }
    const avatar=gravatar.url(email,{
    s:'200',
    r:'pg',
    d:'mm'
})
user =new User({
    name,
    email,
    avatar,
    password
});

const salt=await bcrypt.genSalt(10);

user.password=await bcrypt.hash(password,salt);
await user.save();
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