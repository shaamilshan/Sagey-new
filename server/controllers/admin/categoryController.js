const Category = require("../../model/categoryModel");
const mongoose = require("mongoose");

// Getting all Categories to list on admin dashboard
const getCategories = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, includeDeleted } = req.query;

    let filter = {};

    if (!includeDeleted || includeDeleted === 'false') {
      filter.isDeleted = { $ne: true };
    }

    if (status) {
      if (status === "active") {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }
    }

    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find(filter).skip(skip).limit(limit);

    const totalAvailableCategories = await Category.countDocuments(filter);

    res.status(200).json({ categories, totalAvailableCategories });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Only getting one Category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const category = await Category.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!category) {
      throw Error("No Such Category");
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Creating new Category if needed for admin
const createCategory = async (req, res) => {
  try {
    let formData = req.body;
    const imgURL = req?.file?.filename;

    if (imgURL) {
      formData = { ...formData, imgURL: imgURL };
    }

    const category = await Category.create(formData);

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Updating the category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let formData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const imgURL = req?.file?.filename;

    if (imgURL) {
      formData = { ...formData, imgURL: imgURL };
    }

    const category = await Category.findOneAndUpdate(
      { _id: id },
      { $set: { ...formData } },
      { new: true }
    );

    if (!category) {
      throw Error("No such Category");
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const category = await Category.findOneAndDelete({ _id: id });

    if (!category) {
      throw Error("No Such Category");
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Soft delete Category
const softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: req.user?._id } },
      { new: true }
    );
    if (!updated) throw Error("No Such Category");
    res.status(200).json({ category: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Restore Category
const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false }, $unset: { deletedAt: 1, deletedBy: 1 } },
      { new: true }
    );
    if (!updated) throw Error("No Such Category");
    res.status(200).json({ category: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Deleted Categories
const getDeletedCategories = async (req, res) => {
  try {
    const cats = await Category.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.status(200).json({ categories: cats });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  getDeletedCategories,
};