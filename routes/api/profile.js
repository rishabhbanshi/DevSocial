const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/Users");
// const check=require('express-validator/check');
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator");

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

module.exports = router;
