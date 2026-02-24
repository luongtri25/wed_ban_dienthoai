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
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    res.status(err.status || 500).json({ message: "Server error" });
  }
};
