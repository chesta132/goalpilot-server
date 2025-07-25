import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import User from "../models/User";
import { ErrorResponse } from "../types/types";
import { updateByIdAndSanitize } from "../utils/mongooseUtils";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOneAndUpdate({ email: email.trim() }, { populate: { path: "goals" } });
      if (!user) {
        return done(null, false, { message: "Email not registered", code: "INVALID_EMAIL_FIELD" } as ErrorResponse);
      }

      const passwordValid = await bcrypt.compare(password.trim(), user.password);
      if (!passwordValid) {
        return done(null, false, { message: "Incorrect Password", code: "INVALID_PASSWORD_FIELD" } as ErrorResponse);
      }

      done(null, user);
    } catch (err) {
      console.error(err);
      done(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        }

        const localUser = await User.findOne({ email: profile.emails ? profile.emails[0].value : crypto.randomUUID() });
        if (localUser) {
          await User.findByIdAndUpdate(
            localUser.id,
            { googleId: profile.id, gmail: profile.emails![0].value, verified: localUser.verified || localUser.email === profile.emails![0].value },
            { new: true, runValidators: true }
          );
          return done(null, localUser);
        }

        const usernameScheme = profile.displayName.toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, "");
        const existingUsername = await User.find({ username: { $regex: "^" + usernameScheme } });
        let newUsername = usernameScheme;

        if (existingUsername.length > 0) {
          let counter = 0;
          while (true) {
            const potentialUsername = usernameScheme + (counter === 0 ? "" : counter);
            const isTaken = existingUsername.some((user) => user.username === potentialUsername);

            if (!isTaken) {
              newUsername = potentialUsername;
              break;
            }
            counter++;
          }
        }

        const newUser = new User({
          googleId: profile.id,
          username: newUsername,
          gmail: profile.emails![0]?.value,
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

passport.use(
  "google-bind",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google-bind/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = req.user!;
        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          { googleId: profile.id, gmail: profile.emails![0].value, verified: user.verified || user.email === profile.emails![0].value },
          { options: { new: true, runValidators: true } }
        );
        if (!updatedUser) {
          return done(null, false, {
            title: "User not found",
            message: "User not found, please back to dashboard or sign in page",
            code: "USER_NOT_FOUND",
          } as ErrorResponse);
        }
        return done(null, updatedUser);
      } catch (err) {
        console.error(err);
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return done(new Error("User not found"));
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});
