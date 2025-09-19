import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../redux/actions/userActions";
import { RiDashboardLine } from "react-icons/ri";
import { AiOutlineHeart, AiOutlineLogout } from "react-icons/ai";
import { BiUser, BiHistory } from "react-icons/bi";
import { GiMailbox } from "react-icons/gi";
import { useDispatch } from "react-redux";
import LogoutConfirmation from "../../components/LogoutConfimationModal"; // Import the modal

const DashSideNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsModalOpen(false); // Close the modal after logout
  };

  return (
    <div className="sm:w-1/5 bg-white h-fit shrink-0 rounded lg:block">
      {/* MODIFIED: Added the 'end' prop to this NavLink for exact matching */}
      <NavLink className="side-nav-link-sp" to="/dashboard/" end>
        <RiDashboardLine />
        Dashboard
      </NavLink>
      <NavLink className="side-nav-link-sp" to="profile">
        <BiUser />
        Account Details
      </NavLink>
      <NavLink className="side-nav-link-sp" to="order-history">
        <BiHistory />
        Order History
      </NavLink>
      <NavLink className="side-nav-link-sp" to="wishlist">
        <AiOutlineHeart />
        Wishlist
      </NavLink>
      <NavLink className="side-nav-link-sp" to="addresses">
        <GiMailbox />
        Addresses
      </NavLink>
      <button className="side-nav-link-sp w-full" onClick={() => setIsModalOpen(true)}>
        <AiOutlineLogout />
        Logout
      </button>

      {/* Logout confirmation modal */}
      <LogoutConfirmation
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        headerText="Confirm Logout"
        descriptionText="Are you sure you want to logout? You'll need to login again to access your account."
        confirmButtonText="Logout"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default DashSideNavbar;