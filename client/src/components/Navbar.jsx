import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaSignInAlt, FaHome, FaSearch, FaBook, FaBlog, FaTachometerAlt } from "react-icons/fa";
import { colors } from '../styles/colors';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navbarStyle = {
    background: scrolled 
      ? `${colors.background.card}` 
      : colors.gradients.background.page,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${colors.border.secondary}`,
    boxShadow: scrolled 
      ? `0 8px 32px ${colors.shadow.xl}` 
      : `0 4px 24px ${colors.shadow.lg}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const logoStyle = {
    background: colors.gradients.brand.secondary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 2px 4px rgba(168, 85, 247, 0.3))'
  };

  const navLinkStyle = {
    color: colors.text.secondary,
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '500',
    letterSpacing: '0.025em'
  };

  const navLinkHoverStyle = {
    color: colors.text.primary,
    textShadow: `0 0 8px ${colors.primary.blue[400]}40`
  };

  const mobileMenuStyle = {
    background: `linear-gradient(135deg, ${colors.background.card}, ${colors.surface.primary})`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderTop: `1px solid ${colors.border.blue}`,
    borderBottom: `1px solid ${colors.border.purple}`,
    boxShadow: `0 8px 32px ${colors.shadow.xl}, inset 0 1px 0 ${colors.border.light}`,
    borderRadius: '0 0 1rem 1rem'
  };

  return (
    <nav 
      className="fixed w-full top-0 left-0 z-50 transition-all duration-300"
      style={navbarStyle}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Enhanced Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden">
                <div 
                  className="absolute inset-0 rounded-xl transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: colors.gradients.brand.primary,
                    boxShadow: `0 4px 20px ${colors.primary.blue[500]}40`
                  }}
                ></div>
                <img 
                  src="1.png" 
                  alt="ThesisConnect Logo" 
                  className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <div className="hidden sm:block">
                <h1 
                  className="text-xl md:text-2xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105" 
                  style={logoStyle}
                >
                  ThesisConnect
                </h1>
                <p 
                  className="text-xs md:text-sm font-medium -mt-1"
                  style={{ 
                    color: colors.text.muted,
                    opacity: 0.8 
                  }}
                >
                  Research Excellence
                </p>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center space-x-1">
            {[
              { to: "/", label: "Home", icon: FaHome },
              { to: "/explore", label: "Explore", icon: FaSearch },
              { to: "/publications", label: "Publications", icon: FaBook },
              { to: "/blogs", label: "Blog", icon: FaBlog }
            ].map((item, index) => (
              <Link 
                key={item.to}
                to={item.to} 
                className="relative px-4 py-2 rounded-xl transition-all duration-300 group font-medium flex items-center space-x-2"
                style={navLinkStyle}
                onMouseEnter={(e) => {
                  Object.assign(e.target.style, navLinkHoverStyle);
                  e.target.style.backgroundColor = colors.background.glass;
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.text.secondary;
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.textShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <item.icon className="text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                <span>{item.label}</span>
                <span 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full group-hover:w-3/4 transition-all duration-500"
                  style={{ 
                    background: colors.gradients.accent.blue,
                    boxShadow: `0 0 8px ${colors.primary.blue[400]}60`
                  }}
                ></span>
              </Link>
            ))}
          </div>

          {/* Enhanced Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            
            <Link 
              to="/signup" 
              className="relative px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300 font-medium overflow-hidden group"
              style={{
                background: colors.gradients.brand.primary,
                color: colors.button.primary.text,
                boxShadow: `0 4px 16px ${colors.primary.blue[500]}40`,
                border: `1px solid ${colors.border.blue}`
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.gradients.brand.secondary;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 8px 24px ${colors.primary.purple[500]}50`;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = colors.gradients.brand.primary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 16px ${colors.primary.blue[500]}40`;
              }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: colors.gradients.accent.purple
                }}
              ></div>
              <FaUserPlus className="text-sm relative z-10" />
              <span className="font-semibold relative z-10">Sign Up</span>
            </Link>
            
            <Link 
              to="/login" 
              className="relative px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300 font-medium border group"
              style={{
                backgroundColor: 'transparent',
                color: colors.text.primary,
                borderColor: colors.border.primary,
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.background.glass;
                e.target.style.borderColor = colors.border.blue;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = `0 4px 16px ${colors.shadow.default}`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = colors.border.primary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FaSignInAlt className="text-sm" />
              <span className="font-medium">Login</span>
            </Link>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="relative p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 group"
              style={{ 
                color: colors.text.secondary,
                backgroundColor: colors.background.glass,
                borderRadius: '12px',
                border: `1px solid ${colors.border.light}`,
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.primary;
                e.target.style.backgroundColor = colors.background.secondary;
                e.target.style.borderColor = colors.border.blue;
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = colors.text.secondary;
                e.target.style.backgroundColor = colors.background.glass;
                e.target.style.borderColor = colors.border.light;
                e.target.style.transform = 'scale(1)';
              }}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <svg
                className="w-5 h-5 transform transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
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

        {/* Enhanced Mobile Dropdown Menu */}
        {isOpen && (
          <div 
            className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 rounded-2xl overflow-hidden animate-fadeIn"
            style={mobileMenuStyle}
          >
            <div className="p-6 space-y-2">
              {[
                { to: "/", label: "Home", icon: "🏠" },
                { to: "/dashboard", label: "Dashboard", icon: "📊" },
                { to: "/explore", label: "Explore", icon: "🔍" },
                { to: "/publications", label: "Publications", icon: "📚" },
                { to: "/resources", label: "Blog", icon: "📝" }
              ].map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center px-4 py-3 rounded-xl transition-all duration-300 group"
                  style={{ 
                    color: colors.text.secondary,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = colors.text.primary;
                    e.target.style.backgroundColor = colors.background.glass;
                    e.target.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = colors.text.secondary;
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateX(0)';
                  }}
                  onClick={toggleMenu}
                >
                  <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              <div 
                className="my-4 h-px"
                style={{
                  background: colors.gradients.brand.primary,
                  opacity: 0.3
                }}
              ></div>
              
              {/* Theme Toggle for Mobile */}
              <div className="flex justify-center mb-4">
                <ThemeToggle />
              </div>
              
              <div className="space-y-3 pt-2">
                <Link
                  to="/signup"
                  className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-semibold"
                  style={{
                    background: colors.gradients.brand.primary,
                    color: colors.button.primary.text,
                    boxShadow: `0 4px 16px ${colors.primary.blue[500]}30`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = colors.gradients.brand.secondary;
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = colors.gradients.brand.primary;
                    e.target.style.transform = 'translateY(0)';
                  }}
                  onClick={toggleMenu}
                >
                  <FaUserPlus className="mr-2 text-sm" />
                  Sign Up
                </Link>
                
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-medium border"
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.text.primary,
                    borderColor: colors.border.primary
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.background.glass;
                    e.target.style.borderColor = colors.border.blue;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = colors.border.primary;
                  }}
                  onClick={toggleMenu}
                >
                  <FaSignInAlt className="mr-2 text-sm" />
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;