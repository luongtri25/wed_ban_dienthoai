const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const address = Joi.object({
  fullName: Joi.string().trim().min(1).required(),
  phone: Joi.string().trim().min(6).required(),
  line1: Joi.string().trim().min(1).required(),
  line2: Joi.string().allow("").optional(),
  ward: Joi.string().allow("").optional(),
  district: Joi.string().allow("").optional(),
  city: Joi.string().trim().min(1).required(),
  province: Joi.string().allow("").optional(),
  country: Joi.string().trim().length(2).optional(),
  isDefault: Joi.boolean().optional(),
});

const createUser = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  passwordHash: Joi.string().min(6).required(),
  phone: Joi.string().allow("").optional(),
  role: Joi.string().valid("user", "admin").optional(),
  addresses: Joi.array().items(address).optional(),
  isActive: Joi.boolean().optional(),
});

const updateUser = Joi.object({
  name: Joi.string().trim().min(1),
  email: Joi.string().email(),
  passwordHash: Joi.string().min(6),
  phone: Joi.string().allow(""),
  role: Joi.string().valid("user", "admin"),
  addresses: Joi.array().items(address),
  isActive: Joi.boolean(),
}).min(1);

const idParam = Joi.object({
  id: objectId.required(),
});

module.exports = { createUser, updateUser, idParam };
