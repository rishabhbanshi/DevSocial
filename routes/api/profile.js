const express=require('express');
const router=express.Router();

router.get('/',(req,res)=>res.send('profile Route'));

module.exports=router;