const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const addItem = Joi.object({
  productId: objectId.required(),
  qty: Joi.number().integer().min(1).default(1),
});

const updateQty = Joi.object({
  qty: Joi.number().integer().min(1).required(),
});

const productParam = Joi.object({
  productId: objectId.required(),
});

module.exports = { addItem, updateQty, productParam };
