require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/productModel");

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

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const items = await Product.find({
    $or: [{ slug: { $exists: false } }, { slug: "" }],
  }).select("name slug");

  for (const product of items) {
    const base = slugify(product.name || "");
    if (!base) continue;

    let slug = base;
    let counter = 1;
    while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
      slug = `${base}-${counter}`;
      counter += 1;
    }

    product.slug = slug;
    await product.save();
  }

  console.log("done");
  process.exit(0);
})();
