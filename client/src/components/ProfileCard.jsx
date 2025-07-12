import { ExternalLink, MapPin, BookOpen, Tag, Star, Users, Award, TrendingUp, Calendar, Eye, Heart, Share2 } from 'lucide-react';

export default function ProfileCard({ user }) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Card Content */}
      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Name and University */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                {user.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                <span className="text-sm truncate">{user.university}</span>
              </div>
            </div>
          </div>
          
          {/* Action Menu */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <Share2 className="w-4 h-4 text-gray-500 hover:text-blue-500" />
            </button>
          </div>
        </div>

        {/* Domain Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
            <BookOpen className="w-4 h-4 mr-1" />
            {user.domain}
          </span>
        </div>

        {/* Keywords Section */}
        {user.keywords && user.keywords.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Tag className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm font-medium text-gray-700">Research Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.keywords.slice(0, 4).map((keyword, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200 cursor-pointer"
                >
                  {keyword}
                </span>
              ))}
              {user.keywords.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.keywords.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 text-center">
            <BookOpen className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-900">
              {user.publications || Math.floor(Math.random() * 50) + 10}
            </div>
            <div className="text-xs text-gray-500">Papers</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-900">
              {user.citations || Math.floor(Math.random() * 1000) + 100}
            </div>
            <div className="text-xs text-gray-500">Citations</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 text-center">
            <Star className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-gray-900">
              {user.hIndex || Math.floor(Math.random() * 30) + 5}
            </div>
            <div className="text-xs text-gray-500">H-Index</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>View Profile</span>
          </button>
          
          {user.scholarLink && (
            <a 
              href={user.scholarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-1 hover:border-blue-300 hover:text-blue-600"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Scholar</span>
            </a>
          )}
        </div>

        {/* Hover Effect Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>
    </div>
  );
}