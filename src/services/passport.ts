import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import User from "../models/User";
import { config } from "dotenv";
import { ErrorResponse } from "../types/types";
config();

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.trim() });
      if (!user) {
        return done(null, false, { message: "Email not registered", code: "EMAIL_NOT_FOUND" } as ErrorResponse);
      }

      const passwordValid = bcrypt.compare(password.trim(), user.password!);
      if (!passwordValid) {
        return done(null, false, { message: "Incorrect Password", code: "INCORRECT_PASSWORD" } as ErrorResponse);
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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY!,
    },
    async function (jwtPayload, done) {
      try {
        const user = await User.findById(jwtPayload.id);
        if (!user) return done(null, false, { message: "User Not Found", code: "USER_NOT_FOUND" } as ErrorResponse);
        return done(null, user);
      } catch (err: any) {
        console.error(err);
        return done(err, false, { message: err.message, code: "INVALID_JWT" } as ErrorResponse);
      }
    }
  )
);

passport.use(
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

        const newUser = new User({
          googleId: profile.id,
          username: profile.emails ? profile.emails[0].value : crypto.randomUUID(),
          email: profile.emails ? profile.emails[0].value : crypto.randomUUID(),
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

passport.serializeUser((user, done) => {
  // @ts-ignore
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
