import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUsers, FaBook } from "react-icons/fa";
import { colors } from '../styles/colors';
import { getButtonStyles } from '../styles/styleUtils';

export default function Home() {
  return (
    <div className="container mx-auto px-4 pt-36 pb-12" style={{ background: colors.gradients.background.main }}>
      {/* Hero Section */}
      <section className="relative text-white rounded-xl shadow-2xl p-10 mb-12 overflow-hidden" style={{ background: colors.gradients.background.hero }}>
        <div className="absolute inset-0 opacity-50 animate-pulse" style={{ background: colors.gradients.background.overlay }}></div>
        <div className="relative flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in" style={{ 
              background: colors.gradients.brand.secondary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome to ThesisConnect
            </h1>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
              Discover a platform to connect with researchers, find thesis partners, and collaborate on innovative projects.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/explore"
                className="font-medium px-6 py-3 rounded-full shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-300"
                style={{ 
                  background: colors.gradients.brand.dark,
                  color: colors.text.primary 
                }}
              >
                Explore Projects
              </Link>
              <Link
                to="/signup"
                className="font-medium px-6 py-3 rounded-full shadow-lg border-2 border-purple-400 hover:bg-purple-100 hover:text-gray-900 transform hover:scale-105 transition-all duration-300"
                style={{ 
                  color: colors.primary.purple[400],
                  backgroundColor: 'transparent'
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            {/* <img
              src={heroGif}
              alt="ThesisConnect Collaboration"
              className="w-full h-auto rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
            /> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 animate-fade-in" style={{ 
          background: colors.gradients.brand.secondary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Why ThesisConnect?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card shadow-xl hover:shadow-2xl transform hover:-translate-y-

1 transition-all duration-300" style={{ 
            backgroundColor: colors.background.secondary,
            color: colors.text.secondary 
          }}>
            <div className="card-body items-center text-center">
              <FaSearch className="text-4xl mb-4" style={{ color: colors.icon.primary }} />
              <h3 className="card-title" style={{ 
                background: colors.gradients.brand.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Discover Projects
              </h3>
              <p style={{ color: colors.text.secondary }}>Browse and join cutting-edge research projects tailored to your interests.</p>
            </div>
          </div>
          <div className="card shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300" style={{ 
            backgroundColor: colors.background.secondary,
            color: colors.text.secondary 
          }}>
            <div className="card-body items-center text-center">
              <FaUsers className="text-4xl mb-4" style={{ color: colors.icon.primary }} />
              <h3 className="card-title" style={{ 
                background: colors.gradients.brand.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Connect with Peers
              </h3>
              <p style={{ color: colors.text.secondary }}>Collaborate with researchers and students from around the world.</p>
            </div>
          </div>
          <div className="card shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300" style={{ 
            backgroundColor: colors.background.secondary,
            color: colors.text.secondary 
          }}>
            <div className="card-body items-center text-center">
              <FaBook className="text-4xl mb-4" style={{ color: colors.icon.primary }} />
              <h3 className="card-title" style={{ 
                background: colors.gradients.brand.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Access Resources
              </h3>
              <p style={{ color: colors.text.secondary }}>Find valuable resources and blogs to support your thesis journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center rounded-xl shadow-2xl p-10 animate-fade-in" style={{ 
        background: colors.gradients.brand.dark,
        color: colors.text.primary 
      }}>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Research Journey?</h2>
        <p className="mb-6 text-lg" style={{ color: colors.text.secondary }}>Join ThesisConnect today and take the first step towards impactful research.</p>
        <Link
          to="/signup"
          className="btn btn-lg border-none rounded-full px-8 py-3 shadow-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-800 transform hover:scale-105 transition-all duration-300"
          style={getButtonStyles('primary')}
        >
          Join Now
        </Link>
      </section>
    </div>
  );
}