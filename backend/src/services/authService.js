const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.register = async ({ name, email, password, phone }) => {
  const exists = await User.findOne({ email }).lean();
  if (exists) throw new Error("EMAIL_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, phone });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { user: { id: user._id, name, email, role: user.role }, token };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { user: { id: user._id, name: user.name, email, role: user.role }, token };
};
