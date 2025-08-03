import { BookOpen, Tag, Calendar, MapPin, Search, Filter, X, ExternalLink, Award, Users, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Publications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedQuality, setSelectedQuality] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Sample publications data
  const publications = [
    {
      id: 1,
      title: 'Deep Learning Approaches for Flood Prediction Using Satellite Imagery in Bangladesh',
      authors: ['Your Name', 'Dr. Ali Khan', 'Dr. Sarah Ahmed'],
      year: 2024,
      venue: 'IEEE Transactions on Geoscience and Remote Sensing',
      type: 'Journal',
      genre: 'Machine Learning',
      quality: 'Q1',
      tags: ['Deep Learning', 'Satellite Imagery', 'Flood Prediction', 'Bangladesh', 'Computer Vision'],
      doi: '10.1109/TGRS.2024.1234567',
      abstract: 'This paper presents a novel deep learning framework for predicting flood events in Bangladesh using high-resolution satellite imagery and historical weather data.',
      citations: 15,
      location: 'United States'
    },
    {
      id: 2,
      title: 'Convolutional Neural Networks for Medical Image Analysis: A Comprehensive Review',
      authors: ['Your Name', 'Dr. Maria Rodriguez'],
      year: 2023,
      venue: 'International Conference on Computer Vision (ICCV)',
      type: 'Conference',
      genre: 'Computer Vision',
      quality: 'A*',
      tags: ['CNN', 'Medical Imaging', 'Deep Learning', 'Healthcare', 'X-ray Analysis'],
      doi: '10.1109/ICCV.2023.7890123',
      abstract: 'A comprehensive survey of CNN architectures and their applications in medical image analysis, covering recent advances and future directions.',
      citations: 42,
      location: 'Paris, France'
    }
  ];

  // Get unique values for filters
  const types = ['All', ...new Set(publications.map(p => p.type))];
  const genres = ['All', ...new Set(publications.map(p => p.genre))];
  const qualities = ['All', ...new Set(publications.map(p => p.quality))];
  const years = ['All', ...new Set(publications.map(p => p.year))].sort().reverse();
  const allTags = [...new Set(publications.flatMap(p => p.tags))].sort();

  // Filter publications
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           pub.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'All' || pub.type === selectedType;
      const matchesGenre = selectedGenre === 'All' || pub.genre === selectedGenre;
      const matchesQuality = selectedQuality === 'All' || pub.quality === selectedQuality;
      const matchesYear = selectedYear === 'All' || pub.year === selectedYear;
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => pub.tags.includes(tag));

      return matchesSearch && matchesType && matchesGenre && matchesQuality && matchesYear && matchesTags;
    });
  }, [publications, searchTerm, selectedType, selectedGenre, selectedQuality, selectedYear, selectedTags]);

  const handleTagToggle = (tag) => {
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
      case 'A*': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'A': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Q1': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Q2': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'B': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Journal': return 'bg-green-100 text-green-800 border-green-300';
      case 'Conference': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Workshop': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Publications
              </span>
            </h1>
            <p className="text-white text-lg max-w-2xl mx-auto">
              Research papers published in top-tier journals, conferences, and workshops
            </p>
            <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" />
                <span className="text-white">{publications.length} Publications</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-white" />
                <span className="text-white">{publications.reduce((sum, p) => sum + p.citations, 0)} Citations</span>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search publications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/80 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {(selectedType !== 'All' || selectedGenre !== 'All' || selectedQuality !== 'All' || selectedYear !== 'All' || selectedTags.length > 0) && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="border-t border-slate-200/60 pt-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Publication Type</label>
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
                    <label className="block text-sm font-medium text-slate-600 mb-2">Research Genre</label>
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
                    <label className="block text-sm font-medium text-slate-600 mb-2">Publication Quality</label>
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
                    <label className="block text-sm font-medium text-slate-600 mb-2">Publication Year</label>
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-600 mb-2">Research Tags</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
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

                {/* Clear Filters */}
                {(searchTerm || selectedType !== 'All' || selectedGenre !== 'All' || selectedQuality !== 'All' || selectedYear !== 'All' || selectedTags.length > 0) && (
                  <div className="flex justify-end">
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

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <p className="text-slate-500 text-sm">
                Showing {filteredPublications.length} of {publications.length} publications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publications List */}
      <div className="container mx-auto px-4 py-8">
        {filteredPublications.length === 0 ? (
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
                key={pub.id}
                className="group bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-slate-300/80 hover:shadow-xl hover:shadow-blue-200/30 transition-all duration-300 shadow-lg"
              >
                {/* Publication Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2 leading-tight">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {pub.title}
                      </span>
                    </h2>
                    
                    {/* Authors */}
                    <div className="flex items-center gap-1 mb-3">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600 text-sm">{pub.authors.join(', ')}</span>
                    </div>

                    {/* Venue and Year */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-600 text-sm font-medium">{pub.venue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-slate-600 text-sm">{pub.year}</span>
                      </div>
                      {pub.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span className="text-slate-600 text-sm">{pub.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(pub.type)} shadow-sm`}>
                      {pub.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getQualityColor(pub.quality)} shadow-sm`}>
                      {pub.quality}
                    </span>
                  </div>
                </div>

                {/* Abstract */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {pub.abstract}
                </p>

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-slate-500">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pub.tags.slice(0, 5).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                    {pub.tags.length > 5 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md border border-slate-200 shadow-sm">
                        +{pub.tags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200/60">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3 sm:mb-0">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>{pub.citations} citations</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">DOI:</span>
                      <span className="font-mono text-xs">{pub.doi}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`https://doi.org/${pub.doi}`, '_blank')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Paper</span>
                    </button>
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