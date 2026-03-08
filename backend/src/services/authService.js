const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const buildAuthResponse = (user) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
    provider: user.provider || "local",
  },
  token: signToken(user),
});

const verifyGoogleIdToken = async (idToken) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) throw new Error("GOOGLE_CLIENT_ID_MISSING");

  const url = `${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`;
  const res = await fetch(url);
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("INVALID_GOOGLE_TOKEN");

  if (payload.aud !== googleClientId) throw new Error("INVALID_GOOGLE_AUDIENCE");
  if (payload.email_verified !== "true") throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
  if (!payload.email || !payload.sub) throw new Error("INVALID_GOOGLE_TOKEN");

  const issuer = payload.iss || "";
  if (issuer !== "accounts.google.com" && issuer !== "https://accounts.google.com") {
    throw new Error("INVALID_GOOGLE_ISSUER");
  }

  return payload;
};

exports.register = async ({ name, email, password, phone }) => {
  const exists = await User.findOne({ email }).lean();
  if (exists) throw new Error("EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    provider: "local",
  });

  return buildAuthResponse(user);
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (!user.passwordHash) throw new Error("USE_GOOGLE_LOGIN");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  return buildAuthResponse(user);
};

exports.googleLogin = async ({ idToken }) => {
  const googleProfile = await verifyGoogleIdToken(idToken);
  const email = googleProfile.email.toLowerCase().trim();
  const googleId = googleProfile.sub;

  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (!user) {
    user = await User.create({
      name: googleProfile.name || email.split("@")[0],
      email,
      provider: "google",
      googleId,
      avatar: googleProfile.picture || "",
      phone: "",
    });
    return buildAuthResponse(user);
  }

  if (user.googleId && user.googleId !== googleId) {
    throw new Error("GOOGLE_ACCOUNT_CONFLICT");
  }

  let changed = false;
  if (!user.googleId) {
    user.googleId = googleId;
    changed = true;
  }
  if (!user.provider) {
    user.provider = "local";
    changed = true;
  }
  if (!user.avatar && googleProfile.picture) {
    user.avatar = googleProfile.picture;
    changed = true;
  }
  if (changed) {
    await user.save();
  }

  return buildAuthResponse(user);
};
