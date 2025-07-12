import { BookOpen, Tag, Users, Clock, Search, Filter, X } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function MyProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Dummy project data
  const projects = [
    {
      id: 1,
      title: 'GeoAI for Disaster Management',
      description: 'Developing a GeoAI model to predict flood risks in Bangladesh using satellite imagery and ML algorithms. Aims to improve early warning systems.',
      keywords: ['GeoAI', 'Machine Learning', 'Disaster Management', 'Satellite Imagery', 'Predictive Modeling'],
      status: 'In Progress',
      collaborators: ['Dr. Ali Khan, BRAC University'],
    },
    {
      id: 2,
      title: 'Deep Learning for Medical Image Analysis',
      description: 'Exploring convolutional neural networks (CNNs) to detect anomalies in X-ray images for early diagnosis of lung diseases.',
      keywords: ['Deep Learning', 'Computer Vision', 'Medical Imaging', 'CNN', 'Healthcare'],
      status: 'Completed',
      collaborators: [],
    },
    {
      id: 3,
      title: 'AI-Driven Sentiment Analysis for Social Media',
      description: 'Building an AI model to analyze sentiment in Bengali social media posts to understand public opinion on climate change policies.',
      keywords: ['AI', 'Sentiment Analysis', 'Natural Language Processing', 'Social Media', 'Climate Change'],
      status: 'Planning',
      collaborators: ['Sara Ahmed, Dhaka University'],
    },
    {
      id: 4,
      title: 'Blockchain for Secure Research Data Sharing',
      description: 'Investigating blockchain technology to ensure secure and transparent sharing of research datasets among collaborators.',
      keywords: ['Blockchain', 'Data Security', 'Research Collaboration', 'AI'],
      status: 'In Progress',
      collaborators: ['TechLab, BRAC University'],
    },
  ];

  // Get unique statuses and keywords for filters
  const statuses = ['All', ...new Set(projects.map(p => p.status))];
  const allKeywords = [...new Set(projects.flatMap(p => p.keywords))].sort();

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.keywords.some(keyword => 
                             keyword.toLowerCase().includes(searchTerm.toLowerCase())
                           );

      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;

      const matchesKeywords = selectedKeywords.length === 0 || 
                             selectedKeywords.every(keyword => 
                               project.keywords.includes(keyword)
                             );

      return matchesSearch && matchesStatus && matchesKeywords;
    });
  }, [projects, searchTerm, selectedStatus, selectedKeywords]);

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedKeywords([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-emerald-500';
      case 'In Progress': return 'text-sky-500';
      case 'Planning': return 'text-amber-500';
      default: return 'text-slate-500';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'In Progress': return 'bg-sky-100 text-sky-700 border-sky-300';
      case 'Planning': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen  from-slate-80 via-blue-90 to-purple-50">
      {/* Header */}
      <div className="backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Research Projects
              </span>
            </h1>
            <p className="text-white text-lg max-w-2xl mx-auto">
              Exploring cutting-edge technologies and innovative solutions for real-world challenges
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Filter Toggle and Add Project */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/80 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {(selectedStatus !== 'All' || selectedKeywords.length > 0) && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  )}
                </button>
                
                <button
                  onClick={() => alert('Add Project functionality would go here')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="border-t border-slate-200/60 pt-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Keywords Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Keywords</label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {allKeywords.map(keyword => (
                        <button
                          key={keyword}
                          onClick={() => handleKeywordToggle(keyword)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 ${
                            selectedKeywords.includes(keyword)
                              ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
                              : 'bg-white/80 text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm'
                          }`}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchTerm || selectedStatus !== 'All' || selectedKeywords.length > 0) && (
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

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <p className="text-slate-500 text-sm">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 rounded-xl p-8 max-w-md mx-auto shadow-lg border border-slate-200/60">
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No projects found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="group bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-slate-300/80 hover:shadow-xl hover:shadow-blue-200/30 transform hover:-translate-y-2 transition-all duration-300 shadow-lg"
              >
                {/* Project Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-3 leading-tight">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {project.title}
                    </span>
                  </h2>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusBadgeColor(project.status)} shadow-sm`}>
                      <Clock className="w-3 h-3" />
                      <span>{project.status}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Keywords */}
                {project.keywords && project.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Tag className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-slate-500">Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                      {project.keywords.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md border border-slate-200 shadow-sm">
                          +{project.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Collaborators */}
                {project.collaborators && project.collaborators.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-1 mb-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-slate-500">Collaborators</span>
                    </div>
                    <div className="text-slate-600 text-sm">
                      {project.collaborators.join(', ')}
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => alert(`View details for ${project.title}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}