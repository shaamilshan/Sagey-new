import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

// Redux
import { getUserDataFirst } from "./redux/actions/userActions";
import { getWishlist } from "./redux/actions/user/wishlistActions";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ... (all your other imports)
import Login from "./page/auth/Login";
import Register from "./page/auth/Register";
import ForgetPassword from "./page/auth/ForgetPassword";
import Dashboard from "./page/Dashboard";
import ProductDetails from "./page/user/ProductDetails";
import Cart from "./page/user/Cart";
import Checkout from "./page/user/Checkout";
import OrderHistory from "./page/user/OrderHistory";
import ProfilePage from "./page/user/ProfilePage";
import OrderDetail from "./page/user/OrderDetails/OrderDetail";
import ProfileDashboard from "./page/user/profileDashboard";
import Dash from "./page/user/profileDashboard/pages/Dash";
import Addresses from "./page/user/profileDashboard/pages/addresses";
import TrackOrder from "./page/user/profileDashboard/pages/trackOrder";
import WishList from "./page/user/profileDashboard/pages/wishlist";
import BuyNow from "./page/user/buyNow";
import AdminDash from "./page/admin/Dashboard";
import AdminHome from "./page/admin/pages/AdminHome";
import Banner from "./page/admin/pages/banner/Banner";
import Payments from "./page/admin/pages/payments/Payments";
import Settings from "./page/admin/pages/Settings";
import Help from "./page/admin/pages/Help";
import ManageAdmins from "./page/admin/pages/admins/ManageAdmins";
import Customers from "./page/admin/pages/customer/Customers";
import CreateAdmin from "./page/admin/pages/admins/CreateAdmin";
import Products from "./page/admin/pages/products/Products";
import AddProducts from "./page/admin/pages/products/AddProducts";
import EditProduct from "./page/admin/pages/products/EditProduct";
import Categories from "./page/admin/pages/categories/Categories";
import CreateCategory from "./page/admin/pages/categories/CreateCategory";
import EditCategory from "./page/admin/pages/categories/EditCategory";
import Orders from "./page/admin/pages/Order/Orders";
import OrderDetails from "./page/admin/pages/Order/OrderDetails";
import ReturnRequests from "./page/admin/pages/Order/ReturnRequests";
import Coupon from "./page/admin/pages/coupon/Coupon";
import CreateCoupon from "./page/admin/pages/coupon/CreateCoupon";
import EditCoupon from "./page/admin/pages/coupon/EditCoupon";
import FindCoupons from "./page/user/profileDashboard/pages/findCoupons";
import OrderConfirmation from "./page/user/components/OrderConfirmation";
import SettingsPage from "./page/user/profileDashboard/pages/settings";
import About from "./page/user/others/About";
import Collectionsold from "./page/user/others/Collectionsold";
import Collections from "./page/user/others/Collection";
import Contact from "./page/user/others/Contact";
import SingleProduct from "./page/user/others/SingleProduct";
import Home2 from "./page/user/others/Home2";
import SignUp from "./components/Auth/SignUp";
import ProtectedRouteReg from "@/components/ProtectedRoute";


function App() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const isVerified = useSelector((state) => state.user.isVerified); // Get the verification status from Redux


  useEffect(() => {
    if (!user) {
      dispatch(getUserDataFirst());
    }
    // Load wishlist when user is available
    if (user && user.role === "user") {
      dispatch(getWishlist());
    }
    console.log(user);
  }, [dispatch, user]);

  const ProtectedRoute = ({ element }) => {
    const { user } = useSelector((state) => state.user);

    return user ? element : <Navigate to="/login" />;
  };

  return (
    <>
      <Toaster position="top-center" />

      <BrowserRouter>
        {/* This div is the fix */}
        <div className="overflow-x-hidden">
          {user ? user.role === "user" && <Navbar /> : <Navbar />}

          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  user.role === "admin" || user.role === "superAdmin" ? (
                    <Navigate to="/admin/" />
                  ) : (
                    <Home2 />
                  )
                ) : (
                  <Home2 />
                )
              }
            />
            <Route path="/about-us" element={<About />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/collection" element={<Collectionsold />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/product" element={<ProductDetails />} />
            <Route path="/home" element={<Dashboard />} />

            {/* Auth Pages */}
            <Route path="login" element={<Login />} />
            <Route
              path="/sign-up"
              element={isVerified ? <Navigate to="/register" /> : <SignUp />}
            />
            <Route
              path="/register"
              element={
                isVerified ? (
                  <ProtectedRouteReg>
                    <Register />
                  </ProtectedRouteReg>
                ) : (
                  <Navigate to="/sign-up" />
                )
              }
            />
            <Route path="forgot-password" element={<ForgetPassword />} />
            
            {/* User Routes */}
            <Route path="/product/:id" element={<SingleProduct />} />
            <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
            <Route
              path="/checkout"
              element={<ProtectedRoute element={<Checkout />} />}
            />
            <Route
              path="/order-confirmation"
              element={<ProtectedRoute element={<OrderConfirmation />} />}
            />
            <Route
              path="/buy-now"
              element={<ProtectedRoute element={<BuyNow />} />}
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<ProfileDashboard />} />}
            >
              <Route index element={<Dash />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="order-history/detail/:id" element={<OrderDetail />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="wishlist" element={<WishList />} />
              <Route path="find-coupons" element={<FindCoupons />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Routes */}
            {(user && user.role === "admin") ||
            (user && user.role === "superAdmin") ? (
              <Route path="/admin/*" element={<AdminRoutes />} />
            ) : (
              <Route path="/admin" element={<Navigate to="/" replace />} />
            )}
          </Routes>
          {user ? user.role === "user" && <Footer /> : <Footer />}
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDash />}>
        <Route index element={<AdminHome />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProducts />} />
        <Route path="products/edit/:id" element={<EditProduct />} />

        <Route path="categories" element={<Categories />} />
        <Route path="categories/create" element={<CreateCategory />} />
        <Route path="categories/edit/:id" element={<EditCategory />} />

        <Route path="orders" element={<Orders />} />
        <Route path="orders/detail/:id" element={<OrderDetails />} />
        <Route path="orders/return-requests" element={<ReturnRequests />} />
        <Route
          path="orders/return-requests/detail/:id"
          element={<OrderDetails />}
        />

        <Route path="manageAdmins" element={<ManageAdmins />} />
        <Route path="manageAdmins/create" element={<CreateAdmin />} />

        <Route path="coupon" element={<Coupon />} />
        <Route path="coupon/create" element={<CreateCoupon />} />
        <Route path="coupon/edit/:id" element={<EditCoupon />} />

        <Route path="banner" element={<Banner />} />
        <Route path="payments" element={<Payments />} />
        <Route path="customers" element={<Customers />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>
    </Routes>
  );
}