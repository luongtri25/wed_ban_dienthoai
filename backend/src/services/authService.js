const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.register = async ({ name, email, password, phone }) => {
  const exists = await User.findOne({ email }).lean();
  if (exists) {
    const err = new Error("EMAIL_EXISTS");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, phone });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: signToken(user),
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 400;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 400;
    throw err;
  }

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: signToken(user),
  };
};
