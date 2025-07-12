import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { ExternalLink, MapPin, BookOpen, Tag, Star, TrendingUp, Edit2 } from 'lucide-react';

export default function MyProfile() {
  const { user } = useContext(UserContext); // Assume user is authenticated

  // Dummy data for Showrin Rahman
  const dummyUser = {
    name: 'Showrin Rahman',
    email: 'showrin.rahman@example.com',
    university: 'BRAC University, Dhaka',
    domain: 'Computer Science (AI, Machine Learning, GeoAI)',
    keywords: ['AI', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'GeoAI', 'Disaster Management'],
    scholarLink: 'https://scholar.google.com/citations?user=showrin123',
    githubLink: 'https://github.com/showrin20',
    publications: 5,
    citations: 120,
    hIndex: 3,
  };

  const profile = user || dummyUser; // Use authenticated user or dummy data

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-b from-slate-900 to-gray-800">
      <div className="relative max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-50 animate-pulse"></div>
        <div className="relative card bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 text-white rounded-xl shadow-2xl p-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
            My Profile
          </h1>

          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {profile.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              {/* Name and University */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {profile.name}
                </h2>
                <div className="flex items-center text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                  <span className="text-sm truncate">{profile.university}</span>
                </div>
                <div className="text-sm text-gray-300">{profile.email}</div>
              </div>
            </div>
            <Link
              to="/edit-profile"
              className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              aria-label="Edit my profile"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Domain and Links */}
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
              <BookOpen className="w-4 h-4 mr-1" />
              {profile.domain}
            </span>
            <div className="flex space-x-4 mt-4">
              {profile.scholarLink && (
                <a
                  href={profile.scholarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  aria-label="Visit Google Scholar profile"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Google Scholar</span>
                </a>
              )}
              {profile.githubLink && (
                <a
                  href={profile.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  aria-label="Visit GitHub profile"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>

          {/* Keywords Section */}
          {profile.keywords && profile.keywords.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Tag className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Research Keywords
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-700/50 text-gray-200 text-xs rounded-full hover:bg-blue-700/50 hover:text-blue-300 transition-colors duration-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-lg p-4 text-center">
              <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-bold">{profile.publications}</div>
              <div className="text-xs">Papers</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 text-green-800 rounded-lg p-4 text-center">
              <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-bold">{profile.citations}</div>
              <div className="text-xs">Citations</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 rounded-lg p-4 text-center">
              <Star className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-bold">{profile.hIndex}</div>
              <div className="text-xs">H-Index</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Link
              to="/dashboard"
              className="relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              aria-label="Go to dashboard"
            >
              Back to Dashboard
              <span className="absolute inset-0 rounded-full border border-blue-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}