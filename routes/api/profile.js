const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const User=require('../../models/Users');
const Profile=require('../../models/Profile');

router.get('/me',auth,async(req,res)=>{
    try{
        const profile=await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({mssg:"NO user Profile"});
        }

    }catch(err){
        return res.status(500).send('Server Error');
    }
});

module.exports=router;