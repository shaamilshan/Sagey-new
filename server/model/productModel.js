const mongoose = require("mongoose");
const Category = require("../model/categoryModel");
const { Schema } = mongoose;

const productsSchema = new Schema(
  {
    name: {
      type: String,
    },
    managerId: {
      type: String,
    },
    description: {
      type: String,
    },
    stockQuantity: {
      type: Number,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: Category,
    },
    imageURL: {
      type: String,
    },
    price: {
      type: Number,
    },
    markup: {
      type: Number,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "out of stock",
        "low quantity",
        "unpublished",
      ],
    },
    attributes: [
      {
        name: {
          type: String,
        },
        value: {
          type: String,
        },
        isHighlight: {
          type: Boolean,
        },
        quantity: {
          type: Number,
        },
        imageIndex: {
          type: Number,
        },
      },
    ],
    moreImageURL: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
    },
    rating: {
      type: Number,
    },
    numberOfReviews: {
      type: Number,
    },
    offer: {
      type: Number,
    },
    // Soft delete flags
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Products = mongoose.model("Products", productsSchema);

module.exports = Products;