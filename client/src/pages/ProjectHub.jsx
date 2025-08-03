import { useState, useEffect } from 'react';
import ProjectForm from '../components/ProjectForm';
import ProjectCard from '../components/ProjectCard';
import axios from '../axios';

export default function ProjectHub() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/projects');
      
      // Handle both old and new response formats
      const projectsData = response.data.data || response.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(
        err.response?.data?.msg || 
        err.response?.data?.message || 
        'Failed to load projects. Please check your connection and try again.'
      );
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-slate-900 to-gray-800">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-slate-900 to-gray-800">
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Projects</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={fetchProjects}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-b from-slate-900 to-gray-800">
      <h1 className="text-3xl font-bold text-white mb-6">Project Hub</h1>
      <ProjectForm onProjectCreated={fetchProjects} />
      
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No projects found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {projects.map((project) => (
            <ProjectCard 
              key={project._id} 
              title={project.title}
              description={project.description}
              link={project.link}
              tags={project.tags}
              status={project.status}
              category={project.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}