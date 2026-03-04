module.exports = (err, req, res, next) => {
  console.error(err);

  if (err?.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value",
      fields: err.keyValue || {},
    });
  }

  if (err?.status) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal Server Error" });
};
