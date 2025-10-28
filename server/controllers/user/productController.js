const Product = require("../../model/productModel");
const mongoose = require("mongoose");
const Category = require("../../model/categoryModel");

// Helper to get non-deleted category IDs
async function getActiveCategoryIds() {
  const cats = await Category.find({ isDeleted: { $ne: true } }, { _id: 1 }).lean();
  return cats.map((c) => c._id);
}

const getProducts = async (req, res) => {
  try {
    const { category, price, search, sort, page = 1, limit = 100 } = req.query;

    let filter = {};

    // Exclude products whose category is soft-deleted
    const activeCatIds = await getActiveCategoryIds();
    const activeCatIdSet = new Set(activeCatIds.map((id) => String(id)));

    if (category) {
      const requested = category
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id) && activeCatIdSet.has(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      filter.category = { $in: requested };
    } else {
      filter.category = { $in: activeCatIds };
    }

    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }
    if (price) {
      if (price === "Under 1000") {
        filter.price = { $lte: 1000 };
      }
      if (price === "1000-2000") {
        filter.price = { $gte: 1000, $lte: 2000 };
      }
      if (price === "2000-3000") {
        filter.price = { $gte: 2000, $lte: 3000 };
      }
      if (price === "3000 above") {
        filter.price = { $gte: 3000 };
      }
    }

    // Exclude soft-deleted products
    filter.isDeleted = { $ne: true };

    let sortOptions = {};

    if (sort === "created-desc") {
      sortOptions.createdAt = 1;
    }

    if (sort === "price-asc") {
      sortOptions.price = 1;
    }
    if (sort === "price-desc") {
      sortOptions.price = -1;
    }
    if (!sort) {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(
      {
        status: { $in: ["published", "low quantity"] },
        ...filter,
      },
      {
        name: 1,
        imageURL: 1,
        price: 1,
        markup: 1,
        numberOfReviews: 1,
        rating: 1,
        offer: 1,
        description: 1,
      }
    )
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category", { name: 1 });

    const totalAvailableProducts = await Product.countDocuments({
      status: { $in: ["published", "low quantity"] },
      ...filter,
    });

    res.status(200).json({ products, totalAvailableProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const activeCatIds = await getActiveCategoryIds();

    const product = await Product.findOne({ _id: id, isDeleted: { $ne: true }, category: { $in: activeCatIds } }).populate("category", {
      name: 1,
    });

    if (!product) {
      throw Error("No Such Product");
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAvailableQuantity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const activeCatIds = await getActiveCategoryIds();

    const stockRecord = await Product.findOne(
      { _id: id, isDeleted: { $ne: true }, category: { $in: activeCatIds } },
      { stockQuantity: 1 }
    );

    if (!stockRecord) {
      throw Error("No Such Product");
    }

    res.status(200).json({ stockQuantity: stockRecord.stockQuantity });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    const activeCatIds = await getActiveCategoryIds();

    const suggestions = await Product.find(
      {
        status: { $in: ["published", "low quantity"] },
        isDeleted: { $ne: true },
        category: { $in: activeCatIds },
        name: { $regex: new RegExp(q, "i") }
      },
      {
        name: 1,
        _id: 1
      }
    )
    .limit(8)
    .sort({ name: 1 });

    res.status(200).json({ suggestions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getAvailableQuantity,
  getSearchSuggestions,
};
