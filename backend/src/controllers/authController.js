const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    if (err.message === "EMAIL_EXISTS") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(err.status || 500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    if (err.message === "USE_GOOGLE_LOGIN") {
      return res.status(400).json({ message: "Please login with Google for this account" });
    }
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    res.status(err.status || 500).json({ message: "Server error" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const data = await authService.googleLogin(req.body);
    res.json(data);
  } catch (err) {
    if (err.message === "GOOGLE_CLIENT_ID_MISSING") {
      return res.status(500).json({ message: "Google login is not configured on server" });
    }
    if (err.message === "INVALID_GOOGLE_TOKEN") {
      return res.status(400).json({ message: "Invalid Google token" });
    }
    if (err.message === "INVALID_GOOGLE_AUDIENCE") {
      return res.status(400).json({ message: "Google token audience mismatch" });
    }
    if (err.message === "GOOGLE_EMAIL_NOT_VERIFIED") {
      return res.status(400).json({ message: "Google email is not verified" });
    }
    if (err.message === "INVALID_GOOGLE_ISSUER") {
      return res.status(400).json({ message: "Invalid Google token issuer" });
    }
    if (err.message === "GOOGLE_ACCOUNT_CONFLICT") {
      return res
        .status(409)
        .json({ message: "Email is linked to a different Google account" });
    }
    res.status(err.status || 500).json({ message: "Server error" });
  }
};
