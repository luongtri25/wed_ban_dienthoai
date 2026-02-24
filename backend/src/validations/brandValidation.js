const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createBrand = Joi.object({
  name: Joi.string().trim().min(1).required(),
  country: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional(),
});

const updateBrand = Joi.object({
  name: Joi.string().trim().min(1),
  country: Joi.string().allow(""),
  isActive: Joi.boolean(),
}).min(1);

const idParam = Joi.object({
  id: objectId.required(),
});

module.exports = { createBrand, updateBrand, idParam };
