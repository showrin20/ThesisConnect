import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUsers, FaBook } from "react-icons/fa";
import heroGif from "../assets/home/hero.gif";
export default function Home() {
  return (
    <div className="container mx-auto px-4 pt-36 pb-12 bg-gradient-to-b from-slate-900 to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 text-white rounded-xl shadow-2xl p-10 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-50 animate-pulse"></div>
        <div className="relative flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-fade-in">
              Welcome to ThesisConnect
            </h1>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              Discover a platform to connect with researchers, find thesis partners, and collaborate on innovative projects.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/explore"
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Explore Projects
                <span className="absolute inset-0 rounded-full border border-blue-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
              <Link
                to="/signup"
                className="relative border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started
                <span className="absolute inset-0 rounded-full border border-purple-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
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
        <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 animate-fade-in">
          Why ThesisConnect?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-slate-800 text-gray-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="card-body items-center text-center">
              <FaSearch className="text-4xl text-blue-400 mb-4" />
              <h3 className="card-title bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Discover Projects
              </h3>
              <p className="text-gray-300">Browse and join cutting-edge research projects tailored to your interests.</p>
            </div>
          </div>
          <div className="card bg-slate-800 text-gray-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="card-body items-center text-center">
              <FaUsers className="text-4xl text-blue-400 mb-4" />
              <h3 className="card-title bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Connect with Peers
              </h3>
              <p className="text-gray-300">Collaborate with researchers and students from around the world.</p>
            </div>
          </div>
          <div className="card bg-slate-800 text-gray-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="card-body items-center text-center">
              <FaBook className="text-4xl text-blue-400 mb-4" />
              <h3 className="card-title bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Access Resources
              </h3>
              <p className="text-gray-300">Find valuable resources and blogs to support your thesis journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl p-10 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Research Journey?</h2>
        <p className="text-gray-200 mb-6 text-lg">Join ThesisConnect today and take the first step towards impactful research.</p>
        <Link
          to="/signup"
          className="relative btn btn-lg bg-white text-purple-600 hover:bg-gray-100 border-none rounded-full px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Join Now
          <span className="absolute inset-0 rounded-full border border-purple-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
        </Link>
      </section>
    </div>
  );
}