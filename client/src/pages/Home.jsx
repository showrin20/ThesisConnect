import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUsers, FaBook } from "react-icons/fa";
import { colors } from '../styles/colors';
export default function Home() {

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: colors.gradients.background.page,
        color: colors.text.primary 
      }}
    >
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Hero Section */}
        <section 
          className="relative rounded-2xl shadow-lg p-8 mb-12 overflow-hidden backdrop-blur-sm"
          style={{ 
            background: `linear-gradient(135deg, ${colors.background.card}, ${colors.surface.primary})`,
            border: `1px solid ${colors.border.secondary}`,
            boxShadow: `0 20px 40px ${colors.shadow.lg}`
          }}
        >
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              background: colors.gradients.background.overlay,
              backdropFilter: 'blur(20px)'
            }}
          ></div>
          
          <div className="relative flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h1 
                className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
                style={{ 
                  background: colors.gradients.brand.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 4px rgba(26, 32, 44, 0.3))'
                }}
              >
                Welcome to ThesisConnect
              </h1>
              <p 
                className="text-lg mb-6 leading-relaxed font-light"
                style={{ color: colors.text.secondary }}
              >
                Discover a platform to connect with researchers, find thesis partners, and collaborate on innovative projects in a comfortable environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/explore"
                  className="font-medium px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-center"
                  style={{ 
                    background: colors.gradients.brand.primary,
                    color: colors.text.primary,
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = colors.gradients.brand.secondary;
                    e.target.style.boxShadow = `0 8px 25px ${colors.shadow.xl}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = colors.gradients.brand.primary;
                    e.target.style.boxShadow = `0 4px 15px ${colors.shadow.lg}`;
                  }}
                >
                  Explore Projects
                </Link>
                <Link
                  to="/signup"
                  className="font-medium px-6 py-3 rounded-full shadow-lg border-2 transform hover:scale-105 transition-all duration-300 text-center backdrop-blur-sm"
                  style={{ 
                    color: colors.primary.purple[500],
                    backgroundColor: colors.background.glass,
                    borderColor: colors.primary.purple[500]
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primary.purple[500];
                    e.target.style.color = colors.text.primary;
                    e.target.style.boxShadow = `0 8px 25px rgba(217, 70, 239, 0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.background.glass;
                    e.target.style.color = colors.primary.purple[500];
                    e.target.style.boxShadow = `0 4px 15px ${colors.shadow.lg}`;
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div 
                className="w-64 h-64 rounded-full opacity-20 animate-pulse"
                style={{
                  background: colors.gradients.brand.primary,
                  filter: 'blur(40px)'
                }}
              ></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 
            className="text-2xl md:text-4xl font-bold text-center mb-8"
            style={{ 
              background: colors.gradients.brand.secondary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Why ThesisConnect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FaSearch,
                title: "Discover Projects",
                description: "Browse and join cutting-edge research projects tailored to your interests and academic goals."
              },
              {
                icon: FaUsers,
                title: "Connect with Peers", 
                description: "Collaborate with researchers and students from around the world in a supportive environment."
              },
              {
                icon: FaBook,
                title: "Access Resources",
                description: "Find valuable resources and blogs to support your thesis journey with expert guidance."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500 p-6 backdrop-blur-sm group"
                style={{ 
                  backgroundColor: colors.surface.primary,
                  border: `1px solid ${colors.border.secondary}`,
                  boxShadow: `0 10px 30px ${colors.shadow.default}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 40px ${colors.shadow.xl}`;
                  e.currentTarget.style.borderColor = colors.border.purple;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 30px ${colors.shadow.default}`;
                  e.currentTarget.style.borderColor = colors.border.secondary;
                }}
              >
                <div className="text-center">
                  <feature.icon 
                    className="text-4xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" 
                    style={{ color: colors.primary.blue[500] }} 
                  />
                  <h3 
                    className="text-xl font-bold mb-3"
                    style={{ 
                      background: colors.gradients.accent.blue,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-base leading-relaxed"
                    style={{ color: colors.text.secondary }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section 
          className="text-center rounded-2xl shadow-lg p-8 backdrop-blur-sm"
          style={{ 
            background: `linear-gradient(135deg, ${colors.surface.secondary}, ${colors.background.tertiary})`,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: `0 20px 40px ${colors.shadow.xl}`
          }}
        >
          <h2 
            className="text-2xl md:text-4xl font-bold mb-4"
            style={{ color: colors.text.primary }}
          >
            Ready to Start Your Research Journey?
          </h2>
          <p 
            className="mb-6 text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: colors.text.secondary }}
          >
            Join ThesisConnect today and take the first step towards impactful research in a comfortable, eye-friendly environment designed for extended use.
          </p>
          <Link
            to="/signup"
            className="inline-block font-semibold text-base px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            style={{
              background: colors.gradients.brand.primary,
              color: colors.text.primary,
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.gradients.brand.secondary;
              e.target.style.boxShadow = `0 12px 30px rgba(217, 70, 239, 0.4)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = colors.gradients.brand.primary;
              e.target.style.boxShadow = `0 6px 20px ${colors.shadow.lg}`;
            }}
          >
            Join Now - It's Free
          </Link>
        </section>
      </div>
    </div>
  );
}