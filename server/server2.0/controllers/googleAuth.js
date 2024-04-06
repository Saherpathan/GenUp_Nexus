import "../middlewares/passportConfig.js";
import passport from "passport";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const SECRET = process.env.USER;
let sourceLink = "";

/**
 * Route: /auth/google
 * Desc:  Open google consent screen
 */
export const authGoogle = (req, res, next) => {
  sourceLink = req.query.sourceLink;
  console.log(sourceLink);
  passport.authenticate("google", { scope: ["email", "profile"] })(
    req,
    res,
    next
  );
};

/**
 * Route: /auth/google/callback
 * Desc: handle callback from google
 */
export const callbackGoogle = passport.authenticate("google", {
  successRedirect: "/auth/protected",
  failureRedirect: "/auth/failed",
});

/**
 * Route: auth/protected
 * desc: reditrection after successfull
 *       google auth with userdata in req
 */
export const authenticated = (req, res) => {
  console.log("Hit here!");
  const token = jwt.sign(
    {
      sub: {
        email: req.user.email,
        id: req.user._id,
      },
    },
    SECRET,
    {
      expiresIn: "7d",
    }
  );

  //   console.log(req.user);
  const gRes = {
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    userId: req.user._id,
  };
  // console.log(sourceLink);
  const redirectURL = `${sourceLink}?token=${token}&result=${encodeURIComponent(
    JSON.stringify(gRes)
  )}`;
  res.redirect(redirectURL);
};

/**
 * Route: /failed
 * Desc: Redirection if google authentication failed
 */
export const failed = (req, res) => {
  res.redirect(`${sourceLink}`);
};
