import React, { useEffect, useMemo, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineAppstore, AiOutlineDown } from "react-icons/ai";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getProducts } from "../../../../redux/actions/admin/productActions";
import { getCategories } from "../../../../redux/actions/admin/categoriesAction";
import TableRow from "./TableRow";
import BreadCrumbs from "../../Components/BreadCrumbs";
import FilterArray from "../../Components/FilterArray";
import JustLoading from "../../../../components/JustLoading";
import Pagination from "../../../../components/Pagination";
import SearchBar from "../../../../components/SearchBar";
import RangeDatePicker from "../../../../components/RangeDatePicker";
import ClearFilterButton from "../../Components/ClearFilterButton";
import { getDeletedProducts, restoreProduct } from "../../../../redux/actions/admin/productActions";
import { AiOutlineReload } from "react-icons/ai";

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products, loading, error, totalAvailableProducts, deletedProducts } = useSelector(
    (state) => state.products
  );
  const { categories } = useSelector((state) => state.categories);

  // Filteration
  const [startingDate, setStartingDate] = useState("");
  const [endingDate, setEndingDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFilter = (type, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "") {
      if (type === "page") {
        setPage(1);
      }
      params.delete(type);
    } else {
      if (type === "page" && value === 1) {
        params.delete(type);
        setPage(1);
      } else {
        params.set(type, value);
        if (type === "page") {
          setPage(value);
        }
      }
    }
    setSearchParams(params.toString() ? "?" + params.toString() : "");
  };

  // Removing filters
  const removeFilters = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.delete("page");
    params.delete("status");
    params.delete("startingDate");
    params.delete("endingDate");
    params.delete("category");
    setSearch("");
    setStartingDate("");
    setEndingDate("");
    setSelectedCategory("");
    setSearchParams(params);
  };

  // Getting products details
  useEffect(() => {
    dispatch(getProducts(searchParams));
    const params = new URLSearchParams(window.location.search);
    const pageNumber = params.get("page");
    setPage(parseInt(pageNumber || 1));
    const cat = params.get("category") || "";
    setSelectedCategory(cat);
  }, [searchParams]);

  // load categories for dropdown once
  useEffect(() => {
    dispatch(getCategories("limit=1000"));
    dispatch(getDeletedProducts());
  }, []);

  const handleRestore = (id) => {
    dispatch(restoreProduct(id));
  };

  return (
    <>
      <div className="p-5 w-full overflow-y-auto text-sm">
        <SearchBar
          handleClick={handleFilter}
          search={search}
          setSearch={setSearch}
        />
        <div className="flex justify-between items-center font-semibold mt-5">
          <div>
            <h1 className="font-bold text-2xl">Products</h1>
            <BreadCrumbs list={["Dashboard", "Product List"]} />
          </div>
          <div className="flex gap-3">
            <button
              className="admin-button-fl bg-blue-700 text-white"
              onClick={() => navigate("add")}
            >
              <AiOutlinePlus />
              Add Product
            </button>
          </div>
        </div>
        <div className="lg:flex justify-between items-center font-semibold">
          <FilterArray
            list={[
              "all",
              "draft",
              "published",
              "out of stock",
              "low quantity",
              "unpublished",
            ]}
            handleClick={handleFilter}
          />
          <div className="flex my-2 gap-3 items-center">
            <div className="relative">
              <select
                className="cursor-pointer admin-button-fl bg-white hover:bg-gray-200 active:bg-gray-300 pr-16 pl-16 appearance-none min-w-[220px] h-12 py-2 text-center"
                value={selectedCategory}
                onChange={(e) => handleFilter("category", e.target.value)}
              >
                <option value="">All categories</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-base">
                <AiOutlineAppstore />
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-base">
                <AiOutlineDown />
              </span>
            </div>
            <RangeDatePicker
              handleFilter={handleFilter}
              startingDate={startingDate}
              setStartingDate={setStartingDate}
              endingDate={endingDate}
              setEndingDate={setEndingDate}
            />
            <ClearFilterButton handleClick={removeFilters} />
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <JustLoading size={10} />
            </div>
          ) : (
            products && (
              <table className="w-full">
                <thead className="font-normal">
                  <tr className="border-b border-gray-200">
                    <th className="admin-table-head w-3/12">Name</th>
                    <th className="admin-table-head w-3/12">Description</th>
                    <th className="admin-table-head w-1/12">Category</th>
                    <th className="admin-table-head w-1/12">Quantity</th>
                    <th className="admin-table-head w-1/12">Price</th>
                    <th className="admin-table-head w-1/12">Status</th>
                    <th className="admin-table-head w-1/12">Added</th>
                    <th className="admin-table-head w-1/12">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    return (
                      <TableRow
                        index={index}
                        length={products.length}
                        product={product}
                        key={index}
                      />
                    );
                  })}
                </tbody>
              </table>
            )
          )}
          <div className="py-5">
            <div className="text-gray-600 mb-2">
              Total products: <span className="font-semibold">{totalAvailableProducts ?? 0}</span>
            </div>
            <Pagination
              handleClick={handleFilter}
              page={page}
              number={10}
              totalNumber={totalAvailableProducts}
            />
          </div>
        </div>

        {/* Recently Deleted */}
        <div className="mt-6">
          <details className="bg-white rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">Recently Deleted ({deletedProducts?.length || 0})</summary>
            <div className="mt-3 overflow-x-auto">
              {deletedProducts && deletedProducts.length > 0 ? (
                <table className="w-full">
                  <thead className="font-normal">
                    <tr className="border-b border-gray-200">
                      <th className="admin-table-head w-3/12">Name</th>
                      <th className="admin-table-head w-3/12">Category</th>
                      <th className="admin-table-head w-2/12">Deleted At</th>
                      <th className="admin-table-head w-2/12">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedProducts.map((p) => (
                      <tr key={p._id} className="p-4 border-b border-gray-200">
                        <td className="admin-table-row">{p.name}</td>
                        <td className="admin-table-row">{p?.category?.name || ''}</td>
                        <td className="admin-table-row">{p.deletedAt ? new Date(p.deletedAt).toLocaleString() : ''}</td>
                        <td className="admin-table-row">
                          <button className="admin-button-fl bg-blue-700 text-white" onClick={() => handleRestore(p._id)}>
                            <AiOutlineReload className="mr-2" /> Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No recently deleted products.</p>
              )}
            </div>
          </details>
        </div>
      </div>
    </>
  );
};

export default Products;