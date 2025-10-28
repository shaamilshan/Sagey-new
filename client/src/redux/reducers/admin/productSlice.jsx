import { createSlice } from "@reduxjs/toolkit";
import {
  getProducts,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  getDeletedProducts,
} from "../../actions/admin/productActions";
import toast from "react-hot-toast";

const productSlice = createSlice({
  name: "products",
  initialState: {
    loading: false,
    products: [],
    deletedProducts: [],
    error: null,
    totalAvailableProducts: null,
  },
  extraReducers: (builder) => {
    builder
      // Getting Product details
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.products = payload.products;
        state.totalAvailableProducts = payload.totalAvailableProducts;
      })
      .addCase(getProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.products = null;
        state.error = payload;
      })

      // Getting Deleted Products
      .addCase(getDeletedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDeletedProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.deletedProducts = payload.products || [];
      })
      .addCase(getDeletedProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Creating new Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        if (payload && payload.product) {
          state.products = [...state.products, payload.product];
          state.totalAvailableProducts = (state.totalAvailableProducts || 0) + 1;
        }
      })
      .addCase(createProduct.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to create product";
      })

      // Updating a product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        const updated = payload.product || payload;
        const index = state.products.findIndex(
          (product) => product._id === updated._id
        );
        if (index !== -1) {
          state.products[index] = updated;
        }
      })
      .addCase(updateProduct.rejected, (state, { payload }) => {
        state.loading = false;
        state.products = null;
        state.error = payload;
      })

      // Soft delete
      .addCase(softDeleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(softDeleteProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        const deleted = payload.product;
        state.products = state.products.filter((p) => p._id !== deleted._id);
        state.deletedProducts = [deleted, ...state.deletedProducts];
        if (state.totalAvailableProducts > 0) state.totalAvailableProducts -= 1;
        toast.success("Moved to Recently Deleted");
      })
      .addCase(softDeleteProduct.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || "Failed to move to Recently Deleted");
      })

      // Restore
      .addCase(restoreProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        const restored = payload.product;
        state.deletedProducts = state.deletedProducts.filter(
          (p) => p._id !== restored._id
        );
        state.products = [restored, ...state.products];
        state.totalAvailableProducts = (state.totalAvailableProducts || 0) + 1;
        toast.success("Product restored");
      })
      .addCase(restoreProduct.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || "Failed to restore product");
      });
  },
});

export default productSlice.reducer;