import { createSlice } from "@reduxjs/toolkit";
import {
  getCategories,
  createNewCategory,
  deleteCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  getDeletedCategories,
} from "../../actions/admin/categoriesAction";
import toast from "react-hot-toast";

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    loading: false,
    categories: [],
    deletedCategories: [],
    error: null,
    totalAvailableCategories: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.categories = payload.categories;
        state.totalAvailableCategories = payload.totalAvailableCategories;
      })
      .addCase(getCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.categories = null;
        state.error = payload;
      })
      .addCase(getDeletedCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDeletedCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.deletedCategories = payload.categories || [];
      })
      .addCase(getDeletedCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createNewCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.categories = [...state.categories, payload];
      })
      .addCase(createNewCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.categories = null;
        state.error = payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.categories = state.categories.filter(
          (category) => category._id !== payload._id
        );
      })
      .addCase(deleteCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.categories = null;
        state.error = payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        const index = state.categories.findIndex(
          (product) => product._id === payload._id
        );

        if (index !== -1) {
          state.categories[index] = payload;
        }
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.categories = null;
        state.error = payload;
      })
      // Soft delete category
      .addCase(softDeleteCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(softDeleteCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        const deleted = payload.category;
        state.categories = state.categories.filter((c) => c._id !== deleted._id);
        state.deletedCategories = [deleted, ...state.deletedCategories];
        if (state.totalAvailableCategories > 0) state.totalAvailableCategories -= 1;
        toast.success("Category moved to Recently Deleted");
      })
      .addCase(softDeleteCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || "Failed to delete category");
      })
      // Restore category
      .addCase(restoreCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        const restored = payload.category;
        state.deletedCategories = state.deletedCategories.filter(
          (c) => c._id !== restored._id
        );
        state.categories = [restored, ...state.categories];
        state.totalAvailableCategories = (state.totalAvailableCategories || 0) + 1;
        toast.success("Category restored");
      })
      .addCase(restoreCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload || "Failed to restore category");
      });
  },
});

export default categoriesSlice.reducer;
