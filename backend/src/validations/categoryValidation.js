const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createCategory = Joi.object({
  name: Joi.string().trim().min(1).required(),
  parent: objectId.allow(null).optional(),
  isActive: Joi.boolean().optional(),
});

const updateCategory = Joi.object({
  name: Joi.string().trim().min(1),
  parent: objectId.allow(null),
  isActive: Joi.boolean(),
}).min(1);

const idParam = Joi.object({
  id: objectId.required(),
});

module.exports = { createCategory, updateCategory, idParam };
