import React, { useState } from "react";
import ExIphoneLogo from "../../../components/ExIphoneLogo";
import { NavLink, useNavigate } from "react-router-dom";

import { RiDashboardLine } from "react-icons/ri";
import { FiBox, FiLogOut } from "react-icons/fi";
import { ImStack } from "react-icons/im";
import { HiOutlineTicket } from "react-icons/hi";
import { BsCardChecklist, BsCreditCard } from "react-icons/bs";
import { FaUsersCog, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/actions/userActions";
import LogoutConfirmation from "@/components/LogoutConfimationModal";


const SideNavbar = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setShowLogoutModal(false); 
  };

  return (
    <>
      <div className=" flex items-center cursor-pointer opacity-70 hover:opacity-100">
        <ExIphoneLogo />
      </div>
      <div className="text-gray-600 font-semibold mt-5">
        <p className="side-nav-sub-title">Menu</p>
        
        {/* MODIFIED: Added the 'end' prop for exact URL matching */}
        <NavLink className="side-nav-link-sp" to="/admin/" end>
          <RiDashboardLine />
          Dashboard
        </NavLink>
        <NavLink className="side-nav-link-sp" to="products">
          <FiBox />
          Products
        </NavLink>
        <NavLink className="side-nav-link-sp" to="categories">
          <ImStack />
          Category
        </NavLink>
        <NavLink className="side-nav-link-sp" to="orders">
          <BsCardChecklist />
          Orders
        </NavLink>
        <NavLink className="side-nav-link-sp" to="coupon">
          <HiOutlineTicket />
          Coupon
        </NavLink>
        <NavLink className="side-nav-link-sp" to="payments">
          <BsCreditCard />
          Payments
        </NavLink>
        <p className="side-nav-sub-title">User Management</p>
        {user && user.role === "superAdmin" && (
          <NavLink className="side-nav-link-sp" to="manageAdmins">
            <FaUsersCog />
            Manage Admins
          </NavLink>
        )}
        <NavLink className="side-nav-link-sp" to="customers">
          <FaUsers />
          Customers
        </NavLink>
        <p className="side-nav-sub-title">Other</p>
        <button
          className="side-nav-link-sp cursor-pointer w-full"
          onClick={()=> setShowLogoutModal(true)}
        >
          <FiLogOut />
          Logout
        </button>
      </div>
          <LogoutConfirmation
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleLogout}
            headerText="Confirm Logout"
            descriptionText="Are you sure you want to logout? You'll need to login again to access your account."
            confirmButtonText="Logout"
            cancelButtonText="Cancel"
          />
    </>
  );
};

export default SideNavbar;