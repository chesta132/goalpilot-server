const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { errorHandler, generateJWT, generateRes } = require("../utils/utils");
require("../services/passport");
require("dotenv").config();

router.post("/signup", async (req, res) => {
  try {
    // const { username, email, password, fullName } = req.body;
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const fullName = req.body.fullName.trim();

    if (!username || !email || !password || !fullName)
      return res.status(422).json({ message: "Username, Email, Password, and Full Name is Required", code: "MISSING_FIELDS" });
    if (await User.findOne({ email: email })) return res.status(460).json({ code: "EMAIL_UNAVAILABLE", message: "Email is already in use" });
    if (await User.findOne({ username: username }))
      return res.status(460).json({ code: "USERNAME_UNAVAILABLE", message: "Username is already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      fullName: fullName,
    });
    await newUser.save();
    const token = generateJWT(newUser);
    const userResponse = generateRes(newUser.toObject(), true);
    res.status(201).json({ ...userResponse, token });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

router.post("/signin", async (req, res) => {
  passport.authenticate("local", { failureRedirect: "/signin", failureFlash: true, session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message });
    }
    if (!user) {
      return res.status(404).json({ message: info.message, code: info.code });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message });
      }
      const token = generateJWT(user);
      const userResponse = generateRes(user.toObject(), true);
      res.status(200).json({ ...userResponse, token });
    });
  })(req, res);
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: false }), (req, res) => {
  const token = generateJWT(req.user);
  res.redirect(`${process.env.FRONTEND_URL}/google/callback/?token=${token}`);
});

router.patch("/signout", async (req, res) => {
  await User.findOneAndUpdate(req._id, { lastActive: Date.now() }, { new: true, runValidators: true });
  res.status(204).send();
});

module.exports = router;
