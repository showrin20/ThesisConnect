import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaUserPlus,
  FaSignInAlt,
  FaHome,
  FaSearch,
  FaBook,
  FaBlog,
  FaUser,
  FaSignOutAlt,
  FaBookmark,
  FaCog,
  FaChartBar,
} from "react-icons/fa";
import { colors } from "../styles/colors"; // Ensure this file exists and is typed
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

// Define CSS keyframes for fadeIn animation
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false); // Placeholder for notifications
  const profileDropdownRef = useRef(null);
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside of profile dropdown
  const handleClickOutside = useCallback((event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setShowProfileDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Placeholder for notification check (replace with API call in production)
  useEffect(() => {
    if (user) {
      // TODO: Replace with actual API call to check notifications
      setHasNotifications(Math.random() > 0.5);
    } else {
      setHasNotifications(false);
    }
  }, [user]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const navbarStyle = {
    background: scrolled
      ? `${colors.background.card}`
      : colors.gradients.background.page,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: `1px solid ${colors.border.secondary}`,
    boxShadow: scrolled
      ? `0 8px 32px ${colors.shadow.xl}`
      : `0 4px 24px ${colors.shadow.lg}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const logoStyle = {
    background: colors.gradients.brand.secondary,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    filter: "drop-shadow(0 2px 4px rgba(168, 85, 247, 0.3))",
  };

  const mobileMenuStyle = {
    background: `linear-gradient(135deg, ${colors.background.card}, ${colors.surface.primary})`,
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderTop: `1px solid ${colors.border.blue}`,
    borderBottom: `1px solid ${colors.border.purple}`,
    boxShadow: `0 8px 32px ${colors.shadow.xl}, inset 0 1px 0 ${colors.border.light}`,
    borderRadius: "0 0 1rem 1rem",
  };

  return (
    <nav
      className="fixed w-full top-0 left-0 z-50 transition-all duration-300"
      style={navbarStyle}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group" aria-label="ThesisConnect Home">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden">
                <div
                  className="absolute inset-0 rounded-xl transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: colors.gradients.brand.primary,
                    boxShadow: `0 4px 20px ${colors.primary.blue[500]}40`,
                  }}
                ></div>
                <img
                  src="/1.png"
                  alt="ThesisConnect Logo"
                  className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40?text=Logo";
                  }}
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
                    opacity: 0.8,
                  }}
                >
                  Research Excellence
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-1">
            {(user
              ? [
                  { to: "/", label: "Home", icon: FaHome },
                  { to: "/explore", label: "Explore", icon: FaSearch },
                  { to: "/publications", label: "Publications", icon: FaBook },
                  { to: "/blogs", label: "Blog", icon: FaBlog },
                ]
              : [
                  { to: "/", label: "Home", icon: FaHome },
                  { to: "/explore", label: "Explore", icon: FaSearch },
                  { to: "/publications", label: "Publications", icon: FaBook },
                  { to: "/blogs", label: "Blog", icon: FaBlog },
                ]
            ).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative px-4 py-2 rounded-xl font-medium flex items-center space-x-2
                  transition-all duration-300 group
                  text-secondary hover:text-primary
                  hover:bg-[var(--background-glass)]
                  hover:-translate-y-[1px]"
                style={{
                  color: colors.text.secondary,
                }}
                aria-label={item.label}
              >
                <item.icon
                  className="text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                <span
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full group-hover:w-3/4 transition-all duration-500"
                  style={{
                    background: colors.gradients.accent.blue,
                    boxShadow: `0 0 8px ${colors.primary.blue[400]}60`,
                  }}
                ></span>
              </Link>
            ))}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown((prev) => !prev)}
                  className={`flex items-center space-x-2 p-1.5 rounded-full transition-all duration-300 hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-opacity-30 ${
                    hasNotifications ? "animate-pulse" : ""
                  }`}
                  style={{
                    color: colors.text.primary,
                    border: `2px solid ${
                      hasNotifications ? colors.accent.yellow[500] : colors.border.blue
                    }`,
                    background: `linear-gradient(135deg, ${colors.background.glass}, ${colors.primary.blue[50]}50)`,
                    boxShadow: hasNotifications
                      ? `0 0 0 rgba(245, 158, 11, 0.7), 0 0 0 rgba(245, 158, 11, 0.4)`
                      : `0 2px 10px ${colors.primary.blue[500]}20`,
                  }}
                  aria-expanded={showProfileDropdown}
                  aria-label="Toggle profile menu"
                >
                  <div className="relative">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(user.name || "User");
                        }}
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: colors.gradients.brand.primary,
                          color: colors.text.inverse,
                        }}
                      >
                        <FaUser size={14} aria-hidden="true" />
                      </div>
                    )}

                    {hasNotifications && (
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                        style={{
                          background: colors.accent.red[500],
                          borderColor: colors.background.card,
                        }}
                        aria-label="New notifications"
                      ></div>
                    )}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl overflow.tap overflow-hidden z-50 transform transition-all duration-300 origin-top-right animate-fadeIn"
                    style={{
                      background: `linear-gradient(135deg, ${colors.background.card}, ${colors.surface.primary})`,
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: `1px solid ${colors.border.secondary}`,
                      boxShadow: `0 10px 40px ${colors.shadow.xl}`,
                    }}
                    role="menu"
                  >
                    {/* User Info Header */}
                    <div className="p-4 border-b" style={{ borderColor: colors.border.light }}>
                      <div className="flex items-center space-x-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 transition-all duration-300"
                            style={{
                              ringColor: colors.primary.blue[400],
                              ringOffsetColor: colors.background.card,
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(user.name || "User");
                            }}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-offset-2 transition-all duration-300"
                            style={{
                              background: colors.gradients.brand.primary,
                              color: colors.text.inverse,
                              ringColor: colors.primary.blue[400],
                              ringOffsetColor: colors.background.card,
                            }}
                          >
                            <FaUser size={18} aria-hidden="true" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-medium truncate"
                            style={{ color: colors.text.primary }}
                          >
                            {user.name || "User"}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: colors.text.muted }}
                          >
                            {user.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2" role="none">
                      {[
                        { to: "/profile", label: "Profile", icon: FaUser, color: colors.primary.blue[500] },
                        { to: "/dashboard", label: "Dashboard", icon: FaChartBar, color: colors.primary.purple[500] },
                        { to: "/bookmarks", label: "Bookmarks", icon: FaBookmark, color: colors.accent.yellow[500] },
                        { to: "/settings", label: "Settings", icon: FaCog, color: colors.accent.green[500] },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-opacity-10 hover:translate-x-1"
                          style={{ color: colors.text.secondary }}
                          onClick={() => setShowProfileDropdown(false)}
                          role="menuitem"
                        >
                          <div
                            className="p-1.5 rounded-full"
                            style={{ background: `${item.color}20` }}
                          >
                            <item.icon size={14} style={{ color: item.color }} aria-hidden="true" />
                          </div>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      <div
                        className="my-1 h-px"
                        style={{
                          background: colors.border.light,
                        }}
                      ></div>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-opacity-10  hover:translate-x-1"
                        style={{ color: colors.accent.red[500] }}
                        role="menuitem"
                      >
                        <div
                          className="p-1.5 rounded-full"
                          style={{ background: `${colors.accent.red[500]}20` }}
                        >
                          <FaSignOutAlt
                            size={14}
                            style={{ color: colors.accent.red[500] }}
                            aria-hidden="true"
                          />
                        </div>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="relative px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300 font-medium overflow-hidden group"
                  style={{
                    background: colors.gradients.brand.primary,
                    color: colors.button.primary.text,
                    boxShadow: `0 4px 16px ${colors.primary.blue[500]}40`,
                    border: `1px solid ${colors.border.blue}`,
                  }}
                  aria-label="Sign up"
                >
                  <FaUserPlus className="text-sm relative z-10" aria-hidden="true" />
                  <span className="font-semibold relative z-10">Sign Up</span>
                </Link>
                <Link
                  to="/login"
                  className="relative px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300 font-medium border group"
                  style={{
                    backgroundColor: "transparent",
                    color: colors.text.primary,
                    borderColor: colors.border.primary,
                    backdropFilter: "blur(10px)",
                  }}
                  aria-label="Login"
                >
                  <FaSignInAlt className="text-sm" aria-hidden="true" />
                  <span className="font-medium">Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="relative p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 group"
              style={{
                color: colors.text.secondary,
                backgroundColor: colors.background.glass,
                border: `1px solid ${colors.border.light}`,
                backdropFilter: "blur(10px)",
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
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
                aria-hidden="true"
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

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 rounded-2xl overflow-hidden animate-fadeIn"
            style={mobileMenuStyle}
            role="menu"
          >
            <div className="p-6 space-y-2">
              {(user
                ? [
                    { to: "/", label: "Home", icon: "🏠" },
                    { to: "/dashboard", label: "Dashboard", icon: "📊" },
                    { to: "/explore", label: "Explore", icon: "🔍" },
                    { to: "/publications", label: "Publications", icon: "📚" },
                    { to: "/blogs", label: "Blog", icon: "📝" },
                  ]
                : [
                    { to: "/", label: "Home", icon: "🏠" },
                    { to: "/explore", label: "Explore", icon: "🔍" },
                    { to: "/publications", label: "Publications", icon: "📚" },
                    { to: "/blogs", label: "Blog", icon: "📝" },
                  ]
              ).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-[var(--background-glass)]"
                  style={{
                    color: colors.text.secondary,
                  }}
                  onClick={toggleMenu}
                  role="menuitem"
                  aria-label={item.label}
                >
                  <span className="text-lg mr-3" aria-hidden="true">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              <div
                className="my-4 h-px"
                style={{
                  background: colors.gradients.brand.primary,
                  opacity: 0.3,
                }}
              ></div>

              <div className="flex justify-center mb-4">
                <ThemeToggle />
              </div>

              <div className="space-y-3 pt-2">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center space-x-3 mb-4 px-4">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(user.name || "User");
                          }}
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            background: colors.gradients.brand.primary,
                            color: colors.text.inverse,
                          }}
                        >
                          <FaUser size={18} aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {user.name || "User"}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: colors.text.muted }}
                        >
                          {user.email || ""}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/#/profile"
                      className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-medium border"
                      style={{
                        background: colors.button.secondary.background,
                        color: colors.button.secondary.text,
                        borderColor: colors.button.secondary.border,
                      }}
                      onClick={toggleMenu}
                      role="menuitem"
                      aria-label="My Profile"
                    >
                      <FaUser className="mr-2 text-sm" aria-hidden="true" />
                      My Profile
                    </Link>

                    <Link
                      to="/bookmarks"
                      className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-medium border"
                      style={{
                        background: colors.button.secondary.background,
                        color: colors.button.secondary.text,
                        borderColor: colors.button.secondary.border,
                      }}
                      onClick={toggleMenu}
                      role="menuitem"
                      aria-label="Bookmarks"
                    >
                      <FaBookmark className="mr-2 text-sm" aria-hidden="true" />
                      Bookmarks
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                      className="w-full flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-semibold"
                      style={{
                        background: colors.gradients.brand.primary,
                        color: colors.button.primary.text,
                        boxShadow: `0 4px 16px ${colors.primary.blue[500]}30`,
                      }}
                      role="menuitem"
                      aria-label="Logout"
                    >
                      <FaSignOutAlt className="mr-2 text-sm" aria-hidden="true" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-semibold"
                      style={{
                        background: colors.gradients.brand.primary,
                        color: colors.button.primary.text,
                        boxShadow: `0 4px 16px ${colors.primary.blue[500]}30`,
                      }}
                      onClick={toggleMenu}
                      role="menuitem"
                      aria-label="Sign Up"
                    >
                      <FaUserPlus className="mr-2 text-sm" aria-hidden="true" />
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-medium border"
                      style={{
                        backgroundColor: "transparent",
                        color: colors.text.primary,
                        borderColor: colors.border.primary,
                      }}
                      onClick={toggleMenu}
                      role="menuitem"
                      aria-label="Login"
                    >
                      <FaSignInAlt className="mr-2 text-sm" aria-hidden="true" />
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;