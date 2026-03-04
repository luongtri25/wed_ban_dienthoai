const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createProduct = Joi.object({
  name: Joi.string().trim().min(1).required(),
  slug: Joi.string().trim().min(1).optional(),
  sku: Joi.string().trim().optional(),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().allow("").optional(),
  images: Joi.array().items(Joi.string().trim()).max(3).optional(),
  brand: objectId.optional(),
  category: objectId.optional(),
  specs: Joi.object().pattern(Joi.string().trim(), Joi.string().trim()).optional(),
  isActive: Joi.boolean().optional(),
});

const updateProduct = Joi.object({
  name: Joi.string().trim().min(1),
  slug: Joi.string().trim().min(1),
  sku: Joi.string().trim(),
  price: Joi.number().min(0),
  salePrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  description: Joi.string().allow(""),
  images: Joi.array().items(Joi.string().trim()).max(3),
  brand: objectId.allow(null),
  category: objectId.allow(null),
  specs: Joi.object().pattern(Joi.string().trim(), Joi.string().trim()),
  isActive: Joi.boolean(),
}).min(1);

const idParam = Joi.object({
  id: objectId.required(),
});

const slugParam = Joi.object({
  slug: Joi.string().trim().min(1).required(),
});

module.exports = { createProduct, updateProduct, idParam, slugParam };
