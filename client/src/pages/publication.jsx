import { useState, useEffect, useMemo } from 'react';
import axios from '../axios'; // Use the configured axios instance
import { BookOpen, Tag, Calendar, MapPin, Search, Filter, X, ExternalLink, Award, Users, FileText } from 'lucide-react';
import { colors } from '../styles/colors';
import { getButtonStyles } from '../styles/styleUtils';

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
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const itemsPerPage = 3; // Changed to 3 publications per page

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

  // Filtering logic
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

  // Pagination logic
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const paginatedPublications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPublications.slice(startIndex, endIndex);
  }, [filteredPublications, currentPage, itemsPerPage]);

  // Helper functions
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedGenre('All');
    setSelectedQuality('All');
    setSelectedYear('All');
    setSelectedTags([]);
    setCurrentPage(1); // Reset to first page on filter clear
  };

  // Pagination navigation
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  if (loading) return (
    <div 
      className="text-center p-8 min-h-screen flex items-center justify-center"
      style={{ 
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})`,
        color: colors.text.primary 
      }}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary?.blue?.[400] || '#38bdf8' }}></div>
      <span className="ml-3">Loading publications...</span>
    </div>
  );
  
  if (error) return (
    <div 
      className="text-center p-8 min-h-screen flex items-center justify-center"
      style={{ 
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})`
      }}
    >
      <div 
        className="backdrop-blur-lg rounded-xl p-8 border"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary,
          color: colors.accent.red[400]
        }}
      >
        Error: {error}
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})` 
      }}
    >
      {/* Header */}
      <div 
        className="backdrop-blur-sm border-b shadow-sm"
        style={{ 
          borderColor: `${colors.border.secondary}80`,
          background: `${colors.background.glass}4D`
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span 
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${colors.primary?.blue?.[400] || '#38bdf8'}, ${colors.primary?.purple?.[500] || '#d946ef'}, ${colors.accent?.pink?.[500] || '#ec4899'})`
                }}
              >
                Publications
              </span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.text.primary }}>
              Discover cutting-edge research and academic publications from our community
            </p>
          </div>

          {/* Search and Filters */}
          <div 
            className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg"
            style={{
              backgroundColor: colors.background.glass,
              borderColor: colors.border.secondary
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.text.secondary }} />
                <input
                  type="text"
                  placeholder="Search publications..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: `${colors.background.glass}CC`,
                    borderColor: colors.border.secondary,
                    color: colors.text.primary,
                    '--placeholder-color': colors.text.secondary
                  }}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <div className="flex gap-3">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border rounded-lg transition-all duration-200 shadow-sm"
                  style={getButtonStyles('outline')}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, getButtonStyles('outline'));
                    e.target.style.backgroundColor = colors.button.outline.backgroundHover;
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.target.style, getButtonStyles('outline'));
                  }}
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
              <div 
                className="pt-4 animate-in slide-in-from-top-2 duration-200"
                style={{ borderTop: `1px solid ${colors.border.secondary}` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${colors.background.glass}CC`,
                        borderColor: colors.border.secondary,
                        color: colors.text.primary
                      }}
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Genre</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${colors.background.glass}CC`,
                        borderColor: colors.border.secondary,
                        color: colors.text.primary
                      }}
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quality Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Quality</label>
                    <select
                      value={selectedQuality}
                      onChange={(e) => { setSelectedQuality(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${colors.background.glass}CC`,
                        borderColor: colors.border.secondary,
                        color: colors.text.primary
                      }}
                    >
                      {qualities.map(quality => (
                        <option key={quality} value={quality}>{quality}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${colors.background.glass}CC`,
                        borderColor: colors.border.secondary,
                        color: colors.text.primary
                      }}
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
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Tags</label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="px-3 py-1 rounded-full text-sm border transition-all duration-200 shadow-sm"
                          style={
                            selectedTags.includes(tag)
                              ? {
                                  backgroundColor: colors.primary?.blue?.[500] || '#0ea5e9',
                                  color: colors.text.primary,
                                  borderColor: colors.primary?.blue?.[400] || '#38bdf8'
                                }
                              : getButtonStyles('outline')
                          }
                          onMouseEnter={(e) => {
                            if (!selectedTags.includes(tag)) {
                              e.target.style.backgroundColor = colors.button?.outline?.backgroundHover || 'rgba(217, 70, 239, 0.03)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedTags.includes(tag)) {
                              Object.assign(e.target.style, getButtonStyles('outline'));
                            }
                          }}
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
                      className="flex items-center gap-2 px-4 py-2 transition-colors duration-200"
                      style={{
                        color: colors.text.muted,
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = colors.text.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = colors.text.muted;
                      }}
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Result Summary */}
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border.secondary}` }}>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Showing {filteredPublications.length} of {publications.length} publications
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
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
            <div 
              className="backdrop-blur-lg rounded-xl p-8 max-w-md mx-auto shadow-lg border"
              style={{
                backgroundColor: colors.background.glass,
                borderColor: colors.border.secondary
              }}
            >
              <Search className="w-12 h-12 mx-auto mb-4" style={{ color: colors.text.secondary }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                No publications found
              </h3>
              <p style={{ color: colors.text.secondary }}>
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedPublications.map((pub) => (
              <article
                key={pub._id || pub.id}
                className="relative group"
              >
                {/* Gradient Background Effect */}
                <div 
                  className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary?.purple?.[600] || '#c026d3'}1A, ${colors.primary?.blue?.[600] || '#0284c7'}1A)`
                  }}
                ></div>
                
                {/* Main Card */}
                <div 
                  className="relative backdrop-blur-lg rounded-xl p-6 border hover:scale-[1.01] transition-all duration-300"
                  style={{
                    backgroundColor: colors.background.glass,
                    borderColor: colors.border.secondary
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.background.glass}CC`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.background.glass}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex flex-wrap items-start gap-3 mb-4">
                        <h3 
                          className="text-xl lg:text-2xl font-bold group-hover:text-blue-400 transition-colors leading-tight flex-1"
                          style={{ color: colors.text.primary , overflowWrap: 'anywhere' }}
                        >
                          {pub.title}
                        </h3>
                        
                        {/* Type Badge */}
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-semibold border"
                          style={{
                            backgroundColor: `${colors.primary?.purple?.[500] || '#d946ef'}33`,
                            color: colors.text.primary,
                            borderColor: `${colors.primary?.purple?.[500] || '#d946ef'}4D`
                          }}
                        >
                          {pub.type}
                        </span>
                        
                        {/* Quality Badge */}
                        {pub.quality && pub.quality !== 'N/A' && (
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-semibold border"
                            style={{
                              backgroundColor: `${colors.accent?.green?.[500] || '#38a169'}33`,
                              color: colors.text.primary,
                              borderColor: `${colors.accent?.green?.[500] || '#38a169'}4D`
                            }}
                          >
                            {pub.quality}
                          </span>
                        )}
                      </div>

                      {/* Authors */}
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4" style={{ color: colors.text.secondary }} />
                        <p className="text-sm" style={{ color: `${colors.text.secondary}B3` }}>
                          {pub.authors?.join(', ') || 'Unknown authors'}
                        </p>
                      </div>

                      {/* Venue and Year */}
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" style={{ color: colors.text.secondary }} />
                          <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            {pub.venue}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" style={{ color: colors.text.secondary }} />
                          <span className="text-sm" style={{ color: colors.text.secondary }}>
                            {pub.year}
                          </span>
                        </div>

                        {pub.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" style={{ color: colors.text.secondary }} />
                            <span className="text-sm" style={{ color: colors.text.secondary }}>
                              {pub.location}
                            </span>
                          </div>
                        )}

                        {pub.citations > 0 && (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" style={{ color: colors.text.secondary }} />
                            <span className="text-sm" style={{ color: colors.text.secondary }}>
                              {pub.citations} citations
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Abstract */}
                      {pub.abstract && (
                        <div className="mb-4">
                          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: `${colors.text.secondary}B3` }}>
                            {pub.abstract}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {pub.tags && pub.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <Tag className="w-4 h-4" style={{ color: colors.text.secondary }} />
                          <div className="flex flex-wrap gap-2">
                            {pub.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 rounded-md text-xs font-medium border transition-colors"
                                style={{
                                  backgroundColor: `${colors.primary?.blue?.[500] || '#0ea5e9'}33`,
                                  color: colors.text.primary,
                                  borderColor: `${colors.primary?.blue?.[500] || '#0ea5e9'}4D`
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${colors.border.secondary}` }}>
                        <div className="flex items-center gap-3">
                          {pub.creator && (
                            <span className="text-xs" style={{ color: `${colors.text.secondary}80` }}>
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
                              className="flex items-center gap-1 px-3 py-1 border rounded-lg transition-all duration-200 text-sm font-medium"
                              style={{
                                backgroundColor: `${colors.primary?.blue?.[500] || '#0ea5e9'}33`,
                                color: colors.text.primary,
                                borderColor: `${colors.primary?.blue?.[500] || '#0ea5e9'}4D`
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary?.blue?.[500] || '#0ea5e9'}4D`}
                              onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary?.blue?.[500] || '#0ea5e9'}33`}
                            >
                              <ExternalLink className="w-4 h-4" />
                              DOI
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                ...getButtonStyles('outline'),
                backgroundColor: currentPage === 1 ? `${colors.background.glass}80` : colors.background.glass,
                borderColor: colors.border.secondary,
                color: currentPage === 1 ? colors.text.muted : colors.text.primary,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.target.style.backgroundColor = colors.button.outline.backgroundHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.target.style.backgroundColor = colors.background.glass;
                }
              }}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              // Show first, last, current, and two pages before/after current page
              const shouldShowPage = page === 1 || page === totalPages || 
                                    (page >= currentPage - 2 && page <= currentPage + 2);
              if (!shouldShowPage) {
                // Show ellipsis for omitted pages
                if ((page === currentPage - 3 && currentPage > 4) || 
                    (page === currentPage + 3 && currentPage < totalPages - 3)) {
                  return <span key={page} className="px-3 py-2" style={{ color: colors.text.secondary }}>...</span>;
                }
                return null;
              }
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className="px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: currentPage === page ? colors.primary?.blue?.[500] || '#0ea5e9' : colors.background.glass,
                    borderColor: colors.border.secondary,
                    color: currentPage === page ? colors.text.primary : colors.text.secondary,
                    borderWidth: '1px'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== page) {
                      e.target.style.backgroundColor = colors.button.outline.backgroundHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== page) {
                      e.target.style.backgroundColor = colors.background.glass;
                    }
                  }}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                ...getButtonStyles('outline'),
                backgroundColor: currentPage === totalPages ? `${colors.background.glass}80` : colors.background.glass,
                borderColor: colors.border.secondary,
                color: currentPage === totalPages ? colors.text.muted : colors.text.primary,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.backgroundColor = colors.button.outline.backgroundHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.backgroundColor = colors.background.glass;
                }
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}