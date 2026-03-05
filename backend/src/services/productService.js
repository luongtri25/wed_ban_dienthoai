const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

const slugify = (value = "") => {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toIdString = (value) =>
  typeof value === "string" ? value : value?.toString?.() || "";

const getAccessoryCategoryIds = async () => {
  const categories = await Category.find({ isActive: true })
    .select("_id name parent")
    .lean();

  const root = categories.find(
    (category) => normalizeText(category.name) === "phu kien"
  );
  if (!root) return [];

  const rootId = toIdString(root._id);
  return categories
    .filter((category) => {
      const categoryId = toIdString(category._id);
      const parentId = toIdString(category.parent);
      return categoryId === rootId || parentId === rootId;
    })
    .map((category) => category._id);
};

const buildUniqueSlug = async (baseSlug, excludeId) => {
  const base = baseSlug || `product-${Date.now()}`;
  let slug = base;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const exists = await Product.findOne(query).select("_id").lean();
    if (!exists) return slug;

    slug = `${base}-${counter}`;
    counter += 1;
  }
};

exports.getAll = async ({ brand, category, accessory } = {}) => {
  const query = { isActive: true };
  if (brand) query.brand = brand;
  if (category) query.category = category;

  if (!category && accessory) {
    const accessoryIds = await getAccessoryCategoryIds();
    if (!accessoryIds.length) return [];
    query.category = { $in: accessoryIds };
  }

  return Product.find(query).sort({ createdAt: -1 }).lean();
};

exports.getById = async (id) => {
  return await Product.findById(id).lean();
};

exports.getBySlug = async (slug) => {
  return await Product.findOne({ slug }).lean();
};

exports.create = async (payload) => {
  const data = { ...payload };
  const baseSlug = slugify(data.slug || data.name || "");
  if (baseSlug) {
    data.slug = await buildUniqueSlug(baseSlug);
  }

  const doc = await Product.create(data);
  return doc.toObject();
};

exports.update = async (id, payload) => {
  const data = { ...payload };

  if (data.slug || data.name) {
    const baseSlug = slugify(data.slug || data.name || "");
    if (baseSlug) {
      data.slug = await buildUniqueSlug(baseSlug, id);
    }
  }

  return await Product.findByIdAndUpdate(id, data, { new: true }).lean();
};

exports.remove = async (id) => {
  return await Product.findByIdAndDelete(id).lean();
};
