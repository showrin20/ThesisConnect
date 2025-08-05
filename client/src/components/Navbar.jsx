import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaSignInAlt, FaGraduationCap } from "react-icons/fa";
import { colors } from '../styles/colors';
import { getButtonStyles, getHoverEffects } from '../styles/styleUtils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="shadow-2xl p-4 md:p-10 fixed w-full top-0 left-0 z-50 backdrop-blur-md" style={{ background: colors.gradients.background.hero }}>
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
              <h1 className="text-lg md:text-2xl font-bold" style={{ 
                background: colors.gradients.brand.secondary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ThesisConnect
              </h1>
            </Link>
          </div>


          {/* Desktop Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <Link 
              to="/" 
              className="relative transition-all duration-300 group font-medium"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.target.style.color = colors.text.primary}
              onMouseLeave={(e) => e.target.style.color = colors.text.secondary}
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: colors.gradients.brand.primary }}></span>
            </Link>
        
            <Link 
              to="/explore" 
              className="relative transition-all duration-300 group font-medium"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.target.style.color = colors.text.primary}
              onMouseLeave={(e) => e.target.style.color = colors.text.secondary}
            >
              Explore
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: colors.gradients.brand.primary }}></span>
            </Link>
            <Link 
              to="/publications" 
              className="relative transition-all duration-300 group font-medium"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.target.style.color = colors.text.primary}
              onMouseLeave={(e) => e.target.style.color = colors.text.secondary}
            >
              Publications
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: colors.gradients.brand.primary }}></span>
            </Link>
            <Link 
              to="/resources" 
              className="relative transition-all duration-300 group font-medium"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.target.style.color = colors.text.primary}
              onMouseLeave={(e) => e.target.style.color = colors.text.secondary}
            >
              Blog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: colors.gradients.brand.primary }}></span>
            </Link>
          </div>

          {/* Desktop User Icons */}
          <div className="hidden md:flex space-x-3">
            <Link 
              to="/signup" 
              className="px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg font-medium"
              style={getButtonStyles('primary')}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, {
                  background: colors.button.primary.backgroundHover,
                  ...getHoverEffects.scale
                });
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, {
                  background: colors.button.primary.background,
                  transform: 'scale(1)'
                });
              }}
            >
              <FaUserPlus className="text-sm" />
              <span className="font-medium">Sign Up</span>
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 shadow-lg font-medium"
              style={getButtonStyles('secondary')}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, {
                  backgroundColor: colors.button.secondary.backgroundHover,
                  color: colors.button.secondary.textHover,
                  ...getHoverEffects.scale
                });
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, {
                  backgroundColor: colors.button.secondary.background,
                  color: colors.button.secondary.text,
                  transform: 'scale(1)'
                });
              }}
            >
              <FaSignInAlt className="text-sm" />
              <span className="font-medium">Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2"
              style={{ 
                color: colors.text.secondary,
                focusRingColor: colors.primary.purple[400]
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.primary;
                e.target.style.backgroundColor = colors.background.glass;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = colors.text.secondary;
                e.target.style.backgroundColor = 'transparent';
              }}
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
          <div className="md:hidden absolute top-full left-0 right-0 rounded-b-lg shadow-2xl border-t backdrop-blur-md" 
               style={{ 
                 background: colors.gradients.background.hero,
                 borderColor: `${colors.primary.purple[500]}33` // 20% opacity
               }}>
            <div className="p-4 space-y-1">
              <Link
                to="/"
                className="block px-4 py-3 rounded-lg transition-all duration-300 text-center"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.text.secondary;
                  e.target.style.backgroundColor = 'transparent';
                }}
                onClick={toggleMenu}
              >
                🏠 Home
              </Link>
              <Link
                to="/dashboard"
                className="block px-4 py-3 rounded-lg transition-all duration-300 text-center"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.text.secondary;
                  e.target.style.backgroundColor = 'transparent';
                }}
                onClick={toggleMenu}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/explore"
                className="block px-4 py-3 rounded-lg transition-all duration-300 text-center"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.text.secondary;
                  e.target.style.backgroundColor = 'transparent';
                }}
                onClick={toggleMenu}
              >
                🔍 Explore
              </Link>
              <Link
                to="/publications"
                className="block px-4 py-3 rounded-lg transition-all duration-300 text-center"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.text.secondary;
                  e.target.style.backgroundColor = 'transparent';
                }}
                onClick={toggleMenu}
              >
                📚 Publications
              </Link>
              <Link
                to="/resources"
                className="block px-4 py-3 rounded-lg transition-all duration-300 text-center"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.text.secondary;
                  e.target.style.backgroundColor = 'transparent';
                }}
                onClick={toggleMenu}
              >
                📝 Blog
              </Link>
              <hr className="my-3" style={{ borderColor: `${colors.primary.purple[500]}4D` }} />
              <div className="space-y-2">
                <Link
                  to="/signup"
                  className="block px-4 py-3 rounded-lg text-center transition-all duration-300 shadow-lg font-medium"
                  style={getButtonStyles('primary')}
                  onClick={toggleMenu}
                >
                  <FaUserPlus className="inline-block mr-2 text-sm" />
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-lg text-center transition-all duration-300 font-medium"
                  style={getButtonStyles('secondary')}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.button.secondary.backgroundHover;
                    e.target.style.color = colors.button.secondary.textHover;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.button.secondary.background;
                    e.target.style.color = colors.button.secondary.text;
                  }}
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