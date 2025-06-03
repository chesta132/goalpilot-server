const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
require("dotenv").config();

const User = require("../models/User");

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, "Incorrect Email or Password");
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return done(null, false, "Incorrect Password");
      }

      done(null, user);
    } catch (err) {
      console.error(err);
      done(err);
    }
  })
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY,
    },
    async function (jwtPayload, done) {
      try {
        const user = await User.findById(jwtPayload.id);
        if (!user) return done(null, false, { message: "User Not Found", code: "USER_NOT_FOUND" });
        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(err, false, { message: err.message, code: "VALIDATION_ERROR" });
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        const newUser = new User({
          googleId: profile.id,
          username: profile.emails[0].value,
          email: profile.emails[0].value,
          fullName: profile.displayName,
        });
        await newUser.save();

        done(null, newUser);
      } catch (err) {
        console.error(err);
        done(err);
      }
    }
  )
);
