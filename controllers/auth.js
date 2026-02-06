// Controllers folder: Authentication logic (login, register, logout)
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();

    // Notify Admins about new registration
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      if (admin.notificationPreferences?.customerAlerts !== false) {
        await Notification.create({
          user: admin._id,
          title: "New Customer!",
          message: `${newUser.username} just joined the family.`,
          type: "tracking", // Or a new type if preferred
          link: "/admin/customers",
          read: false
        });
      }
    }

    res.status(200).json("User has been created.");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log("Login attempt for:", req.body.username);

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return next(createError(400, "Wrong password or username!"));
    }

    console.log("Login successful for:", req.body.username);

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password, ...otherDetails } = user._doc;

    // ✅ SEND TOKEN ONLY (NO COOKIE)
    res.status(200).json({
      success: true,
      token,
      user: otherDetails,
    });

  } catch (err) {
    next(err);
  }
};


export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(createError(404, "Email not found. Please check and try again."));
    }

    // Here implies user exist. In a real app we would generate valid token and send email.
    // For now we just return success so frontend knows the email is valid.

    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (err) {
    next(err);
  }
};

// Google OAuth Authentication
export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return next(createError(400, "Google credential is required"));
    }

    // Import OAuth2Client from google-auth-library
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email });

      if (user) {
        // User exists with email but not Google ID - link accounts
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.name) user.name = name;
        await user.save();
      } else {
        // Create new user
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 7);

        user = new User({
          googleId,
          email,
          name,
          username,
          authProvider: 'google',
          role: 'user'
        });

        await user.save();

        // Notify Admins about new registration
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          if (admin.notificationPreferences?.customerAlerts !== false) {
            await Notification.create({
              user: admin._id,
              title: "New Customer!",
              message: `${user.username} just joined via Google.`,
              type: "tracking",
              link: "/admin/customers",
              read: false
            });
          }
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password, ...otherDetails } = user._doc;

    res.status(200).json({
      success: true,
      token,
      user: otherDetails,
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    next(createError(401, "Google authentication failed"));
  }
};