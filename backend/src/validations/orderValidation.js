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
  items: Joi.array()
    .items(
      Joi.object({
        product: objectId.required(),
        qty: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: shippingAddress.required(),
  paymentMethod: Joi.string().valid("cod", "momo").default("cod"),
});

const updateStatus = Joi.object({
  status: Joi.string()
    .valid("processing", "shipped", "delivered", "cancelled")
    .required(),
});

const idParam = Joi.object({
  id: objectId.required(),
});

module.exports = { createOrder, updateStatus, idParam };
