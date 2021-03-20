const express=require('express');
const router=express.Router();
const {check, validationResult} = require('express-validator');
const gravatar=require('gravatar');
const bcrypt=require('bcryptjs');

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
 res.send('User registered');
    // res.send('User Route');
}catch(err){
    console.log(err.message);
    res.status(500).send('Server error');
}

}
);

module.exports=router;