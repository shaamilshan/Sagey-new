const Product = require("../../model/productModel");
const mongoose = require("mongoose");

// Getting all products to list on admin dashboard
const getProducts = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      startingDate,
      endingDate,
      category, // category id for filtering
      includeDeleted,
    } = req.query;

    let filter = {};

    if (!includeDeleted || includeDeleted === 'false') {
      filter.isDeleted = { $ne: true };
    }

    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }
    // Category filtering
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        throw Error("Invalid category id");
      }
      filter.category = category;
    }
    const skip = (page - 1) * limit;

    // Date filtering
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }

    const products = await Product.find(filter, {
      attributes: 0,
      moreImageURL: 0,
    })
      .skip(skip)
      .limit(limit)
      .populate("category", { name: 1 });

    const totalAvailableProducts = await Product.countDocuments(filter);

    res.status(200).json({ products, totalAvailableProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single Product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const product = await Product.findOne({ _id: id });

    if (!product) {
      throw Error("No Such Product");
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Creating a new Product
const addProduct = async (req, res) => {
  try {
    let formData = { ...req.body, isActive: true };
    const files = req?.files;

    // Validation
    if (!formData.name || formData.name.trim() === "") {
      throw new Error("Product name is required");
    }
    if (!formData.description || formData.description.trim() === "") {
      throw new Error("Product description is required");
    }
    if (!formData.category) {
      throw new Error("Product category is required");
    }
    if (!formData.price || formData.price <= 0) {
      throw new Error("Product price must be greater than 0");
    }
    
    // Parse attributes
    if (formData.attributes) {
      try {
        const attributes = JSON.parse(formData.attributes);
        formData.attributes = attributes;
      } catch (error) {
        throw new Error("Invalid attributes format");
      }
    } else {
      formData.attributes = [];
    }

    // Handle file uploads
    if (files && files.length > 0) {
      formData.moreImageURL = [];
      formData.imageURL = "";
      
      let hasMainImage = false;
      files.forEach((file) => {
        if (file.fieldname === "imageURL") {
          formData.imageURL = file.filename;
          hasMainImage = true;
        } else if (file.fieldname === "moreImageURL") {
          formData.moreImageURL.push(file.filename);
        }
      });
      
      if (!hasMainImage) {
        throw new Error("Product thumbnail image is required");
      }
    } else {
      throw new Error("Product thumbnail image is required");
    }

    const product = await Product.create(formData);
    res.status(200).json({ product });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update a Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const files = req?.files;
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw Error("No Such Product");
    }

    if (files && files.length > 0) {
      let newMoreImageURL = [...existingProduct.moreImageURL];
      let newImageURL = existingProduct.imageURL;

      files.map((file) => {
        if (file.fieldname === "imageURL") {
          newImageURL = file.filename;
        } else {
          newMoreImageURL.push(file.filename);
        }
      });
      formData.imageURL = newImageURL;
      formData.moreImageURL = newMoreImageURL;
    }

    if (formData.imagesToDelete) {
      const imagesToDelete = JSON.parse(formData.imagesToDelete);
      formData.moreImageURL = formData.moreImageURL.filter(
        (img) => !imagesToDelete.includes(img)
      );
    }

    if (formData.attributes) {
      const attributes = JSON.parse(formData.attributes);
      formData.attributes = attributes;
    }

    const product = await Product.findOneAndUpdate(
      { _id: id },
      { $set: { ...formData } },
      { new: true }
    );

    if (!product) {
      throw Error("No Such Product");
    }

    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Deleting a Product (hard delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const product = await Product.findOneAndDelete({ _id: id });

    if (!product) {
      throw Error("No Such Product");
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Soft delete a Product
const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: req.user?._id } },
      { new: true }
    );

    if (!updated) {
      throw Error("No Such Product");
    }

    res.status(200).json({ product: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Restore a soft-deleted Product
const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Error("Invalid ID!!!");
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false }, $unset: { deletedAt: 1, deletedBy: 1 } },
      { new: true }
    );

    if (!updated) {
      throw Error("No Such Product");
    }

    res.status(200).json({ product: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get only deleted products
const getDeletedProducts = async (req, res) => {
  try {
    const deleted = await Product.find({ isDeleted: true })
      .populate("category", { name: 1 })
      .sort({ deletedAt: -1 });

    res.status(200).json({ products: deleted });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  getDeletedProducts,
};