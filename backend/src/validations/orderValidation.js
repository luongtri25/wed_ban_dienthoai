const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const orderItem = Joi.object({
  product: objectId.required(),
  name: Joi.string().trim().min(1).required(),
  price: Joi.number().min(0).required(),
  qty: Joi.number().integer().min(1).required(),
  image: Joi.string().allow("").optional(),
});

const shippingAddress = Joi.object({
  fullName: Joi.string().trim().min(1).required(),
  phone: Joi.string().trim().min(6).required(),
  line1: Joi.string().trim().min(1).required(),
  line2: Joi.string().allow("").optional(),
  ward: Joi.string().allow("").optional(),
  district: Joi.string().allow("").optional(),
  city: Joi.string().trim().min(1).required(),
  province: Joi.string().allow("").optional(),
  country: Joi.string().trim().length(2).optional(),
});

const createOrder = Joi.object({
  user: objectId.required(),
  items: Joi.array().items(orderItem).min(1).required(),
  shippingAddress: shippingAddress.required(),
  paymentMethod: Joi.string().optional(),
  paymentStatus: Joi.string().valid("pending", "paid", "failed").optional(),
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .optional(),
  itemsPrice: Joi.number().min(0).required(),
  shippingPrice: Joi.number().min(0).optional(),
  totalPrice: Joi.number().min(0).required(),
});

const updateOrder = Joi.object({
  items: Joi.array().items(orderItem).min(1),
  shippingAddress,
  paymentMethod: Joi.string(),
  paymentStatus: Joi.string().valid("pending", "paid", "failed"),
  status: Joi.string().valid("pending", "processing", "shipped", "delivered", "cancelled"),
  itemsPrice: Joi.number().min(0),
  shippingPrice: Joi.number().min(0),
  totalPrice: Joi.number().min(0),
}).min(1);

const idParam = Joi.object({
  id: objectId.required(),
});

module.exports = { createOrder, updateOrder, idParam };
