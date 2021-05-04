const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/Users");
const config = require('config');
const request = require('request');
// const check=require('express-validator/check');
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");
const { findOneAndRemove } = require("../../models/Users");

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ mssg: "No user Profile" });
    }
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills Empty").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ err: err.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //Update Profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
        console.log(err)
      res.status(500).send("Server Error");
    }
  }
);
//GEt all profiles

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//Specific User from id
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name', 'avatar']);
    if(!profile)
     return res.status(400).json({mssg:"No Profile Found"});
    res.json(profile);
  } catch (err) {
    res.status(500).send("No Profile Found");
  }
});

// Delete Profile and User
router.delete("/",auth,async (req, res) => {
  try {
    await Profile.findOneAndRemove({user : req.user.id});

    await User.findOneAndRemove({_id : req.user.id});

    res.json({mssg:"Profile Removed"});
  } catch (err) {
    res.status(500).send("No Profile Found");
  }
});


//Put experience
router.put('/experience',[auth,[
  check("title","title is required").not().isEmpty(),
  check("company","company is required").not().isEmpty(),
  check("from","from is required").not().isEmpty(),
]],async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }=req.body;

  const newExp={
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    const profile =  await Profile.findOne({user:req.user.id});
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
    
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
    
  }
});


//Delete Experience 
router.delete('/experience/:exp_id',auth,async (req,res)=>{
  try {
    const profile = await Profile.findOne({user:req.user.id});

    const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex,1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    res.status(400).send("Server Error");
  }
});


//Add or Update Education

router.put('/education',[auth,[
check('school','school is required').not().isEmpty(),
check('degree','degree is required').not().isEmpty(),
check('fieldofstudy','fieldofstudy is required').not().isEmpty(),
check('from','from is required').not().isEmpty()
]],async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  const{
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }=req.body;

  const newEdu={
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({user:req.user.id});

    profile.education.unshift(newEdu);
    await profile.save();
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
    
  }
});




//Delete Education 
router.delete('/education/:edu_id',auth,async (req,res)=>{
  try {
    const profile = await Profile.findOne({user:req.user.id});

    const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex,1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    res.status(400).send("Server Error");
  }
});

//Get Github Repos
router.get('/github/:username',(req,res)=>{
  try {
    const options = {
      uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created: asc &client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method : 'GET',
      headers : {'user-agent':'node.js'}
    };
    request(options,(errors,response,body)=>{
      if(errors) console.log(errors);
      if(response.statusCode !== 200){
        return res.status(404).json({msg:'No Username Found'});
      }
      res.json(JSON.parse(body));
    })
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error')
  }
})

module.exports = router;
