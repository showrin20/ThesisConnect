import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaSignInAlt, FaGraduationCap } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl p-4 md:p-10 fixed w-full top-0 left-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-12 md:h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
              <div className="relative w-8 h-8 md:w-40 md:h-50">
                <div className="absolute inset-0 transition duration-300"></div>
                <img 
                  src="1.png" 
                  alt="ThesisConnect Logo" 
                  className="w-full h-full object-contain relative z-10" 
                />
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ThesisConnect
              </h1>
            </Link>
          </div>


          {/* Desktop Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <Link 
              to="/" 
              className="relative text-gray-300 hover:text-white transition-all duration-300 group font-medium"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
        
            <Link 
              to="/explore" 
              className="relative text-gray-300 hover:text-white transition-all duration-300 group font-medium"
            >
              Explore
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/publications" 
              className="relative text-gray-300 hover:text-white transition-all duration-300 group font-medium"
            >
              Publications
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/resources" 
              className="relative text-gray-300 hover:text-white transition-all duration-300 group font-medium"
            >
              Blog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Desktop User Icons */}
          <div className="hidden md:flex space-x-3">
            <Link 
              to="/signup" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaUserPlus className="text-sm" />
              <span className="font-medium">Sign Up</span>
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaSignInAlt className="text-sm" />
              <span className="font-medium">Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <svg
                className="w-6 h-6 transform transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 rounded-b-lg shadow-2xl border-t border-purple-500/20 backdrop-blur-md">
            <div className="p-4 space-y-1">
              <Link
                to="/"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 text-center"
                onClick={toggleMenu}
              >
                🏠 Home
              </Link>
              <Link
                to="/dashboard"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 text-center"
                onClick={toggleMenu}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/explore"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 text-center"
                onClick={toggleMenu}
              >
                🔍 Explore
              </Link>
              <Link
                to="/publications"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 text-center"
                onClick={toggleMenu}
              >
                📚 Publications
              </Link>
              <Link
                to="/resources"
                className="block text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 text-center"
                onClick={toggleMenu}
              >
                📝 Blog
              </Link>
              <hr className="border-purple-500/30 my-3" />
              <div className="space-y-2">
                <Link
                  to="/signup"
                  className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg text-center transition-all duration-300 shadow-lg font-medium"
                  onClick={toggleMenu}
                >
                  <FaUserPlus className="inline-block mr-2 text-sm" />
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="block border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-4 py-3 rounded-lg text-center transition-all duration-300 font-medium"
                  onClick={toggleMenu}
                >
                  <FaSignInAlt className="inline-block mr-2 text-sm" />
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;