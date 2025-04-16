import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock, FaSignInAlt ,FaUserPlus} from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="ThesisConnect Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-gray-800">ThesisConnect</h1>
          </Link>
        </div>

        {/* Centered Navigation Links */}
        <div className="flex-1 flex justify-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-rose-600 transition">Home</Link>
          <Link to="/explore" className="text-gray-600 hover:text-rose-600 transition">Explore</Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-rose-600 transition">Dashboard</Link>
          <Link to="/resources" className="text-gray-600 hover:text-rose-600 transition">Resources</Link>
        </div>

        {/* Right-side User Icons */}
        <div className="flex space-x-4">
          <Link to="/signin" className="text-gray-600 hover:text-rose-600 flex items-center space-x-1 transition">
            <FaUserPlus />
            <span>Signup</span>
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-rose-600 flex items-center space-x-1 transition">
            <FaSignInAlt />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
