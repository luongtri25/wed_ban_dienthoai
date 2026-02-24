const validate = (schemas) => (req, res, next) => {
  const targets = Object.keys(schemas);

  for (const key of targets) {
    const schema = schemas[key];
    const { error, value } = schema.validate(req[key], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    req[key] = value;
  }

  return next();
};

module.exports = validate;
