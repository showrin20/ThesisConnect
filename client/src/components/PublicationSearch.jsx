import React, { useState } from 'react';
import axios from 'axios';
import { Search, ExternalLink, Users, Calendar, Book, Plus, Check } from 'lucide-react';

const PublicationSearch = ({ onPublicationAdd }) => {
  const [query, setQuery] = useState('');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingPubs, setAddingPubs] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=10`
      );
      setPublications(res.data.results || []);
    } catch (err) {
      console.error('Error fetching publications:', err);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

//   const handleAddToCollection = async (pub) => {
//     if (!onPublicationAdd) return;
    
//     setAddingPubs(prev => new Set(prev).add(pub.id));
    
//     try {
//       // Transform OpenAlex publication to our format
//       const publicationData = {
//         title: pub.title,
//         authors: pub.authorships?.slice(0, 5).map(a => a.author?.display_name).filter(Boolean) || [],
//         year: pub.publication_year || new Date().getFullYear(),
//         venue: pub.host_venue?.display_name || 'Unknown Venue',
//         type: pub.type_crossref || 'Journal',
//         doi: pub.doi,
//         abstract: pub.abstract_inverted_index ? 
//           Object.keys(pub.abstract_inverted_index).slice(0, 50).join(' ') + '...' : 
//           'No abstract available',
//         tags: pub.concepts?.slice(0, 5).map(c => c.display_name) || [],
//         citations: pub.cited_by_count || 0
//       };
      
//       await onPublicationAdd(publicationData);
      
//       // Keep the adding state for a moment to show success
//       setTimeout(() => {
//         setAddingPubs(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(pub.id);
//           return newSet;
//         });
//       }, 2000);
      
//     } catch (error) {
//       console.error('Error adding publication:', error);
//       setAddingPubs(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(pub.id);
//         return newSet;
//       });
//     }
//   }
//   ;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Search className="text-blue-400" size={24} />
          Browse External Publications
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter keywords (e.g., transformers, neural networks, machine learning)..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-3 rounded-lg hover:bg-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </button>
        </form>
      </div>

      {publications.length > 0 && (
        <div className="space-y-4">
          <p className="text-white/70 text-sm">Found {publications.length} publications</p>
          {publications.map((pub) => (
            <div key={pub.id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-white leading-tight">
                  {pub.title}
                </h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>
                      {pub.authorships?.slice(0, 3).map(a => a.author?.display_name).join(', ') || 'N/A'}
                      {pub.authorships?.length > 3 && ` +${pub.authorships.length - 3} more`}
                    </span>
                  </div>
                  
                  {pub.host_venue?.display_name && (
                    <div className="flex items-center gap-1">
                      <Book size={14} />
                      <span>{pub.host_venue.display_name}</span>
                    </div>
                  )}
                  
                  {pub.publication_year && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{pub.publication_year}</span>
                    </div>
                  )}

                  {pub.cited_by_count && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">📊</span>
                      <span>{pub.cited_by_count} citations</span>
                    </div>
                  )}
                </div>

                {pub.abstract_inverted_index && (
                  <p className="text-white/60 text-sm line-clamp-2">
                    {Object.keys(pub.abstract_inverted_index).slice(0, 30).join(' ')}...
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    {pub.concepts?.slice(0, 3).map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                      >
                        {concept.display_name}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* {onPublicationAdd && (
                      <button
                        onClick={() => handleAddToCollection(pub)}
                        disabled={addingPubs.has(pub.id)}
                        className="flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-all duration-200 disabled:opacity-50 text-sm"
                      >
                        {addingPubs.has(pub.id) ? (
                          <>
                            <Check size={14} />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            Add to Collection
                          </>
                        )}
                      </button>
                    )} */}
                    
                    <a
                      href={pub.primary_location?.source?.url || pub.doi || pub.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && publications.length === 0 && query && (
        <div className="text-center py-12">
          <Search className="mx-auto text-white/30 mb-4" size={48} />
          <p className="text-white/60">No publications found for "{query}"</p>
          <p className="text-white/40 text-sm mt-2">Try different keywords or check your spelling</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <Search className="mx-auto text-white/30 mb-4" size={48} />
          <p className="text-white/60">Enter keywords to search for publications</p>
          <p className="text-white/40 text-sm mt-2">Search millions of academic papers from OpenAlex</p>
        </div>
      )}
    </div>
  );
};

export default PublicationSearch;
