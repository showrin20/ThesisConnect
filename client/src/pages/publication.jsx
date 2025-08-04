import { useState, useEffect, useMemo } from 'react';
import axios from '../axios'; // Use the configured axios instance
import { BookOpen, Tag, Calendar, MapPin, Search, Filter, X, ExternalLink, Award, Users, FileText } from 'lucide-react';

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedQuality, setSelectedQuality] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch real publications from backend API
  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/publications');
        setPublications(response.data?.data || []);
      } catch (error) {
        setError('Failed to load publications');
        console.error('Failed to fetch publications:', error);
        setPublications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  // Defensive fallback for empty data
  const types = ['All', ...new Set(publications.map(p => p.type))];
  const genres = ['All', ...new Set(publications.map(p => p.genre))];
  const qualities = ['All', ...new Set(publications.map(p => p.quality))];
  const years = ['All', ...new Set(publications.map(p => p.year))].sort().reverse();
  const allTags = [...new Set(publications.flatMap(p => p.tags || []))].sort();

  // Filtering logic (same as before)
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchesSearch = pub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.authors?.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           pub.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'All' || pub.type === selectedType;
      const matchesGenre = selectedGenre === 'All' || pub.genre === selectedGenre;
      const matchesQuality = selectedQuality === 'All' || pub.quality === selectedQuality;
      const matchesYear = selectedYear === 'All' || pub.year === selectedYear;
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => pub.tags?.includes(tag));

      return matchesSearch && matchesType && matchesGenre && matchesQuality && matchesYear && matchesTags;
    });
  }, [publications, searchTerm, selectedType, selectedGenre, selectedQuality, selectedYear, selectedTags]);

  // Helper functions
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedGenre('All');
    setSelectedQuality('All');
    setSelectedYear('All');
    setSelectedTags([]);
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Q1': return 'text-green-600 bg-green-100';
      case 'Q2': return 'text-blue-600 bg-blue-100';
      case 'Q3': return 'text-yellow-600 bg-yellow-100';
      case 'Q4': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Journal': return 'text-purple-600 bg-purple-100';
      case 'Conference': return 'text-blue-600 bg-blue-100';
      case 'Workshop': return 'text-green-600 bg-green-100';
      case 'Book Chapter': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Tag toggle, clearFilters, getQualityColor, getTypeColor remain same (no change needed)

  if (loading) return <div className="text-center p-8 text-white">Loading publications...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen from-slate-80 via-blue-90 to-purple-50">
      {/* Header */}
      <div className="backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Publications
              </span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Discover cutting-edge research and academic publications from our community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search publications..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/80 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <Filter size={16} />
                  Filters
                  {(selectedType !== 'All' || selectedGenre !== 'All' || selectedQuality !== 'All' || selectedYear !== 'All' || selectedTags.length > 0) && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border-t border-slate-200/60 pt-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Genre</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quality Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Quality</label>
                    <select
                      value={selectedQuality}
                      onChange={(e) => setSelectedQuality(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                    >
                      {qualities.map(quality => (
                        <option key={quality} value={quality}>{quality}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 ${
                            selectedTags.includes(tag)
                              ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
                              : 'bg-white/80 text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(searchTerm || selectedType !== 'All' || selectedGenre !== 'All' || selectedQuality !== 'All' || selectedYear !== 'All' || selectedTags.length > 0) && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Result Summary */}
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <p className="text-slate-500 text-sm">
                Showing {filteredPublications.length} of {publications.length} publications
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Publications Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading publications...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 rounded-xl p-8 max-w-md mx-auto shadow-lg border border-slate-200/60">
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No publications found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPublications.map((pub) => (
              <article
                key={pub._id || pub.id}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-slate-300/80 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Main Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-wrap items-start gap-3 mb-4">
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight flex-1">
                        {pub.title}
                      </h3>
                      
                      {/* Type Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(pub.type)}`}>
                        {pub.type}
                      </span>
                      
                      {/* Quality Badge */}
                      {pub.quality && pub.quality !== 'N/A' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getQualityColor(pub.quality)}`}>
                          {pub.quality}
                        </span>
                      )}
                    </div>

                    {/* Authors */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-slate-500" />
                      <p className="text-slate-600 text-sm">
                        {pub.authors?.join(', ') || 'Unknown authors'}
                      </p>
                    </div>

                    {/* Venue and Year */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600 text-sm font-medium">{pub.venue}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600 text-sm">{pub.year}</span>
                      </div>

                      {pub.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600 text-sm">{pub.location}</span>
                        </div>
                      )}

                      {pub.citations > 0 && (
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600 text-sm">{pub.citations} citations</span>
                        </div>
                      )}
                    </div>

                    {/* Abstract */}
                    {pub.abstract && (
                      <div className="mb-4">
                        <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">
                          {pub.abstract}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {pub.tags && pub.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-4 h-4 text-slate-500" />
                        <div className="flex flex-wrap gap-1">
                          {pub.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md hover:bg-slate-200 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                      <div className="flex items-center gap-3">
                        {pub.creator && (
                          <span className="text-xs text-slate-500">
                            Added by {pub.creator.name || 'Unknown'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {pub.doi && (
                          <a
                            href={`https://doi.org/${pub.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            DOI
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
